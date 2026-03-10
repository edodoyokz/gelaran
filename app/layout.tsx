import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Gelaran - Event Ticketing",
    template: "%s | Gelaran",
  },
  description: "Platform pemesanan tiket event terpercaya di Indonesia. Temukan dan pesan tiket konser, seminar, workshop, dan berbagai event menarik lainnya.",
  keywords: ["tiket event", "booking tiket", "konser", "seminar", "workshop", "event indonesia"],
  authors: [{ name: "Gelaran" }],
  openGraph: {
    title: "Gelaran - Event Ticketing",
    description: "Platform pemesanan tiket event terpercaya di Indonesia",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
