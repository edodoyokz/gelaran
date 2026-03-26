
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from "@react-pdf/renderer";
import { VOUCHER_TERMS } from "./voucher-content";
import { TicketPdfData } from "./ticket-template";

// Extended interface for the voucher which might need extra fields
export interface EVoucherData extends TicketPdfData {
    qrCodeDataUrl?: string;
}


// Register fonts
// Using standard fonts for stability in production environment to avoid subsetting/fetching errors
// If custom fonts are required, we should bundle them in the repo.

const styles = StyleSheet.create({
    page: {
        padding: 30, // Slightly less padding to fit everything
        fontFamily: "Helvetica", // Standard PDF font
        backgroundColor: "#ffffff",
        fontSize: 9,
    },
    // Top Bar
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        paddingBottom: 5,
    },
    topBarLeft: {
        fontSize: 10,
        fontWeight: 700,
    },
    topBarRight: {
        fontSize: 10,
        fontWeight: 700,
    },
    // Main Header Area
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    eventInfo: {
        width: "60%",
    },
    eventName: {
        fontSize: 24,
        fontWeight: 900,
        marginBottom: 5,
        textTransform: "uppercase",
    },
    eventDate: {
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 2,
    },
    eventVenue: {
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 10,
    },
    customerInfo: {
        marginTop: 10,
    },
    customerCode: {
        fontSize: 14,
        fontWeight: 700,
        marginBottom: 5,
    },
    customerDetails: {
        fontSize: 10,
        color: "#444",
    },
    // QR Section (Right Side of Header)
    qrContainer: {
        width: "35%",
        alignItems: "flex-end",
    },
    qrCodeBox: {
        width: 120,
        height: 120,
        backgroundColor: "#f0f0f0", // Placeholder for actual QR
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 5,
    },
    qrCodeText: {
        fontSize: 8,
        color: "#666",
    },
    ticketIdText: {
        fontSize: 10,
        textAlign: "right",
        marginTop: 5,
    },
    ticketCount: {
        fontSize: 10,
        textAlign: "right",
        fontWeight: 700,
        marginBottom: 10,
    },
    // Terms Section
    termsContainer: {
        marginTop: 10,
    },
    termsTitle: {
        fontSize: 10,
        fontWeight: 700,
        textAlign: "center",
        marginBottom: 5,
        textDecoration: "underline",
    },
    termsSubtitle: {
        fontSize: 9,
        fontWeight: 700,
        marginBottom: 10,
    },
    termsIntro: {
        fontSize: 8,
        marginBottom: 10,
        fontStyle: 'italic',
    },
    // Two Column Terms
    termsColumns: {
        flexDirection: "row",
        gap: 20,
    },
    column: {
        flex: 1,
    },
    termItem: {
        marginBottom: 8,
    },
    termTitle: {
        fontSize: 8,
        fontWeight: 700,
        marginBottom: 2,
    },
    termTextId: {
        fontSize: 8,
        marginBottom: 2,
    },
    termTextEn: {
        fontSize: 8,
        color: "#444",
        fontStyle: "italic",
        marginBottom: 4,
    },
    subTermItem: {
        marginLeft: 10,
        marginTop: 2,
        marginBottom: 2,
    },
    subTermBullet: {
        width: 10,
        fontSize: 8,
    },
    footer: {
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerSection: {
        width: "48%",
    },
    footerTitle: {
        fontSize: 9,
        fontWeight: 700,
        marginBottom: 4,
    },
    footerText: {
        fontSize: 8,
        marginBottom: 2,
    },
});

export function EVoucherTemplate({ ticket }: { ticket: EVoucherData }) {

    // Helper to chunk terms for columns if needed, or just flow them
    // For this design, let's just flow them and let flex wrap naturally if we used wrap, 
    // but PDF columns are tricky.
    // We will simply render them in one flow for simplicity, or split 50/50 if strictly required.
    // The reference looked like it might flow or be single column. 
    // Let's stick to a clean single column layout for terms to ensure readability on A4.
    // Actually, the reference text dump shows "13607..." at top right, so it's landscape-ish or wide.
    // We will use A4 Portrait but compress text, or A4 Landscape?
    // User pdf was "E-Voucher — Testing Lat Pespor Solo.pdf"

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Top Bar */}
                <View style={styles.topBar}>
                    <Text style={styles.topBarLeft}>
                        TICKET TYPE : {ticket.ticketType} ({ticket.price})
                    </Text>
                    <Text style={styles.topBarRight}>
                        TICKET 1 of 1
                    </Text>
                </View>

                {/* Header Area */}
                <View style={styles.headerContainer}>
                    <View style={styles.eventInfo}>
                        <Text style={styles.customerCode}>{ticket.bookingCode}</Text>
                        <Text style={styles.eventName}>{ticket.eventTitle}</Text>
                        <Text style={styles.eventDate}>
                            {ticket.eventDate} {ticket.eventTime} – 23:00
                        </Text>
                        <Text style={styles.eventVenue}>{ticket.eventLocation}</Text>

                        <View style={styles.customerInfo}>
                            <Text style={styles.customerDetails}>{ticket.attendeeName}</Text>
                            <Text style={styles.customerDetails}>
                                Ordered on {ticket.purchaseDate}
                            </Text>
                            <Text style={styles.customerDetails}>Ref: {ticket.eventType}</Text>
                        </View>
                    </View>

                    <View style={styles.qrContainer}>
                        <Text style={styles.ticketIdText}>{ticket.ticketCode}</Text>
                        {ticket.qrCodeDataUrl ? (
                            // eslint-disable-next-line jsx-a11y/alt-text
                            <Image src={ticket.qrCodeDataUrl} style={{ width: 120, height: 120, marginBottom: 5 }} />
                        ) : (
                            <View style={styles.qrCodeBox}>
                                <Text style={styles.qrCodeText}>NO QR CODE</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Terms & Conditions */}
                <View style={styles.termsContainer}>
                    <Text style={styles.termsTitle}>{VOUCHER_TERMS.title}</Text>
                    <Text style={styles.termsSubtitle}>{VOUCHER_TERMS.subtitle}</Text>

                    <Text style={styles.termsIntro}>
                        {VOUCHER_TERMS.intro.id}
                        {"\n"}
                        {VOUCHER_TERMS.intro.en}
                    </Text>

                    {VOUCHER_TERMS.sections.map((section, idx) => (
                        <View key={idx} style={{ marginBottom: 10 }}>
                            <Text style={styles.termTitle}>
                                {section.title.id}
                                {"\n"}
                                {section.title.en}
                            </Text>

                            {section.items.map((item: { id: string; en: string; subItems?: Array<{ id: string; en: string }> }, i) => (
                                <View key={i} style={styles.termItem}>
                                    <Text style={styles.termTextId}>{item.id}</Text>
                                    <Text style={styles.termTextEn}>{item.en}</Text>

                                    {item.subItems && item.subItems.map((sub, s: number) => (
                                        <View key={s} style={{ flexDirection: 'row', marginLeft: 15, marginBottom: 4 }}>
                                            <Text style={{ fontSize: 8, marginRight: 5 }}>•</Text>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.termTextId}>{sub.id}</Text>
                                                <Text style={styles.termTextEn}>{sub.en}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerSection}>
                        <Text style={styles.footerTitle}>{VOUCHER_TERMS.footer.organizer.title}</Text>
                        <Text style={styles.footerText}>{ticket.ticketType}</Text> {/* Using generic info or event organizer name if available in ticket data, otherwise generic */}
                        <Text style={{ ...styles.footerText, fontStyle: 'italic', marginTop: 2 }}>{VOUCHER_TERMS.footer.organizer.subtitle}</Text>
                    </View>

                    <View style={styles.footerSection}>
                        <Text style={styles.footerTitle}>{VOUCHER_TERMS.footer.platform.title}</Text>
                        <Text style={{ ...styles.footerText, fontWeight: 700, fontSize: 10 }}>{VOUCHER_TERMS.footer.platform.name}</Text>
                        <Text style={styles.footerText}>{VOUCHER_TERMS.footer.platform.website}</Text>
                        <Text style={styles.footerText}>{VOUCHER_TERMS.footer.platform.email}</Text>
                    </View>
                </View>

            </Page>
        </Document>
    );
}
