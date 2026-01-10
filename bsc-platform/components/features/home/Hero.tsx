"use client";

import { Search, MapPin, Calendar } from "lucide-react";

export function Hero() {
    return (
        <div className="relative h-[550px] w-full bg-slate-900 overflow-hidden">
            {/* Background Image */}
            <img
                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                alt="Hero Background"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/40" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center px-4 text-center z-10 pt-16">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg tracking-tight">
                    Temukan Pengalaman <br /> Tak Terlupakan.
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl font-light">
                    Jelajahi konser, workshop, dan festival terbaik di sekitarmu.
                </p>

                {/* Search Box - Floating Style */}
                <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-2 md:p-3 flex flex-col md:flex-row gap-2">
                    {/* Event Search */}
                    <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
                        <Search className="text-gray-400 mr-3 shrink-0" size={20} />
                        <div className="flex flex-col text-left w-full">
                            <label className="text-xs font-bold text-gray-500 uppercase">
                                Cari Event
                            </label>
                            <input
                                type="text"
                                placeholder="Konser, Festival..."
                                className="w-full outline-none text-gray-800 font-medium placeholder-gray-300"
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
                        <MapPin className="text-gray-400 mr-3 shrink-0" size={20} />
                        <div className="flex flex-col text-left w-full">
                            <label className="text-xs font-bold text-gray-500 uppercase">
                                Lokasi
                            </label>
                            <input
                                type="text"
                                placeholder="Jakarta, Indonesia"
                                className="w-full outline-none text-gray-800 font-medium placeholder-gray-300"
                            />
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex-1 flex items-center px-4 py-3">
                        <Calendar className="text-gray-400 mr-3 shrink-0" size={20} />
                        <div className="flex flex-col text-left w-full">
                            <label className="text-xs font-bold text-gray-500 uppercase">
                                Tanggal
                            </label>
                            <input
                                type="text"
                                placeholder="Semua Tanggal"
                                className="w-full outline-none text-gray-800 font-medium placeholder-gray-300"
                            />
                        </div>
                    </div>

                    {/* Search Button */}
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md transform active:scale-95">
                        Cari
                    </button>
                </div>
            </div>
        </div>
    );
}
