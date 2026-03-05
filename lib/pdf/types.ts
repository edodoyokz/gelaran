export interface VoucherConfig {
  colors: {
    primary: string;
    background: string;
    text: string;
  };
  assets: {
    logoUrl?: string | null;
    backgroundUrl?: string | null;
  };
  toggles: {
    showQr: boolean;
    showPrice: boolean;
    showVenueMap: boolean;
  };
  customSections: Array<{
    id: string;
    heading: string;
    body: string;
    order: number;
  }>;
}

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
