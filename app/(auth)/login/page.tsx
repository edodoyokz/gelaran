"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Loader2, UserCircle, Briefcase, ShoppingBag, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const DEMO_ACCOUNTS = [
    {
        category: "Admin",
        icon: Shield,
        color: "bg-red-100 text-red-600 border-red-200",
        hoverColor: "hover:bg-red-200",
        accounts: [
            { email: "admin@gelaran.id", name: "Admin Gelaran Solo", role: "SUPER_ADMIN" }
        ]
    },
    {
        category: "Organizers",
        icon: Briefcase,
        color: "bg-blue-100 text-blue-600 border-blue-200",
        hoverColor: "hover:bg-blue-200",
        accounts: [
            { email: "info@sriwedari.solo.go.id", name: "Taman Sriwedari", role: "ORGANIZER" },
            { email: "info@gormanahan.solo.go.id", name: "GOR Manahan", role: "ORGANIZER" },
            { email: "hello@solocreativehub.id", name: "Solo Creative Hub", role: "ORGANIZER" },
            { email: "contact@solomusicfest.id", name: "Solo Music Fest", role: "ORGANIZER" },
            { email: "party@solonightlife.id", name: "Solo Nightlife", role: "ORGANIZER" }
        ]
    },
    {
        category: "Customers",
        icon: ShoppingBag,
        color: "bg-green-100 text-green-600 border-green-200",
        hoverColor: "hover:bg-green-200",
        accounts: [
            { email: "budi.santoso@email.com", name: "Budi Santoso", role: "CUSTOMER" },
            { email: "siti.nur@email.com", name: "Siti Nurhaliza", role: "CUSTOMER" },
            { email: "ahmad.rizki@email.com", name: "Ahmad Rizki", role: "CUSTOMER" }
        ]
    }
];

const DEFAULT_PASSWORD = "password123";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get("returnUrl") || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDemoMode, setShowDemoMode] = useState(true);

    const handleQuickLogin = async (demoEmail: string) => {
        setEmail(demoEmail);
        setPassword(DEFAULT_PASSWORD);
        setIsLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithPassword({
                email: demoEmail,
                password: DEFAULT_PASSWORD,
            });

            if (error) {
                if (error.message.includes("Invalid login credentials")) {
                    setError("Email atau password salah");
                } else if (error.message.includes("Email not confirmed")) {
                    setError("Email belum diverifikasi. Cek inbox email kamu.");
                } else {
                    setError(error.message);
                }
                return;
            }

            router.push(returnUrl);
            router.refresh();
        } catch {
            setError("Terjadi kesalahan. Coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message.includes("Invalid login credentials")) {
                    setError("Email atau password salah");
                } else if (error.message.includes("Email not confirmed")) {
                    setError("Email belum diverifikasi. Cek inbox email kamu.");
                } else {
                    setError(error.message);
                }
                return;
            }

            router.push(returnUrl);
            router.refresh();
        } catch {
            setError("Terjadi kesalahan. Coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Demo Mode Toggle */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <UserCircle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-yellow-800">Demo Mode</h3>
                        <p className="mt-1 text-xs text-yellow-700">
                            Klik tombol akun di bawah untuk login cepat. Password: <code className="bg-yellow-100 px-1 rounded">password123</code>
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowDemoMode(!showDemoMode)}
                            className="mt-2 text-xs font-medium text-yellow-800 hover:text-yellow-900 underline"
                        >
                            {showDemoMode ? "Sembunyikan" : "Tampilkan"} Akun Demo
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Login Demo Accounts */}
            {showDemoMode && (
                <div className="space-y-4">
                    {DEMO_ACCOUNTS.map((group) => (
                        <div key={group.category} className="bg-white border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <group.icon className="h-5 w-5 text-gray-600" />
                                <h3 className="font-semibold text-gray-900">{group.category}</h3>
                            </div>
                            <div className="grid gap-2">
                                {group.accounts.map((account) => (
                                    <button
                                        key={account.email}
                                        type="button"
                                        onClick={() => handleQuickLogin(account.email)}
                                        disabled={isLoading}
                                        className={`w-full text-left px-4 py-3 border rounded-lg transition-colors ${group.color} ${group.hoverColor} disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <div className="font-medium text-sm">{account.name}</div>
                                        <div className="text-xs opacity-75 mt-0.5">{account.email}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-50 text-gray-500">atau login manual</span>
                </div>
            </div>

            {/* Manual Login Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Email */}
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

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Forgot Password */}
                <div className="flex items-center justify-end">
                    <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Lupa password?
                    </Link>
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
                            Masuk...
                        </>
                    ) : (
                        "Masuk"
                    )}
                </button>
            </form>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link href="/" className="text-3xl font-bold text-indigo-600">
                        Gelaran<span className="text-gray-800">Solo</span>
                    </Link>
                    <h2 className="mt-6 text-2xl font-bold text-gray-900">
                        Masuk ke akun kamu
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Belum punya akun?{" "}
                        <Link
                            href="/register"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Daftar sekarang
                        </Link>
                    </p>
                </div>

                {/* Form wrapped in Suspense */}
                <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>}>
                    <LoginForm />
                </Suspense>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500 mt-8">
                    Dengan masuk, kamu menyetujui{" "}
                    <Link href="/terms" className="text-indigo-600 hover:underline">
                        Syarat & Ketentuan
                    </Link>{" "}
                    dan{" "}
                    <Link href="/privacy" className="text-indigo-600 hover:underline">
                        Kebijakan Privasi
                    </Link>{" "}
                    kami.
                </p>
            </div>
        </div>
    );
}
