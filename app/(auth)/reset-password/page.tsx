"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            const hasRecoveryParams =
                searchParams.get("type") === "recovery" ||
                searchParams.get("code") ||
                window.location.hash.includes("type=recovery");

            if (session || hasRecoveryParams) {
                setIsValidSession(true);
            } else {
                setIsValidSession(false);
            }
        };

        checkSession();
    }, [searchParams]);

    const validatePassword = (pwd: string): string | null => {
        if (pwd.length < 8) {
            return "Password minimal 8 karakter";
        }
        if (!/[A-Z]/.test(pwd)) {
            return "Password harus mengandung huruf besar";
        }
        if (!/[a-z]/.test(pwd)) {
            return "Password harus mengandung huruf kecil";
        }
        if (!/[0-9]/.test(pwd)) {
            return "Password harus mengandung angka";
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (password !== confirmPassword) {
            setError("Password tidak cocok");
            return;
        }

        setIsLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({
                password,
            });

            if (error) {
                if (error.message.includes("same as the old password")) {
                    setError("Password baru tidak boleh sama dengan password lama");
                } else {
                    setError(error.message);
                }
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch {
            setError("Terjadi kesalahan. Coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isValidSession === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!isValidSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Link Tidak Valid</h2>
                    <p className="text-gray-600">
                        Link reset password tidak valid atau sudah kadaluarsa.
                        Silakan minta link reset password baru.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/forgot-password"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Minta Link Baru
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali ke Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Password Berhasil Diubah!</h2>
                    <p className="text-gray-600">
                        Password kamu sudah berhasil diubah.
                        Kamu akan dialihkan ke halaman login dalam beberapa detik...
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-500"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Masuk Sekarang
                    </Link>
                </div>
            </div>
        );
    }

    const passwordStrength = (): { strength: number; label: string; color: string } => {
        if (!password) return { strength: 0, label: "", color: "" };

        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) return { strength: 25, label: "Lemah", color: "bg-red-500" };
        if (score <= 4) return { strength: 50, label: "Sedang", color: "bg-yellow-500" };
        if (score <= 5) return { strength: 75, label: "Kuat", color: "bg-blue-500" };
        return { strength: 100, label: "Sangat Kuat", color: "bg-green-500" };
    };

    const pwdStrength = passwordStrength();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <Link href="/" className="text-3xl font-bold text-indigo-600">
                        BSC<span className="text-gray-800">Tickets</span>
                    </Link>
                    <h2 className="mt-6 text-2xl font-bold text-gray-900">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Buat password baru untuk akun kamu
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password Baru
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
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

                            {password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-gray-500">Kekuatan Password</span>
                                        <span className={`font-medium ${
                                            pwdStrength.strength <= 25 ? "text-red-500" :
                                            pwdStrength.strength <= 50 ? "text-yellow-500" :
                                            pwdStrength.strength <= 75 ? "text-blue-500" : "text-green-500"
                                        }`}>
                                            {pwdStrength.label}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${pwdStrength.color}`}
                                            style={{ width: `${pwdStrength.strength}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <ul className="mt-2 text-xs text-gray-500 space-y-1">
                                <li className={password.length >= 8 ? "text-green-600" : ""}>
                                    • Minimal 8 karakter
                                </li>
                                <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
                                    • Mengandung huruf besar (A-Z)
                                </li>
                                <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>
                                    • Mengandung huruf kecil (a-z)
                                </li>
                                <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>
                                    • Mengandung angka (0-9)
                                </li>
                            </ul>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Konfirmasi Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`appearance-none block w-full pl-10 pr-10 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                                        confirmPassword && password !== confirmPassword
                                            ? "border-red-300"
                                            : confirmPassword && password === confirmPassword
                                            ? "border-green-300"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="mt-1 text-xs text-red-500">Password tidak cocok</p>
                            )}
                            {confirmPassword && password === confirmPassword && (
                                <p className="mt-1 text-xs text-green-600">Password cocok</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !password || !confirmPassword}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan Password Baru"
                        )}
                    </button>
                </form>

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

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                </div>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}
