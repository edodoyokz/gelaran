import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

type VerifyAdminResult =
    | { admin: { id: string } }
    | { error: string; status: 401 | 403 };

async function verifyAdminByEmail(): Promise<VerifyAdminResult> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
        return { error: "Unauthorized", status: 401 };
    }

    const admin = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, role: true },
    });
    if (!admin || !["ADMIN", "SUPER_ADMIN"].includes(admin.role)) {
        return { error: "Admin access required", status: 403 };
    }

    return { admin: { id: admin.id } };
}

export async function GET(request: NextRequest) {
    try {
        const auth = await verifyAdminByEmail();
        if ("error" in auth) {
            return errorResponse(auth.error, auth.status);
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || "";
        const eventId = searchParams.get("eventId") || "";
        const page = Number(searchParams.get("page") || "1");
        const limit = Number(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (eventId) where.eventId = eventId;

        const [requests, total] = await Promise.all([
            prisma.complimentaryTicketRequest.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    event: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            organizer: {
                                select: {
                                    id: true,
                                    name: true,
                                    organizerProfile: {
                                        select: {
                                            organizationName: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    requestedBy: {
                        select: { id: true, name: true, email: true },
                    },
                    reviewedBy: {
                        select: { id: true, name: true, email: true },
                    },
                    items: {
                        include: {
                            ticketType: {
                                select: { id: true, name: true, basePrice: true },
                            },
                        },
                    },
                    bookings: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                        select: {
                            id: true,
                            bookingCode: true,
                            status: true,
                            createdAt: true,
                        },
                    },
                },
            }),
            prisma.complimentaryTicketRequest.count({ where }),
        ]);

        return successResponse(
            requests.map((request) => ({
                ...request,
                items: request.items.map((item) => ({
                    ...item,
                    ticketType: {
                        ...item.ticketType,
                        basePrice: Number(item.ticketType.basePrice),
                    },
                })),
            })),
            {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        );
    } catch (error) {
        console.error("Error fetching complimentary requests:", error);
        return errorResponse("Failed to fetch complimentary requests", 500);
    }
}
