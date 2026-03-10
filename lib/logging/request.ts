import { randomUUID } from "crypto";

export type RequestContext = {
    requestId: string;
    route: string;
    method: string;
};

export function createRequestContext(
    request: Pick<Request, "headers" | "method">,
    route: string
): RequestContext {
    const incomingRequestId = request.headers.get("x-request-id")?.trim();

    return {
        requestId: incomingRequestId || randomUUID(),
        route,
        method: request.method,
    };
}

export function attachRequestIdHeader(response: Response, requestId: string) {
    response.headers.set("x-request-id", requestId);
    return response;
}
