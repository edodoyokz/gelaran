import type { RequestContext } from "./request";

type LogLevel = "info" | "warn" | "error";

type LogDetails = Record<string, unknown>;

function serializeError(error: unknown) {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }

    return error;
}

function writeLog(level: LogLevel, payload: Record<string, unknown>) {
    const line = JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        ...payload,
    });

    if (level === "error") {
        console.error(line);
        return;
    }

    if (level === "warn") {
        console.warn(line);
        return;
    }

    console.log(line);
}

export function createRequestLogger(context: RequestContext, baseContext: LogDetails = {}) {
    const basePayload = {
        requestId: context.requestId,
        route: context.route,
        method: context.method,
        ...baseContext,
    };

    return {
        info(event: string, message: string, details: LogDetails = {}) {
            writeLog("info", {
                event,
                message,
                ...basePayload,
                ...details,
            });
        },
        warn(event: string, message: string, details: LogDetails = {}) {
            writeLog("warn", {
                event,
                message,
                ...basePayload,
                ...details,
            });
        },
        error(event: string, message: string, error?: unknown, details: LogDetails = {}) {
            writeLog("error", {
                event,
                message,
                ...basePayload,
                error: serializeError(error),
                ...details,
            });
        },
    };
}
