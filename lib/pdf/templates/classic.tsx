import { Document, Page, Text, View, StyleSheet, Font, Image } from "@react-pdf/renderer";
import type { TicketPdfData, VoucherConfig } from "../types";

Font.register({
  family: "Times-Roman",
  fonts: [{ src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf", fontWeight: 400 }],
});

interface ClassicTemplateProps {
  ticket: TicketPdfData;
  config: VoucherConfig;
}

export function ClassicTemplate({ ticket, config }: ClassicTemplateProps) {
  const primaryColor = config.colors.primary;
  const backgroundColor = config.colors.background;
  const textColor = config.colors.text;

  const styles = StyleSheet.create({
    page: {
      padding: 50,
      fontFamily: "Times-Roman",
      backgroundColor,
    },
    header: {
      textAlign: "center",
      marginBottom: 30,
      paddingBottom: 15,
      borderBottomWidth: 3,
      borderBottomColor: primaryColor,
    },
    logo: {
      fontSize: 28,
      fontWeight: "bold",
      color: primaryColor,
      marginBottom: 5,
    },
    subtitle: {
      fontSize: 10,
      color: "#666666",
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    eventTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: textColor,
      textAlign: "center",
      marginBottom: 25,
      lineHeight: 1.3,
    },
    mainInfoBox: {
      borderWidth: 2,
      borderColor: primaryColor,
      borderRadius: 8,
      padding: 20,
      marginBottom: 25,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      paddingBottom: 8,
    },
    infoLabel: {
      fontSize: 10,
      color: "#666666",
      textTransform: "uppercase",
    },
    infoValue: {
      fontSize: 11,
      color: textColor,
      fontWeight: "bold",
      textAlign: "right",
    },
    ticketSection: {
      backgroundColor: "#fafafa",
      padding: 20,
      borderRadius: 8,
      marginBottom: 25,
      borderWidth: 1,
      borderColor: "#e5e7eb",
    },
    ticketTitle: {
      fontSize: 12,
      fontWeight: "bold",
      color: primaryColor,
      marginBottom: 15,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    ticketDetailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    ticketDetailLabel: {
      fontSize: 10,
      color: "#666666",
    },
    ticketDetailValue: {
      fontSize: 10,
      color: textColor,
      fontWeight: "bold",
    },
    qrBox: {
      alignItems: "center",
      padding: 25,
      backgroundColor: "#ffffff",
      borderWidth: 1,
      borderColor: "#e5e7eb",
      borderRadius: 6,
      marginBottom: 20,
    },
    qrCodeText: {
      fontSize: 16,
      fontWeight: "bold",
      color: primaryColor,
      letterSpacing: 3,
      marginBottom: 5,
    },
    qrSubtext: {
      fontSize: 8,
      color: "#999999",
    },
    attendeeBox: {
      borderWidth: 1,
      borderColor: "#d1d5db",
      borderStyle: "dashed",
      borderRadius: 6,
      padding: 15,
      marginBottom: 25,
    },
    attendeeLabel: {
      fontSize: 9,
      color: "#666666",
      textTransform: "uppercase",
      marginBottom: 5,
    },
    attendeeName: {
      fontSize: 16,
      fontWeight: "bold",
      color: textColor,
    },
    footer: {
      marginTop: 30,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: "#e5e7eb",
    },
    footerText: {
      fontSize: 8,
      color: "#999999",
      textAlign: "center",
      lineHeight: 1.5,
    },
    termsBox: {
      marginTop: 15,
      padding: 10,
      backgroundColor: "#f9fafb",
      borderRadius: 4,
    },
    termsTitle: {
      fontSize: 9,
      fontWeight: "bold",
      color: "#666666",
      marginBottom: 5,
    },
    termsText: {
      fontSize: 7,
      color: "#999999",
      lineHeight: 1.4,
    },
    customSection: {
      marginTop: 15,
      padding: 10,
      borderLeftWidth: 3,
      borderLeftColor: primaryColor,
      backgroundColor: "#fafafa",
    },
    customSectionTitle: {
      fontSize: 10,
      fontWeight: "bold",
      color: textColor,
      marginBottom: 5,
    },
    customSectionBody: {
      fontSize: 8,
      color: "#666666",
      lineHeight: 1.4,
    },
  });

  return (
    <Document>
      <Page size="A5" orientation="portrait" style={styles.page}>
        <View style={styles.header}>
          {config.assets.logoUrl ? (
            <Image src={config.assets.logoUrl} style={{ width: 100, height: 35, alignSelf: "center" }} />
          ) : (
            <Text style={styles.logo}>Gelaran</Text>
          )}
          <Text style={styles.subtitle}>E-Ticket</Text>
        </View>

        <Text style={styles.eventTitle}>{ticket.eventTitle}</Text>

        <View style={styles.mainInfoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal & Waktu</Text>
            <Text style={styles.infoValue}>{ticket.eventDate} | {ticket.eventTime}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lokasi</Text>
            <Text style={styles.infoValue}>{ticket.eventLocation}</Text>
          </View>
            <View style={[styles.infoRow, { marginBottom: 0, borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Text style={styles.infoLabel}>Tipe Acara</Text>
            <Text style={styles.infoValue}>{ticket.eventType}</Text>
          </View>
        </View>

        <View style={styles.ticketSection}>
          <Text style={styles.ticketTitle}>Informasi Tiket</Text>
          <View style={styles.ticketDetailRow}>
            <Text style={styles.ticketDetailLabel}>Jenis Tiket</Text>
            <Text style={styles.ticketDetailValue}>{ticket.ticketType}</Text>
          </View>
          {config.toggles.showPrice && (
            <View style={styles.ticketDetailRow}>
              <Text style={styles.ticketDetailLabel}>Harga</Text>
              <Text style={styles.ticketDetailValue}>{ticket.price}</Text>
            </View>
          )}
          {ticket.seatInfo && (
            <View style={[styles.ticketDetailRow, { marginBottom: 0, borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Text style={styles.ticketDetailLabel}>Nomor Kursi</Text>
              <Text style={styles.ticketDetailValue}>{ticket.seatInfo}</Text>
            </View>
          )}
        </View>

        {config.toggles.showQr && (
          <View style={styles.qrBox}>
            <Text style={styles.qrCodeText}>{ticket.ticketCode}</Text>
            <Text style={styles.qrSubtext}>Tunjukkan kode ini kepada petugas</Text>
          </View>
        )}

        <View style={styles.attendeeBox}>
          <Text style={styles.attendeeLabel}>Nama Peserta</Text>
          <Text style={styles.attendeeName}>{ticket.attendeeName}</Text>
        </View>

        {config.customSections.map((section) => (
          <View key={section.id} style={styles.customSection}>
            <Text style={styles.customSectionTitle}>{section.heading}</Text>
            <Text style={styles.customSectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.termsBox}>
          <Text style={styles.termsTitle}>Syarat & Ketentuan</Text>
          <Text style={styles.termsText}>
            Tiket ini bersifat personal dan tidak dapat dipindahtangankan. Harap menunjukkan kode QR di pintu masuk.
            Tiket yang sudah dibeli tidak dapat dikembalikan kecuali acara dibatalkan oleh pihak penyelenggara.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Kode Booking: {ticket.bookingCode}{"\n"}
            Dibeli pada: {ticket.purchaseDate}{"\n"}
            © {new Date().getFullYear()} Gelaran. All rights reserved.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
