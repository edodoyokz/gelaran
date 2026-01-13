"use client";

import { useRef } from "react";
import { Printer, X } from "lucide-react";

interface TicketData {
    uniqueCode: string;
    ticketType: string;
    eventTitle: string;
    eventDate?: string;
    eventVenue?: string;
    buyerName: string;
    bookingCode: string;
}

interface TicketPrintProps {
    tickets: TicketData[];
    onClose: () => void;
}

export function TicketPrint({ tickets, onClose }: TicketPrintProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Tickets</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        line-height: 1.4;
                    }
                    .ticket {
                        width: 72mm;
                        padding: 3mm;
                        border-bottom: 1px dashed #000;
                        page-break-after: always;
                    }
                    .ticket:last-child {
                        border-bottom: none;
                        page-break-after: auto;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 1px solid #000;
                        padding-bottom: 2mm;
                        margin-bottom: 2mm;
                    }
                    .event-title {
                        font-size: 14px;
                        font-weight: bold;
                        margin-bottom: 1mm;
                    }
                    .event-info {
                        font-size: 10px;
                    }
                    .body {
                        margin: 2mm 0;
                    }
                    .row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 1mm;
                    }
                    .label {
                        color: #666;
                    }
                    .value {
                        font-weight: bold;
                        text-align: right;
                    }
                    .code-section {
                        text-align: center;
                        margin-top: 3mm;
                        padding-top: 2mm;
                        border-top: 1px dashed #000;
                    }
                    .unique-code {
                        font-size: 16px;
                        font-weight: bold;
                        letter-spacing: 2px;
                        margin: 2mm 0;
                    }
                    .qr-placeholder {
                        width: 30mm;
                        height: 30mm;
                        margin: 2mm auto;
                        border: 1px solid #000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 8px;
                    }
                    .footer {
                        text-align: center;
                        font-size: 8px;
                        margin-top: 2mm;
                        color: #666;
                    }
                    @media print {
                        @page {
                            size: 72mm auto;
                            margin: 0;
                        }
                        body {
                            width: 72mm;
                        }
                    }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Cetak Tiket</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 overflow-auto max-h-[60vh]">
                    <div ref={printRef}>
                        {tickets.map((ticket, index) => (
                            <div key={index} className="ticket bg-white text-black p-4 rounded-lg mb-4 last:mb-0">
                                <div className="header">
                                    <div className="event-title">{ticket.eventTitle}</div>
                                    {ticket.eventDate && (
                                        <div className="event-info">{ticket.eventDate}</div>
                                    )}
                                    {ticket.eventVenue && (
                                        <div className="event-info">{ticket.eventVenue}</div>
                                    )}
                                </div>
                                <div className="body">
                                    <div className="row">
                                        <span className="label">Tipe:</span>
                                        <span className="value">{ticket.ticketType}</span>
                                    </div>
                                    <div className="row">
                                        <span className="label">Nama:</span>
                                        <span className="value">{ticket.buyerName}</span>
                                    </div>
                                    <div className="row">
                                        <span className="label">Booking:</span>
                                        <span className="value">{ticket.bookingCode}</span>
                                    </div>
                                </div>
                                <div className="code-section">
                                    <div className="qr-placeholder">QR Code</div>
                                    <div className="unique-code">{ticket.uniqueCode}</div>
                                </div>
                                <div className="footer">
                                    Tunjukkan tiket ini saat masuk venue
                                    <br />
                                    BSC Event Platform
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-700 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
                    >
                        Tutup
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors"
                    >
                        <Printer className="h-5 w-5" />
                        Cetak
                    </button>
                </div>
            </div>
        </div>
    );
}
