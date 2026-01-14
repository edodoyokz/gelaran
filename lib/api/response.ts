import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export function successResponse<T>(
    data: T,
    meta?: ApiResponse<T>["meta"],
    status = 200
): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
        {
            success: true,
            data,
            meta,
        },
        { status }
    );
}

export function errorResponse(
    message: string,
    code = 400,
    details?: Record<string, unknown>
): NextResponse<ApiResponse<never>> {
    return NextResponse.json(
        {
            success: false,
            error: {
                code,
                message,
                details,
            },
        },
        { status: code }
    );
}

export function paginationMeta(
    page: number,
    limit: number,
    total: number
): ApiResponse<unknown>["meta"] {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
}
