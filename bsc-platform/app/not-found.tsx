import Link from "next/link";
import {
    Home,
    Search,
    Compass,
    Calendar,
    Ticket,
    ArrowRight,
    MapPin,
} from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-2xl mx-auto text-center">
                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 bg-indigo-100 rounded-full opacity-50 animate-pulse" />
                    </div>
                    <div className="relative">
                        <svg
                            className="w-48 h-48 mx-auto text-indigo-600"
                            viewBox="0 0 200 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-labelledby="notFoundTitle"
                            role="img"
                        >
                            <title id="notFoundTitle">Page not found illustration</title>
                            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" className="animate-spin-slow" style={{ animationDuration: "20s" }} />
                            <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                            <path
                                d="M70 80 L90 100 L70 120 M130 80 L110 100 L130 120"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <circle cx="100" cy="140" r="8" fill="currentColor" />
                        </svg>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                            <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                404
                            </span>
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Oops! Page Not Found
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    The page you&apos;re looking for seems to have wandered off. 
                    Don&apos;t worry, let&apos;s get you back on track!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg shadow-indigo-200"
                    >
                        <Home className="h-5 w-5" />
                        Back to Home
                    </Link>
                    <Link
                        href="/events"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all hover:scale-105 shadow-lg border"
                    >
                        <Compass className="h-5 w-5" />
                        Explore Events
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                    <p className="text-sm text-gray-500 mb-4">Looking for something specific?</p>
                    <form action="/events" method="GET" className="relative max-w-md mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            name="q"
                            placeholder="Search for events, artists, venues..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </form>
                </div>

                <div className="text-left">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                        Quick Links
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link
                            href="/events?category=music"
                            className="group flex items-center gap-3 p-4 bg-white rounded-xl border hover:border-indigo-200 hover:shadow-md transition-all"
                        >
                            <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
                                <Ticket className="h-5 w-5 text-pink-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Music Events</p>
                                <p className="text-sm text-gray-500">Concerts & festivals</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                        </Link>
                        <Link
                            href="/events?category=sports"
                            className="group flex items-center gap-3 p-4 bg-white rounded-xl border hover:border-indigo-200 hover:shadow-md transition-all"
                        >
                            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                <Calendar className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Sports</p>
                                <p className="text-sm text-gray-500">Matches & tournaments</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                        </Link>
                        <Link
                            href="/events?type=nearby"
                            className="group flex items-center gap-3 p-4 bg-white rounded-xl border hover:border-indigo-200 hover:shadow-md transition-all"
                        >
                            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                <MapPin className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Nearby Events</p>
                                <p className="text-sm text-gray-500">Events near you</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                        </Link>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t">
                    <p className="text-sm text-gray-500">
                        Need help?{" "}
                        <Link href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium">
                            Contact our support team
                        </Link>
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin-slow {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
            `}</style>
        </div>
    );
}
