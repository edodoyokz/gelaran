export type PaymentVerificationStatus =
    | "PENDING_PROOF"
    | "PROOF_UPLOADED"
    | "VERIFIED"
    | "REJECTED"
    | null;

export interface PaymentVerificationView {
    verificationStatus: PaymentVerificationStatus;
    paymentProofUrl: string | null;
}

export type PaymentProofKind = "missing" | "pdf" | "image" | "unknown";

export type PaymentVerificationAction = "VERIFY" | "REJECT";

export function canReviewPaymentProof(transaction: PaymentVerificationView | null | undefined): boolean {
    return Boolean(
        transaction?.verificationStatus === "PROOF_UPLOADED" && transaction.paymentProofUrl
    );
}

export function buildPaymentVerificationRequest(
    bookingId: string,
    action: PaymentVerificationAction,
    notes: string
): {
    url: string;
    init: RequestInit;
} {
    const trimmedNotes = notes.trim();
    const body = trimmedNotes ? { action, notes: trimmedNotes } : { action };

    return {
        url: `/api/admin/bookings/${bookingId}/verify-payment`,
        init: {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        },
    };
}

export function getPaymentProofKind(url: string | null | undefined): PaymentProofKind {
    if (!url) {
        return "missing";
    }

    const normalizedUrl = url.split("?")[0]?.toLowerCase() ?? "";
    const normalizedSegments = normalizedUrl.split("/").filter(Boolean);
    const normalizedPath = normalizedSegments.at(-1) ?? normalizedUrl;

    if (normalizedUrl.endsWith(".pdf") || normalizedPath.endsWith(".pdf")) {
        return "pdf";
    }

    if (
        [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".avif", ".heic"].some(
            (extension) => normalizedUrl.endsWith(extension) || normalizedPath.endsWith(extension)
        )
    ) {
        return "image";
    }

    return "unknown";
}

export function getVerificationStatusMeta(status: PaymentVerificationStatus): {
    label: string;
    toneClassName: string;
} {
    switch (status) {
        case "PROOF_UPLOADED":
            return {
                label: "Awaiting Review",
                toneClassName: "bg-amber-500/10 text-amber-700",
            };
        case "VERIFIED":
            return {
                label: "Verified",
                toneClassName: "bg-green-500/10 text-green-700",
            };
        case "REJECTED":
            return {
                label: "Rejected",
                toneClassName: "bg-red-500/10 text-red-700",
            };
        case "PENDING_PROOF":
            return {
                label: "Awaiting Proof",
                toneClassName: "bg-(--bg-secondary) text-(--text-secondary)",
            };
        default:
            return {
                label: "No Proof Submitted",
                toneClassName: "bg-(--bg-secondary) text-(--text-muted)",
            };
    }
}
