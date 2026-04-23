import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createServiceClient } from "@/lib/supabase/server";
import { requireOrganizer } from "@/lib/auth/route-auth";
import { validateUploadFile } from "@/lib/storage/upload";

function buildUploadPath(eventId: string, fileName: string, uploadType: string) {
  const fileExt = fileName.split(".").pop()?.toLowerCase() || "bin";
  const safeType = uploadType === "venue-layout" ? "venue-layout" : "assets";
  return `${eventId}/${safeType}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${fileExt}`;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireOrganizer();

    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, error: { message: authResult.error } },
        { status: authResult.status }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const eventId = formData.get("eventId");
    const uploadType = String(formData.get("type") || "asset");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: { message: "File is required" } },
        { status: 400 }
      );
    }

    if (typeof eventId !== "string" || !eventId) {
      return NextResponse.json(
        { success: false, error: { message: "Event ID is required" } },
        { status: 400 }
      );
    }

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: authResult.user.id,
      },
      select: { id: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    try {
      validateUploadFile(file, "events");
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: { message: error instanceof Error ? error.message : "Invalid upload file" },
        },
        { status: 400 }
      );
    }

    const storage = await createServiceClient();
    const path = buildUploadPath(eventId, file.name, uploadType);
    const { error } = await storage.storage.from("events").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: { message: `Upload failed: ${error.message}` } },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = storage.storage.from("events").getPublicUrl(path);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path,
      bucket: "events",
    });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to upload file" } },
      { status: 500 }
    );
  }
}
