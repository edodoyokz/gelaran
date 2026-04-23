"use client";

import { useSearchParams } from "next/navigation";
import {
  CheckoutActionBar,
  CheckoutPageShell,
} from "@/components/features/checkout/checkout-primitives";
import {
  CheckoutCallout,
  CheckoutFailedReasonCard,
  CheckoutPendingInstructionsCard,
  CheckoutStatusHero,
  CheckoutStatusKeyValue,
  CheckoutStatusRefreshButton,
  CheckoutStatusSupport,
  CheckoutSuccessSummaryCard,
} from "@/components/features/checkout/checkout-result-primitives";

type PosPaymentStatusTone = "success" | "pending" | "failed";

interface PosPaymentStatusPageProps {
  tone: PosPaymentStatusTone;
  pageTitle: string;
  pageDescription: string;
}

const statusCopy = {
  success: {
    heroTitle: "Pembayaran POS berhasil dan tiket siap dipakai",
    heroDescription:
      "Kasir dapat kembali ke dashboard POS untuk melanjutkan penjualan atau membuka detail booking ini dari perangkat yang sama.",
    calloutTitle: "Transaksi tersimpan",
    calloutDescription:
      "Gunakan kode booking ini untuk referensi internal saat reprint tiket atau pengecekan transaksi di lokasi.",
    primaryLabel: "Kembali ke POS",
    secondaryLabel: "Akses ulang perangkat",
    detailCard: <CheckoutSuccessSummaryCard />,
    supportNote: (
      <CheckoutStatusSupport>
        Jika halaman ini dibuka setelah redirect payment gateway, cukup kembali ke dashboard POS dan refresh status booking bila diperlukan.
      </CheckoutStatusSupport>
    ),
  },
  pending: {
    heroTitle: "Pembayaran POS masih menunggu konfirmasi",
    heroDescription:
      "Booking sudah tercatat, tetapi pembayaran belum tervalidasi penuh. Pantau status ini dari dashboard POS sampai gateway mengirim pembaruan akhir.",
    calloutTitle: "Tunggu konfirmasi gateway",
    calloutDescription:
      "Kasir dapat memeriksa ulang status pembayaran atau meminta pembeli menyelesaikan instruksi pembayaran yang masih tertunda.",
    primaryLabel: "Kembali ke POS",
    secondaryLabel: "Akses ulang perangkat",
    detailCard: <CheckoutPendingInstructionsCard />,
    supportNote: (
      <CheckoutStatusSupport>
        Gunakan tombol refresh atau dashboard POS untuk mengecek perubahan status tanpa membuat transaksi baru.
      </CheckoutStatusSupport>
    ),
  },
  failed: {
    heroTitle: "Pembayaran POS gagal diselesaikan",
    heroDescription:
      "Transaksi tidak tervalidasi sehingga booking belum aktif. Kasir dapat mencoba kanal pembayaran lain dari dashboard POS bila diperlukan.",
    calloutTitle: "Transaksi belum aktif",
    calloutDescription:
      "Booking ini hanya menjadi referensi sampai pembayaran berhasil atau pesanan baru dibuat dari perangkat POS.",
    primaryLabel: "Kembali ke POS",
    secondaryLabel: "Akses ulang perangkat",
    detailCard: <CheckoutFailedReasonCard />,
    supportNote: (
      <CheckoutStatusSupport>
        Simpan kode booking ini sebagai referensi internal jika perlu pengecekan manual dengan penyelenggara atau support.
      </CheckoutStatusSupport>
    ),
  },
} as const;

export function PosPaymentStatusPage({
  tone,
  pageTitle,
  pageDescription,
}: PosPaymentStatusPageProps) {
  const searchParams = useSearchParams();
  const bookingCode = searchParams.get("booking");
  const copy = statusCopy[tone];
  const calloutTone =
    tone === "pending" ? "warning" : tone === "failed" ? "error" : "success";

  return (
    <CheckoutPageShell
      title={pageTitle}
      description={pageDescription}
      backHref="/pos"
      backLabel="Kembali ke dashboard POS"
    >
      <CheckoutStatusHero
        tone={tone}
        title={copy.heroTitle}
        description={copy.heroDescription}
        bookingCode={bookingCode}
        highlight={
          <div className="rounded-[1.4rem] border border-(--border-light) bg-(--surface-muted) px-4 py-4 shadow-(--shadow-xs)">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
              Referensi kasir
            </p>
            <div className="mt-3 space-y-1">
              <CheckoutStatusKeyValue label="Kode booking" value={bookingCode || "Belum tersedia"} />
              <CheckoutStatusKeyValue label="Arah berikutnya" value="Buka lagi dashboard POS untuk kontrol penuh" />
            </div>
          </div>
        }
        detailCard={copy.detailCard}
        supportNote={copy.supportNote}
      >
        <CheckoutCallout
          tone={calloutTone}
          title={copy.calloutTitle}
          description={copy.calloutDescription}
        />

        <CheckoutActionBar
          primary={{ href: "/pos", label: copy.primaryLabel }}
          secondary={{ href: "/pos/access", label: copy.secondaryLabel }}
          tertiary={
            tone === "pending" ? (
              <CheckoutStatusRefreshButton
                onClick={() => window.location.reload()}
                label="Refresh status"
              />
            ) : null
          }
        />
      </CheckoutStatusHero>
    </CheckoutPageShell>
  );
}
