import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./material-symbols.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-editorial",
  subsets: ["latin"],
  display: "swap",
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
    <html lang="id" suppressHydrationWarning>
      <body className={`antialiased ${plusJakartaSans.variable} ${playfairDisplay.variable} bg-[var(--bg-primary)] text-[var(--text-primary)]`}>
        {children}
      </body>
    </html>
  );
}
