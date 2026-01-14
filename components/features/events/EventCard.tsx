"use client";

import Link from "next/link";
import { MapPin, Heart, Star, Calendar, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface EventCardProps {
    id: string;
    slug: string;
    title: string;
    date: string;
    time: string;
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
    time,
    location,
    price,
    image,
    category,
    organizer,
    rating = 4,
    reviewCount = 0,
}: EventCardProps) {
    const dateParts = date.split(" ");
    const month = dateParts[2]?.slice(0, 3).toUpperCase() || "JAN";
    const day = dateParts[1] || "01";

    return (
        <Link
            href={`/events/${slug}`}
            className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer flex flex-row md:flex-col h-full transform hover:-translate-y-1 relative min-w-[280px] md:min-w-0"
        >
            <div className="relative w-[120px] md:w-full md:h-52 shrink-0 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                <button
                    type="button"
                    className="hidden md:flex absolute top-3 right-3 bg-white/80 backdrop-blur-md p-2.5 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all active:scale-95 z-10"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <Heart className="text-gray-500 hover:text-red-500 transition-colors" size={18} />
                </button>

                <div className="hidden md:block absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm text-xs font-bold text-indigo-600 uppercase tracking-wide z-10">
                    {category}
                </div>
            </div>

            <div className="p-4 md:p-5 flex flex-col flex-1 min-w-0 justify-between">
                <div>
                    <div className="md:hidden flex items-center gap-2 mb-2 text-xs">
                         <span className="font-bold text-indigo-600 uppercase">{category}</span>
                         <span className="text-gray-300">•</span>
                         <span className="text-gray-500">{date}</span>
                    </div>

                    <div className="flex gap-4 items-start mb-2">
                        <div className="hidden md:flex flex-col items-center min-w-[50px] bg-indigo-50/50 rounded-xl p-2 border border-indigo-100">
                            <span className="text-indigo-600 font-bold text-xs uppercase tracking-wider">
                                {month}
                            </span>
                            <span className="text-gray-900 font-black text-xl">{day}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base md:text-lg leading-tight text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1">
                                {title}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-500 truncate mb-2">{organizer}</p>
                            
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center text-gray-500 text-xs">
                                    <MapPin size={14} className="mr-1.5 text-gray-400 shrink-0" />
                                    <span className="truncate">{location}</span>
                                </div>
                                <div className="hidden md:flex items-center text-gray-500 text-xs">
                                    <Clock size={14} className="mr-1.5 text-gray-400 shrink-0" />
                                    <span className="truncate">{time}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-3 mt-2 md:mt-4 border-t border-dashed border-gray-100 flex items-end justify-between">
                    <div className="hidden md:flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg">
                        <Star size={12} fill="currentColor" className="mr-1" />
                        <span className="text-xs font-bold text-yellow-700">{rating}</span>
                        {reviewCount > 0 && (
                            <span className="text-[10px] text-yellow-600/70 ml-1">({reviewCount})</span>
                        )}
                    </div>
                    
                    <div className="flex flex-col items-end ml-auto">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Mulai dari</span>
                        <span className="font-bold text-indigo-600 text-sm md:text-lg">
                            {price === 0 ? "Gratis" : formatCurrency(price)}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
