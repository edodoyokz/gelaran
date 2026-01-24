import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

// Helper for consistent responses
const jsonError = (message: string, status: number) =>
    NextResponse.json({ success: false, error: { message } }, { status });

const jsonSuccess = (data: unknown) =>
    NextResponse.json({ success: true, data });

// GET - Fetch venue layout with sections
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return jsonError("Authentication required", 401);
        }

        const event = await prisma.event.findFirst({
            where: {
                id: eventId,
                organizerId: user.id,
            },
            select: {
                id: true,
                title: true,
                hasSeatingChart: true,
                venueLayout: true,
                venueSections: {
                    where: { isActive: true },
                    orderBy: { sortOrder: "asc" },
                    select: {
                        id: true,
                        name: true,
                        colorHex: true,
                        capacity: true,
                        sectionType: true,
                        positionX: true,
                        positionY: true,
                        width: true,
                        height: true,
                        rotation: true,
                        sortOrder: true,
                    },
                },
            },
        });

        if (!event) {
            return jsonError("Event tidak ditemukan", 404);
        }

        return jsonSuccess({
            eventId: event.id,
            eventTitle: event.title,
            hasSeatingChart: event.hasSeatingChart,
            layout: event.venueLayout,
            sections: event.venueSections,
        });
    } catch (error) {
        console.error("Error fetching venue layout:", error);
        return jsonError("Gagal memuat venue layout", 500);
    }
}

// PUT - Update section positions (batch)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const body = await request.json();
        const { sections } = body;

        if (!Array.isArray(sections)) {
            return jsonError("Invalid sections data", 400);
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return jsonError("Authentication required", 401);
        }

        const event = await prisma.event.findFirst({
            where: { id: eventId, organizerId: user.id },
        });

        if (!event) {
            return jsonError("Event tidak ditemukan", 404);
        }

        // Update sections in a transaction
        await prisma.$transaction(
            sections.map((section: {
                id: string;
                positionX?: number;
                positionY?: number;
                width?: number;
                height?: number;
                rotation?: number;
                sectionType?: "SEATED" | "STANDING" | "MIXED";
            }) =>
                prisma.venueSection.update({
                    where: { id: section.id },
                    data: {
                        positionX: section.positionX,
                        positionY: section.positionY,
                        width: section.width,
                        height: section.height,
                        rotation: section.rotation,
                        sectionType: section.sectionType,
                    },
                })
            )
        );

        return jsonSuccess({ message: "Berhasil update layout" });
    } catch (error) {
        console.error("Error updating venue layout:", error);
        return jsonError("Gagal update layout", 500);
    }
}

// POST - Update background image
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const body = await request.json();
        const { imageUrl, imageWidth, imageHeight, scale } = body;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return jsonError("Authentication required", 401);
        }

        const event = await prisma.event.findFirst({
            where: { id: eventId, organizerId: user.id },
        });

        if (!event) {
            return jsonError("Event tidak ditemukan", 404);
        }

        // Upsert venue layout
        const layout = await prisma.venueLayout.upsert({
            where: { eventId },
            create: {
                eventId,
                imageUrl,
                imageWidth,
                imageHeight,
                scale: scale || 1,
            },
            update: {
                imageUrl,
                imageWidth,
                imageHeight,
                scale: scale || 1,
            },
        });

        return jsonSuccess({ layout });
    } catch (error) {
        console.error("Error updating venue layout image:", error);
        return jsonError("Gagal update gambar", 500);
    }
}

// DELETE - Remove background image
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return jsonError("Authentication required", 401);
        }

        const event = await prisma.event.findFirst({
            where: { id: eventId, organizerId: user.id },
        });

        if (!event) {
            return jsonError("Event tidak ditemukan", 404);
        }

        // Delete venue layout
        await prisma.venueLayout.deleteMany({
            where: { eventId },
        });

        return jsonSuccess({ message: "Gambar dihapus" });
    } catch (error) {
        console.error("Error deleting venue layout:", error);
        return jsonError("Gagal hapus gambar", 500);
    }
}
