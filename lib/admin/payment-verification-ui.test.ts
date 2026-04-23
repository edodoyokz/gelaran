import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
    buildPaymentVerificationRequest,
    canReviewPaymentProof,
    getPaymentProofKind,
    getVerificationStatusMeta,
} from "@/lib/admin/payment-verification-ui";

describe("payment verification UI helpers", () => {
    test("allows review only when proof is uploaded and proof URL exists", () => {
        assert.equal(
            canReviewPaymentProof({
                verificationStatus: "PROOF_UPLOADED",
                paymentProofUrl: "https://example.com/proof.jpg",
            }),
            true
        );

        assert.equal(
            canReviewPaymentProof({
                verificationStatus: "VERIFIED",
                paymentProofUrl: "https://example.com/proof.jpg",
            }),
            false
        );

        assert.equal(
            canReviewPaymentProof({
                verificationStatus: "PROOF_UPLOADED",
                paymentProofUrl: null,
            }),
            false
        );
    });

    test("detects PDF and image payment proof URLs", () => {
        assert.equal(getPaymentProofKind("https://example.com/proof.pdf"), "pdf");
        assert.equal(
            getPaymentProofKind(
                "https://example.supabase.co/storage/v1/object/sign/payment-proofs/payment-proofs/booking_123/proof.pdf?token=abc"
            ),
            "pdf"
        );
        assert.equal(getPaymentProofKind("https://example.com/proof.JPG?download=1"), "image");
        assert.equal(getPaymentProofKind("https://example.com/proof"), "unknown");
        assert.equal(getPaymentProofKind(null), "missing");
    });

    test("returns admin-facing labels for verification statuses", () => {
        assert.deepEqual(getVerificationStatusMeta("PROOF_UPLOADED"), {
            label: "Awaiting Review",
            toneClassName: "bg-amber-500/10 text-amber-700",
        });

        assert.deepEqual(getVerificationStatusMeta("VERIFIED"), {
            label: "Verified",
            toneClassName: "bg-green-500/10 text-green-700",
        });

        assert.deepEqual(getVerificationStatusMeta(null), {
            label: "No Proof Submitted",
            toneClassName: "bg-(--bg-secondary) text-(--text-muted)",
        });
    });

    test("builds verify-payment requests with trimmed optional notes", () => {
        assert.deepEqual(buildPaymentVerificationRequest("booking_123", "VERIFY", "  approved after review  "), {
            url: "/api/admin/bookings/booking_123/verify-payment",
            init: {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "VERIFY",
                    notes: "approved after review",
                }),
            },
        });

        assert.deepEqual(buildPaymentVerificationRequest("booking_123", "REJECT", "   "), {
            url: "/api/admin/bookings/booking_123/verify-payment",
            init: {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "REJECT",
                }),
            },
        });
    });

    test("documents stable fields expected from verify-payment outcomes", () => {
        const verifyOutcome = {
            bookingId: "booking_123",
            bookingCode: "BOOK-123",
            status: "CONFIRMED",
            paymentStatus: "PAID",
            verificationStatus: "VERIFIED",
            verifiedAt: "2026-04-08T04:53:00.000Z",
            verificationNotes: "approved after review",
            paidAt: "2026-04-08T04:53:00.000Z",
            confirmedAt: "2026-04-08T04:53:00.000Z",
        };

        const rejectOutcome = {
            bookingId: "booking_123",
            bookingCode: "BOOK-123",
            status: "PENDING",
            paymentStatus: "PENDING",
            verificationStatus: "REJECTED",
            verifiedAt: "2026-04-08T04:53:00.000Z",
            verificationNotes: "proof unreadable",
            paidAt: null,
            confirmedAt: null,
        };

        assert.deepEqual(Object.keys(rejectOutcome).sort(), Object.keys(verifyOutcome).sort());
    });
});
