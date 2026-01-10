"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TicketOption {
    type: string;
    price: number;
    available: number;
}

interface TicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: {
        title: string;
        date: string;
        time: string;
        tickets: TicketOption[];
    };
    onCheckout?: (selectedTickets: Record<string, number>, total: number) => void;
}

export function TicketModal({ isOpen, onClose, event, onCheckout }: TicketModalProps) {
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    if (!isOpen) return null;

    const handleQtyChange = (type: string, delta: number) => {
        setQuantities((prev) => {
            const current = prev[type] || 0;
            const ticket = event.tickets.find((t) => t.type === type);
            const maxQty = ticket?.available || 10;
            const newVal = Math.max(0, Math.min(maxQty, current + delta));
            return { ...prev, [type]: newVal };
        });
    };

    const total = event.tickets.reduce((acc, ticket) => {
        return acc + ticket.price * (quantities[ticket.type] || 0);
    }, 0);

    const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);

    const handleCheckout = () => {
        if (onCheckout && totalTickets > 0) {
            onCheckout(quantities, total);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0">
                    <h3 className="font-bold text-lg">Pilih Tiket</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    <h4 className="font-bold text-gray-900 mb-1">{event.title}</h4>
                    <p className="text-sm text-gray-500 mb-6">
                        {event.date} • {event.time}
                    </p>

                    <div className="space-y-4">
                        {event.tickets.map((ticket, idx) => (
                            <div
                                key={idx}
                                className="border border-gray-200 rounded-xl p-4 hover:border-indigo-200 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="font-bold text-gray-900 block">
                                            {ticket.type}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {ticket.price === 0 ? "Gratis" : formatCurrency(ticket.price)}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => handleQtyChange(ticket.type, -1)}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                            disabled={!quantities[ticket.type]}
                                        >
                                            -
                                        </button>
                                        <span className="font-bold w-4 text-center">
                                            {quantities[ticket.type] || 0}
                                        </span>
                                        <button
                                            onClick={() => handleQtyChange(ticket.type, 1)}
                                            className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400">
                                    Sisa {ticket.available} tiket
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-gray-600">Total</span>
                        <span className="font-bold text-xl text-indigo-600">
                            {formatCurrency(total)}
                        </span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={totalTickets === 0}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-all"
                    >
                        Checkout ({totalTickets})
                    </button>
                </div>
            </div>
        </div>
    );
}
