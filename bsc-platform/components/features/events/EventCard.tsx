"use client";

import Link from "next/link";
import { MapPin, Heart, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface EventCardProps {
    id: string;
    slug: string;
    title: string;
    date: string; // "Sabtu, 24 Jan 2026"
    time: string; // "15:00 WIB"
    location: string;
    price: number;
    image: string;
    category: string;
    organizer: string;
    rating?: number;
    reviewCount?: number;
}

export function EventCard({
    slug,
    title,
    date,
    location,
    price,
    image,
    category,
    organizer,
    rating = 4,
    reviewCount = 0,
}: EventCardProps) {
    // Parse date for display
    const dateParts = date.split(" ");
    const month = dateParts[2]?.slice(0, 3).toUpperCase() || "JAN";
    const day = dateParts[1] || "01";

    return (
        <Link
            href={`/events/${slug}`}
            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
        >
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <button
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm hover:bg-white transition-colors"
                    onClick={(e) => {
                        e.preventDefault();
                        // TODO: Add to wishlist
                    }}
                >
                    <Heart className="text-gray-400 hover:text-red-500 transition-colors" size={20} />
                </button>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm text-xs font-bold text-indigo-600 uppercase tracking-wide">
                    {category}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-row gap-4 flex-1">
                {/* Date Box (Eventbrite Style) */}
                <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-red-600 font-bold text-sm uppercase tracking-wider">
                        {month}
                    </span>
                    <span className="text-gray-800 font-bold text-2xl">{day}</span>
                </div>

                {/* Info */}
                <div className="flex flex-col space-y-2 w-full min-w-0">
                    <h3 className="font-bold text-lg leading-tight text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{organizer}</p>
                    <div className="flex items-center text-gray-500 text-xs mt-1">
                        <MapPin size={14} className="mr-1 shrink-0" />
                        <span className="truncate">{location}</span>
                    </div>
                </div>
            </div>

            {/* Footer / Price */}
            <div className="px-5 pb-5 pt-0 mt-auto border-t border-dashed border-gray-100">
                <div className="flex justify-between items-center pt-4">
                    <div className="flex items-center text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                size={14}
                                fill={i < rating ? "currentColor" : "none"}
                                className={i >= rating ? "text-gray-300" : ""}
                            />
                        ))}
                        {reviewCount > 0 && (
                            <span className="text-xs text-gray-400 ml-1">({reviewCount})</span>
                        )}
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-gray-400 block">Mulai dari</span>
                        <span className="font-bold text-gray-900">
                            {price === 0 ? "Gratis" : formatCurrency(price)}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
