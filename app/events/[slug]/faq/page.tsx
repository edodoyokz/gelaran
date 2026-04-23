import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, HelpCircle, Mail, Sparkles } from "lucide-react";
import prisma from "@/lib/prisma/client";
import {
  DiscoveryBadge,
  DiscoveryContainer,
  DiscoveryFaqList,
  DiscoveryHero,
  DiscoveryLinkRow,
  DiscoveryPageShell,
  DiscoveryPanel,
  DiscoverySection,
  DiscoveryStat,
} from "@/components/features/events/discovery-primitives";

export default async function EventFaqPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug, deletedAt: null, status: "PUBLISHED" },
    include: {
      faqs: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <DiscoveryPageShell>
      <DiscoveryHero
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Event FAQ
          </span>
        }
        title={`${event.title} · pertanyaan yang paling sering diajukan`}
        description="Halaman FAQ kini mengikuti baseline discovery Gelaran dengan panel yang lebih terang, ritme editorial, dan CTA pendukung yang tetap fokus pada konteks event."
      >
        <DiscoveryPanel className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <DiscoveryStat label="FAQ aktif" value={event.faqs.length} hint="Dijawab oleh organizer" />
            <DiscoveryStat
              label="Kategori"
              value={event.faqs.length ? "Informasi event" : "Segera hadir"}
              hint="Diperbarui sesuai kebutuhan"
            />
          </div>
        </DiscoveryPanel>
      </DiscoveryHero>

      <DiscoveryContainer className="pb-16 sm:pb-20">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-(--text-secondary) transition-colors duration-200 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke detail event
          </Link>
          <DiscoveryBadge tone="accent">
            <HelpCircle className="h-3.5 w-3.5" />
            FAQ event
          </DiscoveryBadge>
        </div>

        <DiscoverySection
          title="Semua pertanyaan"
          description="Setiap jawaban disusun dalam kartu accordion yang lebih nyaman dibaca di mobile maupun desktop."
        >
          {event.faqs.length === 0 ? (
            <DiscoveryPanel className="p-10 text-center sm:p-14">
              <HelpCircle className="mx-auto h-12 w-12 text-(--text-muted)" />
              <h2 className="mt-5 text-2xl font-semibold tracking-(--tracking-heading) text-foreground">
                FAQ belum tersedia
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-(--text-secondary) sm:text-base">
                Organizer belum menambahkan pertanyaan umum untuk event ini. Silakan kembali ke detail event atau hubungi tim support jika membutuhkan bantuan.
              </p>
            </DiscoveryPanel>
          ) : (
            <DiscoveryFaqList
              items={event.faqs.map((faq) => ({
                id: faq.id,
                question: faq.question,
                answer: faq.answer,
              }))}
            />
          )}
        </DiscoverySection>

        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <DiscoveryPanel className="p-5 sm:p-6 lg:p-8">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-(--text-muted)">
              Need more help?
            </p>
            <h2 className="mt-2 font-(--font-editorial) text-3xl leading-tight tracking-(--tracking-heading) text-foreground">
              Masih ada pertanyaan lain?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-(--text-secondary) sm:text-base">
              Bila pertanyaan Anda belum tercakup di daftar ini, hubungi support Gelaran untuk bantuan lebih lanjut terkait tiket, akses event, atau proses pembelian.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="mailto:support@gelaran.id"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-(--accent-secondary) px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--accent-secondary-hover)"
              >
                <Mail className="h-4 w-4" />
                Contact support
              </a>
              <DiscoveryLinkRow href={`/events/${event.slug}`} label="Lihat kembali detail event" />
            </div>
          </DiscoveryPanel>

          <DiscoveryPanel className="p-5 sm:p-6">
            <DiscoveryStat
              label="Route related"
              value="Event detail"
              hint="Kembali untuk melihat tiket, deskripsi, dan organizer"
            />
            <div className="mt-4 border-t border-(--border) pt-4">
              <DiscoveryLinkRow href={`/events/${event.slug}`} label="Buka halaman event" />
            </div>
          </DiscoveryPanel>
        </div>
      </DiscoveryContainer>
    </DiscoveryPageShell>
  );
}
