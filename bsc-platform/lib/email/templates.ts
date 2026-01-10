// lib/email/templates.ts
// Email templates for BSC Platform

interface BookingConfirmationProps {
    customerName: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    bookingCode: string;
    tickets: Array<{
        name: string;
        uniqueCode: string;
    }>;
    totalAmount: string;
}

export function bookingConfirmationHtml(props: BookingConfirmationProps): string {
    const ticketRows = props.tickets.map((ticket) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${ticket.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: monospace; font-weight: bold;">${ticket.uniqueCode}</td>
    </tr>
  `).join("");

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🎉 Booking Confirmed!</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Terima kasih telah memesan tiket</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
                Halo <strong>${props.customerName}</strong>,
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                Pembayaran kamu telah berhasil diproses. Berikut adalah detail pemesanan tiket kamu:
              </p>
              
              <!-- Booking Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px; font-size: 20px; color: #111827;">${props.eventTitle}</h2>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 4px 0; color: #6b7280;">📅 Tanggal</td>
                        <td style="padding: 4px 0 4px 16px; color: #111827; font-weight: 500;">${props.eventDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #6b7280;">🕐 Waktu</td>
                        <td style="padding: 4px 0 4px 16px; color: #111827; font-weight: 500;">${props.eventTime}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #6b7280;">📍 Lokasi</td>
                        <td style="padding: 4px 0 4px 16px; color: #111827; font-weight: 500;">${props.eventLocation}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Booking Code -->
              <div style="background-color: #eef2ff; border: 2px dashed #6366f1; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #4f46e5;">Kode Booking</p>
                <p style="margin: 0; font-size: 32px; font-weight: bold; font-family: monospace; color: #4f46e5; letter-spacing: 2px;">${props.bookingCode}</p>
              </div>

              <!-- Tickets -->
              <h3 style="margin: 0 0 16px; font-size: 16px; color: #374151;">Daftar Tiket:</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 30px;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; font-size: 14px; color: #6b7280;">Jenis Tiket</th>
                    <th style="padding: 12px; text-align: left; font-size: 14px; color: #6b7280;">Kode Tiket</th>
                  </tr>
                </thead>
                <tbody>
                  ${ticketRows}
                </tbody>
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111827; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%">
                      <tr>
                        <td style="color: rgba(255,255,255,0.7);">Total Pembayaran</td>
                        <td style="text-align: right; color: #ffffff; font-size: 24px; font-weight: bold;">${props.totalAmount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/bookings" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Lihat Detail Booking
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">
                Simpan email ini sebagai bukti pemesanan.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} BSC Events. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function bookingConfirmationText(props: BookingConfirmationProps): string {
    const ticketList = props.tickets.map((t) => `  - ${t.name}: ${t.uniqueCode}`).join("\n");

    return `
🎉 BOOKING CONFIRMED!

Halo ${props.customerName},

Pembayaran kamu telah berhasil diproses.

====================================
${props.eventTitle}
====================================

📅 Tanggal: ${props.eventDate}
🕐 Waktu: ${props.eventTime}
📍 Lokasi: ${props.eventLocation}

------------------------------------
KODE BOOKING: ${props.bookingCode}
------------------------------------

DAFTAR TIKET:
${ticketList}

TOTAL PEMBAYARAN: ${props.totalAmount}

------------------------------------

Simpan email ini sebagai bukti pemesanan.

© ${new Date().getFullYear()} BSC Events
  `.trim();
}
