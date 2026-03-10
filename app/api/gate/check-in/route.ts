import { type NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { checkInTicket } from "@/lib/gate/check-in";

export async function POST(request: NextRequest) {
    try {
        const deviceToken = request.headers.get("x-device-token");
        const { ticketCode } = await request.json();
        const result = await checkInTicket({
            deviceToken,
            ticketCode,
            deviceInfo: request.headers.get("user-agent"),
            ipAddress: request.headers.get("x-forwarded-for"),
        });

        if (result.result === "SUCCESS") {
            return successResponse({
                result: result.result,
                ticket: result.ticket,
            });
        }

        return errorResponse(result.message, result.status, {
            result: result.result,
            checkedInAt: result.checkedInAt,
        });
    } catch (error) {
        console.error("Gate check-in error:", error);
        return errorResponse("Gagal check-in", 500);
    }
}
