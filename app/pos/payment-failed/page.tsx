"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PosPaymentStatusPage } from "@/components/pos/pos-payment-status-page";

function PosPaymentFailedContent() {
  return (
    <PosPaymentStatusPage
      tone="failed"
      pageTitle="Pembayaran POS gagal"
      pageDescription="Redirect gagal dari payment gateway sekarang diarahkan ke halaman POS yang nyata, bukan route yang hilang."
    />
  );
}

export default function PosPaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-(--accent-primary)" />
        </div>
      }
    >
      <PosPaymentFailedContent />
    </Suspense>
  );
}
