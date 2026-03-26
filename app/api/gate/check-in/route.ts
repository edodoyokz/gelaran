import { type NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createRequestLogger } from "@/lib/logging/logger";
import { attachRequestIdHeader, createRequestContext } from "@/lib/logging/request";
import { checkInTicket } from "@/lib/gate/check-in";

export async function POST(request: NextRequest) {
    const requestContext = createRequestContext(request, "/api/gate/check-in");
    const logger = createRequestLogger(requestContext);
    const fail = (message: string, code: number, details?: Record<string, unknown>) =>
        attachRequestIdHeader(errorResponse(message, code, details), requestContext.requestId);
    const ok = <T>(data: T, status = 200) =>
        attachRequestIdHeader(successResponse(data, undefined, status), requestContext.requestId);

    try {
        const deviceToken = request.headers.get("x-device-token");
        const { ticketCode } = await request.json();

        logger.info("gate.check_in.request_received", "Gate check-in request received", {
            hasDeviceToken: Boolean(deviceToken),
            hasTicketCode: Boolean(ticketCode),
        });

        const result = await checkInTicket({
            deviceToken,
            ticketCode,
            deviceInfo: request.headers.get("user-agent"),
            ipAddress: request.headers.get("x-forwarded-for"),
        });

        if (result.result === "SUCCESS") {
            logger.info("gate.check_in.success", "Gate check-in succeeded", {
                bookingCode: result.ticket.bookingCode,
                ticketCode: result.ticket.id,
            });

            return ok({
                result: result.result,
                ticket: result.ticket,
            });
        }

        logger.warn("gate.check_in.rejected", "Gate check-in rejected", {
            result: result.result,
            statusCode: result.status,
        });

        return fail(result.message, result.status, {
            result: result.result,
            checkedInAt: result.checkedInAt,
        });
    } catch (error) {
        logger.error("gate.check_in.failed", "Gate check-in failed", error);
        return fail("Gagal check-in", 500);
    }
}
