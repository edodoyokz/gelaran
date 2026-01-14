import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Authentication required" } },
        { status: 401 }
      );
    }

    const organizerProfile = await prisma.organizerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!organizerProfile) {
      return NextResponse.json(
        { success: false, error: { message: "Organizer profile not found" } },
        { status: 404 }
      );
    }

    const teamMembers = await prisma.organizerTeamMember.findMany({
      where: { organizerProfileId: organizerProfile.id },
    });

    const membersWithUsers = await Promise.all(
      teamMembers.map(async (member) => {
        const memberUser = await prisma.user.findUnique({
          where: { id: member.userId },
          select: { id: true, name: true, email: true, avatarUrl: true },
        });
        return {
          id: member.id,
          userId: member.userId,
          role: member.role,
          permissions: member.permissions,
          isActive: member.isActive,
          invitedAt: member.invitedAt,
          acceptedAt: member.acceptedAt,
          user: memberUser,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: membersWithUsers,
    });
  } catch (error) {
    console.error("Get team members error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get team members" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, permissions } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: { message: "Email is required" } },
        { status: 400 }
      );
    }

    if (!role || !["MANAGER", "SCANNER", "FINANCE"].includes(role)) {
      return NextResponse.json(
        { success: false, error: { message: "Valid role is required (MANAGER, SCANNER, FINANCE)" } },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Authentication required" } },
        { status: 401 }
      );
    }

    const organizerProfile = await prisma.organizerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, organizationName: true },
    });

    if (!organizerProfile) {
      return NextResponse.json(
        { success: false, error: { message: "Organizer profile not found" } },
        { status: 404 }
      );
    }

    const invitedUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, name: true, email: true },
    });

    if (!invitedUser) {
      return NextResponse.json(
        { success: false, error: { message: "User not found. They must register first." } },
        { status: 404 }
      );
    }

    if (invitedUser.id === user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Cannot add yourself as team member" } },
        { status: 400 }
      );
    }

    const existingMember = await prisma.organizerTeamMember.findFirst({
      where: {
        organizerProfileId: organizerProfile.id,
        userId: invitedUser.id,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: { message: "User is already a team member" } },
        { status: 400 }
      );
    }

    const teamMember = await prisma.organizerTeamMember.create({
      data: {
        organizerProfileId: organizerProfile.id,
        userId: invitedUser.id,
        role,
        permissions: permissions || null,
        isActive: true,
        acceptedAt: new Date(),
      },
    });

    try {
      await resend.emails.send({
        from: `BSC Events <${process.env.RESEND_FROM_EMAIL || "noreply@bsc.events"}>`,
        to: invitedUser.email,
        subject: `Anda ditambahkan ke tim ${organizerProfile.organizationName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Selamat Datang di Tim!</h1>
            </div>
            <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
              <p style="font-size: 18px; margin-bottom: 24px;">Halo ${invitedUser.name || ""},</p>
              <p>Anda telah ditambahkan sebagai <strong>${role}</strong> di tim <strong>${organizerProfile.organizationName}</strong>.</p>
              
              <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
                Anda sekarang dapat mengakses dashboard organizer untuk mengelola event.
              </p>
            </div>
          </body>
          </html>
        `,
        text: `
Halo ${invitedUser.name || ""},

Anda telah ditambahkan sebagai ${role} di tim ${organizerProfile.organizationName}.

Anda sekarang dapat mengakses dashboard organizer untuk mengelola event.
        `.trim(),
      });
    } catch (emailError) {
      console.error("Failed to send team invitation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: teamMember.id,
        userId: teamMember.userId,
        role: teamMember.role,
        permissions: teamMember.permissions,
        isActive: teamMember.isActive,
        invitedAt: teamMember.invitedAt,
        acceptedAt: teamMember.acceptedAt,
        user: invitedUser,
      },
    });
  } catch (error) {
    console.error("Create team member error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create team member" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, role, permissions, isActive } = body;

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: { message: "Member ID is required" } },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Authentication required" } },
        { status: 401 }
      );
    }

    const organizerProfile = await prisma.organizerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!organizerProfile) {
      return NextResponse.json(
        { success: false, error: { message: "Organizer profile not found" } },
        { status: 404 }
      );
    }

    const existingMember = await prisma.organizerTeamMember.findFirst({
      where: { id: memberId, organizerProfileId: organizerProfile.id },
    });

    if (!existingMember) {
      return NextResponse.json(
        { success: false, error: { message: "Team member not found" } },
        { status: 404 }
      );
    }

    const teamMember = await prisma.organizerTeamMember.update({
      where: { id: memberId },
      data: {
        role: role !== undefined ? role : existingMember.role,
        permissions: permissions !== undefined ? permissions : existingMember.permissions,
        isActive: isActive !== undefined ? isActive : existingMember.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: teamMember.id,
        userId: teamMember.userId,
        role: teamMember.role,
        permissions: teamMember.permissions,
        isActive: teamMember.isActive,
        invitedAt: teamMember.invitedAt,
        acceptedAt: teamMember.acceptedAt,
      },
    });
  } catch (error) {
    console.error("Update team member error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update team member" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: { message: "Member ID is required" } },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Authentication required" } },
        { status: 401 }
      );
    }

    const organizerProfile = await prisma.organizerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!organizerProfile) {
      return NextResponse.json(
        { success: false, error: { message: "Organizer profile not found" } },
        { status: 404 }
      );
    }

    const member = await prisma.organizerTeamMember.findFirst({
      where: { id: memberId, organizerProfileId: organizerProfile.id },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: { message: "Team member not found" } },
        { status: 404 }
      );
    }

    await prisma.organizerTeamMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Team member removed successfully" },
    });
  } catch (error) {
    console.error("Delete team member error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete team member" } },
      { status: 500 }
    );
  }
}
