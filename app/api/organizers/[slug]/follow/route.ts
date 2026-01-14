import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json(
                { success: false, error: { message: "Silakan login terlebih dahulu" } },
                { status: 401 }
            );
        }

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { id: true },
        });

        if (!dbUser) {
            return NextResponse.json(
                { success: false, error: { message: "User tidak ditemukan" } },
                { status: 404 }
            );
        }

        const { slug } = await params;

        const organizerProfile = await prisma.organizerProfile.findUnique({
            where: { organizationSlug: slug },
        });

        if (!organizerProfile) {
            return NextResponse.json(
                { success: false, error: { message: "Organizer tidak ditemukan" } },
                { status: 404 }
            );
        }

        if (organizerProfile.userId === dbUser.id) {
            return NextResponse.json(
                { success: false, error: { message: "Tidak bisa follow diri sendiri" } },
                { status: 400 }
            );
        }

        const existingFollow = await prisma.organizerFollower.findUnique({
            where: {
                organizerProfileId_userId: {
                    organizerProfileId: organizerProfile.id,
                    userId: dbUser.id,
                },
            },
        });

        if (existingFollow) {
            return NextResponse.json(
                { success: false, error: { message: "Sudah follow organizer ini" } },
                { status: 400 }
            );
        }

        await prisma.organizerFollower.create({
            data: {
                organizerProfileId: organizerProfile.id,
                userId: dbUser.id,
                notifyNewEvents: true,
            },
        });

        const followersCount = await prisma.organizerFollower.count({
            where: { organizerProfileId: organizerProfile.id },
        });

        return NextResponse.json({
            success: true,
            data: {
                isFollowing: true,
                followersCount,
            },
        });
    } catch (error) {
        console.error("Error following organizer:", error);
        return NextResponse.json(
            { success: false, error: { message: "Gagal follow organizer" } },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json(
                { success: false, error: { message: "Silakan login terlebih dahulu" } },
                { status: 401 }
            );
        }

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { id: true },
        });

        if (!dbUser) {
            return NextResponse.json(
                { success: false, error: { message: "User tidak ditemukan" } },
                { status: 404 }
            );
        }

        const { slug } = await params;

        const organizerProfile = await prisma.organizerProfile.findUnique({
            where: { organizationSlug: slug },
        });

        if (!organizerProfile) {
            return NextResponse.json(
                { success: false, error: { message: "Organizer tidak ditemukan" } },
                { status: 404 }
            );
        }

        await prisma.organizerFollower.deleteMany({
            where: {
                organizerProfileId: organizerProfile.id,
                userId: dbUser.id,
            },
        });

        const followersCount = await prisma.organizerFollower.count({
            where: { organizerProfileId: organizerProfile.id },
        });

        return NextResponse.json({
            success: true,
            data: {
                isFollowing: false,
                followersCount,
            },
        });
    } catch (error) {
        console.error("Error unfollowing organizer:", error);
        return NextResponse.json(
            { success: false, error: { message: "Gagal unfollow organizer" } },
            { status: 500 }
        );
    }
}
