"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
    AlertTriangle,
    RefreshCw,
    Home,
    ChevronRight,
    Bug,
    MessageCircle,
} from "lucide-react";

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                <div className="text-center mb-8">
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-25" />
                        <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                            <AlertTriangle className="h-12 w-12 text-white" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        Something Went Wrong
                    </h1>
                    <p className="text-gray-600 mb-2">
                        We encountered an unexpected error while processing your request.
                    </p>
                    <p className="text-sm text-gray-500">
                        Don&apos;t worry, our team has been notified and is working on it.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={reset}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg shadow-indigo-200"
                            >
                                <RefreshCw className="h-5 w-5" />
                                Try Again
                            </button>
                            <Link
                                href="/"
                                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                            >
                                <Home className="h-5 w-5" />
                                Go Home
                            </Link>
                        </div>
                    </div>

                    {error.digest && (
                        <div className="px-6 py-4 bg-gray-50 border-t">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Error ID</span>
                                <code className="text-sm font-mono text-gray-700 bg-white px-2 py-1 rounded border">
                                    {error.digest}
                                </code>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        What can you do?
                    </h2>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <div className="p-1.5 bg-green-100 rounded-lg mt-0.5">
                                <RefreshCw className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Refresh the page</p>
                                <p className="text-sm text-gray-500">Sometimes a simple refresh can fix temporary issues</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="p-1.5 bg-blue-100 rounded-lg mt-0.5">
                                <Home className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Go back to homepage</p>
                                <p className="text-sm text-gray-500">Navigate to a safe starting point</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="p-1.5 bg-purple-100 rounded-lg mt-0.5">
                                <MessageCircle className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Contact support</p>
                                <p className="text-sm text-gray-500">If the problem persists, let us know</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="text-center space-y-4">
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        <Bug className="h-4 w-4" />
                        Report this issue
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
