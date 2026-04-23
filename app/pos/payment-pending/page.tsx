"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PosPaymentStatusPage } from "@/components/pos/pos-payment-status-page";

function PosPaymentPendingContent() {
  return (
    <PosPaymentStatusPage
      tone="pending"
      pageTitle="Pembayaran POS menunggu konfirmasi"
      pageDescription="Redirect pending dari payment gateway sekarang memiliki halaman POS yang valid agar kasir bisa langsung kembali memantau status transaksi."
    />
  );
}

export default function PosPaymentPendingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-(--accent-primary)" />
        </div>
      }
    >
      <PosPaymentPendingContent />
    </Suspense>
  );
}
