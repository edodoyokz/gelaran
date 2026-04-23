"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PosPaymentStatusPage } from "@/components/pos/pos-payment-status-page";

function PosPaymentSuccessContent() {
  return (
    <PosPaymentStatusPage
      tone="success"
      pageTitle="Pembayaran POS berhasil"
      pageDescription="Redirect Midtrans sekarang mendarat di route POS yang valid, jadi kasir tidak lagi berakhir di halaman 404 setelah pembayaran selesai."
    />
  );
}

export default function PosPaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-(--accent-primary)" />
        </div>
      }
    >
      <PosPaymentSuccessContent />
    </Suspense>
  );
}
