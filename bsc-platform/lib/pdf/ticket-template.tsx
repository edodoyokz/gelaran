// lib/pdf/ticket-template.tsx
// PDF Ticket Template using @react-pdf/renderer

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts (using system fonts for simplicity)
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Inter",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#4f46e5",
  },
  logo: {
    fontSize: 24,
    fontWeight: 700,
    color: "#4f46e5",
  },
  ticketBadge: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 600,
  },
  eventSection: {
    marginBottom: 25,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 10,
  },
  eventDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    width: "45%",
  },
  detailLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginRight: 8,
    width: 60,
  },
  detailValue: {
    fontSize: 11,
    color: "#111827",
    fontWeight: 600,
  },
  ticketInfoSection: {
    backgroundColor: "#f9fafb",
    padding: 20,
    borderRadius: 8,
    marginBottom: 25,
  },
  ticketInfoHeader: {
    fontSize: 12,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  ticketInfoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ticketInfoItem: {
    flex: 1,
  },
  ticketInfoLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
  },
  ticketInfoValue: {
    fontSize: 12,
    fontWeight: 600,
    color: "#111827",
  },
  qrSection: {
    alignItems: "center",
    marginBottom: 25,
    padding: 20,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    borderRadius: 8,
  },
  qrPlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  qrCode: {
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 5,
  },
  ticketCode: {
    fontSize: 14,
    fontWeight: 700,
    color: "#4f46e5",
    letterSpacing: 2,
    fontFamily: "Courier",
  },
  scanText: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 10,
  },
  attendeeSection: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: "#fef3c7",
    borderRadius: 8,
  },
  attendeeLabel: {
    fontSize: 9,
    color: "#92400e",
    marginBottom: 4,
  },
  attendeeName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#78350f",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 15,
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 4,
  },
  bookingCode: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: 600,
  },
  termsSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 8,
  },
  termsText: {
    fontSize: 8,
    color: "#6b7280",
    lineHeight: 1.4,
  },
});

export interface TicketPdfData {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventType: string;
  ticketType: string;
  ticketCode: string;
  bookingCode: string;
  attendeeName: string;
  attendeeEmail: string;
  purchaseDate: string;
  price: string;
  seatInfo?: string;
}

export function TicketPdfDocument({ ticket }: { ticket: TicketPdfData }) {
  return (
    <Document>
      <Page size="A5" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>BSC Events</Text>
          <Text style={styles.ticketBadge}>E-TICKET</Text>
        </View>

        {/* Event Info */}
        <View style={styles.eventSection}>
          <Text style={styles.eventTitle}>{ticket.eventTitle}</Text>
          <View style={styles.eventDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tanggal</Text>
              <Text style={styles.detailValue}>{ticket.eventDate}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Waktu</Text>
              <Text style={styles.detailValue}>{ticket.eventTime}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Lokasi</Text>
              <Text style={styles.detailValue}>{ticket.eventLocation}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tipe</Text>
              <Text style={styles.detailValue}>{ticket.eventType}</Text>
            </View>
          </View>
        </View>

        {/* Ticket Info */}
        <View style={styles.ticketInfoSection}>
          <Text style={styles.ticketInfoHeader}>Informasi Tiket</Text>
          <View style={styles.ticketInfoGrid}>
            <View style={styles.ticketInfoItem}>
              <Text style={styles.ticketInfoLabel}>Jenis Tiket</Text>
              <Text style={styles.ticketInfoValue}>{ticket.ticketType}</Text>
            </View>
            <View style={styles.ticketInfoItem}>
              <Text style={styles.ticketInfoLabel}>Harga</Text>
              <Text style={styles.ticketInfoValue}>{ticket.price}</Text>
            </View>
            {ticket.seatInfo && (
              <View style={styles.ticketInfoItem}>
                <Text style={styles.ticketInfoLabel}>Kursi</Text>
                <Text style={styles.ticketInfoValue}>{ticket.seatInfo}</Text>
              </View>
            )}
          </View>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrCode}>QR Code</Text>
            <Text style={styles.qrCode}>(Scan untuk check-in)</Text>
          </View>
          <Text style={styles.ticketCode}>{ticket.ticketCode}</Text>
          <Text style={styles.scanText}>
            Tunjukkan kode ini kepada petugas di pintu masuk
          </Text>
        </View>

        {/* Attendee Info */}
        <View style={styles.attendeeSection}>
          <Text style={styles.attendeeLabel}>NAMA PESERTA</Text>
          <Text style={styles.attendeeName}>{ticket.attendeeName}</Text>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Syarat & Ketentuan</Text>
          <Text style={styles.termsText}>
            1. Tiket ini hanya berlaku untuk satu orang dan tidak dapat
            dipindahtangankan tanpa persetujuan. {"\n"}
            2. Harap tiba minimal 30 menit sebelum acara dimulai. {"\n"}
            3. Tiket yang sudah dibeli tidak dapat dikembalikan kecuali acara
            dibatalkan.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.bookingCode}>
            Kode Booking: {ticket.bookingCode}
          </Text>
          <Text style={styles.footerText}>
            Dibeli pada: {ticket.purchaseDate}
          </Text>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} BSC Events. All rights reserved.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

// Function to generate PDF data from booking/ticket
export function generateTicketPdfData(
  booking: {
    bookingCode: string;
    guestName?: string | null;
    guestEmail?: string | null;
    paidAt?: Date | null;
    createdAt: Date;
    user?: { name: string; email: string } | null;
    event: {
      title: string;
      eventType: string;
      venue?: { name: string; city: string } | null;
      schedules: Array<{
        scheduleDate: Date;
        startTime: Date;
      }>;
    };
  },
  ticket: {
    uniqueCode: string;
    finalPrice: number | { toString(): string };
    ticketType: { name: string };
  }
): TicketPdfData {
  const schedule = booking.event.schedules[0];
  const eventDate = schedule
    ? new Date(schedule.scheduleDate).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "TBA";
  const eventTime = schedule
    ? new Date(schedule.startTime).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "TBA";

  const eventLocation =
    booking.event.eventType === "ONLINE"
      ? "Online Event"
      : booking.event.venue
        ? `${booking.event.venue.name}, ${booking.event.venue.city}`
        : "TBA";

  const eventTypeLabel =
    booking.event.eventType === "ONLINE"
      ? "Online"
      : booking.event.eventType === "HYBRID"
        ? "Hybrid"
        : "Offline";

  const price = Number(ticket.finalPrice);
  const formattedPrice =
    price === 0
      ? "GRATIS"
      : new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(price);

  const purchaseDate = (booking.paidAt || booking.createdAt).toLocaleDateString(
    "id-ID",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return {
    eventTitle: booking.event.title,
    eventDate,
    eventTime,
    eventLocation,
    eventType: eventTypeLabel,
    ticketType: ticket.ticketType.name,
    ticketCode: ticket.uniqueCode,
    bookingCode: booking.bookingCode,
    attendeeName: booking.user?.name || booking.guestName || "Guest",
    attendeeEmail: booking.user?.email || booking.guestEmail || "",
    purchaseDate,
    price: formattedPrice,
  };
}
