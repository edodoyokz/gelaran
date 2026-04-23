import { NotificationType } from "@prisma/client";
import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { createAdminClient } from "@/lib/supabase/server";
import { getOptionalAuthenticatedAppUser } from "@/lib/auth/route-auth";
import { getLocalUserId, getBookingAccessError } from "@/lib/auth/local-identity";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createRequestLogger } from "@/lib/logging/logger";
import { attachRequestIdHeader, createRequestContext } from "@/lib/logging/request";
import { createPaymentProofReadUrl } from "@/lib/storage/payment-proof";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const requestContext = createRequestContext(request, "/api/bookings/[bookingId]/upload-proof");
  const logger = createRequestLogger(requestContext);

  const fail = (message: string, code = 400, details?: Record<string, unknown>) => {
    logger.warn("upload_proof.request_failed", message, {
      statusCode: code,
      details,
    });

    return attachRequestIdHeader(
      errorResponse(message, code, details),
      requestContext.requestId
    );
  };

  const ok = <T>(data: T, status = 200) =>
    attachRequestIdHeader(successResponse(data, undefined, status), requestContext.requestId);

  try {
    logger.info("upload_proof.request_received", "Upload payment proof request received");

    const authContext = await getOptionalAuthenticatedAppUser();

    if (authContext && "error" in authContext) {
      return fail(authContext.error, authContext.status);
    }

    getLocalUserId(authContext);
    const { bookingId } = await params;

    // Get booking with transaction
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        transaction: true,
        event: {
          select: {
            id: true,
            title: true,
            organizerId: true,
          },
        },
      },
    });

    if (!booking) {
      return fail("Booking not found", 404);
    }

    // Check access - either user owns booking or guest email matches
    const accessError = getBookingAccessError(
      { userId: booking.userId, guestEmail: booking.guestEmail },
      authContext
    );

    if (accessError) {
      return fail(accessError.message, accessError.status);
    }

    // Validate booking status
    if (booking.status !== "PENDING" && booking.status !== "AWAITING_PAYMENT") {
      return fail("Booking status must be PENDING or AWAITING_PAYMENT", 400, {
        currentStatus: booking.status,
      });
    }

    // Validate payment status
    if (booking.paymentStatus !== "UNPAID") {
      return fail("Payment status must be UNPAID", 400, {
        currentPaymentStatus: booking.paymentStatus,
      });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return fail("File is required", 400);
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return fail("Invalid file type. Allowed: jpg, png, pdf", 400, {
        receivedType: file.type,
        allowedTypes: ALLOWED_MIME_TYPES,
      });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return fail("File size exceeds 5MB limit", 400, {
        fileSize: file.size,
        maxSize: MAX_FILE_SIZE,
      });
    }

    // Upload to Supabase
    const storage = createAdminClient();
    const timestamp = Date.now();
    const path = `${bookingId}/${timestamp}-${file.name}`;

    const { error: uploadError } = await storage.storage
      .from("payment-proofs")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      logger.error("upload_proof.upload_failed", "Failed to upload file", uploadError);
      return fail(`Upload failed: ${uploadError.message}`, 500);
    }

    // Update or create transaction
    const now = new Date();
    let transaction = booking.transaction;

    if (transaction) {
      // Update existing transaction
      transaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          paymentProofUrl: path,
          paymentProofUploadedAt: now,
          verificationStatus: "PROOF_UPLOADED",
        },
      });
    } else {
      // Create new transaction for manual bank transfer
      const transactionCode = `TRX-${booking.bookingCode}-${Date.now().toString(36).toUpperCase()}`;
      
      transaction = await prisma.transaction.create({
        data: {
          bookingId: booking.id,
          transactionCode,
          paymentGateway: "MANUAL_BANK_TRANSFER",
          paymentMethod: "BANK_TRANSFER",
          amount: booking.totalAmount,
          currency: "IDR",
          status: "PENDING",
          paymentProofUrl: path,
          paymentProofUploadedAt: now,
          verificationStatus: "PROOF_UPLOADED",
        },
      });
    }

    // Update booking status if still PENDING
    if (booking.status === "PENDING") {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "AWAITING_PAYMENT",
        },
      });
    }

    // Create notifications for admins
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ["SUPER_ADMIN", "ADMIN"] },
      },
      select: { id: true },
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: NotificationType.PAYMENT_RECEIVED,
          title: "New Payment Proof Uploaded",
          message: `Payment proof uploaded for booking ${booking.bookingCode}`,
          data: {
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
            transactionId: transaction.id,
            eventId: booking.event.id,
            eventTitle: booking.event.title,
            amount: Number(booking.totalAmount),
          },
        })),
      });
    }

    logger.info("upload_proof.success", "Payment proof uploaded successfully", {
      bookingId: booking.id,
      transactionId: transaction.id,
      proofPath: path,
    });

    const paymentProofUrl = await createPaymentProofReadUrl(storage, transaction.paymentProofUrl);

    return ok(
      {
        booking: {
          id: booking.id,
          bookingCode: booking.bookingCode,
          status: booking.status === "PENDING" ? "AWAITING_PAYMENT" : booking.status,
          paymentStatus: booking.paymentStatus,
        },
        transaction: {
          id: transaction.id,
          transactionCode: transaction.transactionCode,
          paymentProofUrl,
          paymentProofUploadedAt: transaction.paymentProofUploadedAt,
          verificationStatus: transaction.verificationStatus,
        },
      },
      200
    );
  } catch (error) {
    logger.error("upload_proof.error", "Failed to upload payment proof", error);
    return fail("Failed to upload payment proof", 500);
  }
}
