"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                setError(error.message);
                return;
            }

            setSuccess(true);
        } catch {
            setError("Terjadi kesalahan. Coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Cek Email Kamu!</h2>
                    <p className="text-gray-600">
                        Jika email <strong>{email}</strong> terdaftar di sistem kami,
                        kamu akan menerima link untuk reset password.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-500"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali ke Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link href="/" className="text-3xl font-bold text-indigo-600">
                        BSC<span className="text-gray-800">Tickets</span>
                    </Link>
                    <h2 className="mt-6 text-2xl font-bold text-gray-900">
                        Lupa Password?
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Masukkan email kamu dan kami akan mengirimkan link untuk reset password.
                    </p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="nama@email.com"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                Mengirim...
                            </>
                        ) : (
                            "Kirim Link Reset"
                        )}
                    </button>
                </form>

                {/* Back Link */}
                <div className="text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-500"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Kembali ke Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
