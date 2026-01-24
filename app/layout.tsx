import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
