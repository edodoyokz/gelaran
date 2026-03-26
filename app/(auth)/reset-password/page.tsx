"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Eye,
    EyeOff,
    Lock,
    Loader2,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    ShieldCheck,
} from "lucide-react";
import {
    AuthField,
    AuthFormShell,
    AuthIconButton,
    AuthInputShell,
    AuthMessage,
    AuthMetaList,
    AuthPageIntro,
    AuthPrimaryButton,
    AuthSecondaryLink,
    AuthSectionCard,
} from "@/components/shared/auth-ui";
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
            const {
                data: { session },
            } = await supabase.auth.getSession();

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

    const passwordStrength = useMemo((): { strength: number; label: string; barClassName: string; textClassName: string } => {
        if (!password) {
            return {
                strength: 0,
                label: "Belum diisi",
                barClassName: "bg-transparent",
                textClassName: "text-(--text-muted)",
            };
        }

        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) {
            return {
                strength: 25,
                label: "Lemah",
                barClassName: "bg-[#b3261e]",
                textClassName: "text-[#b3261e]",
            };
        }
        if (score <= 4) {
            return {
                strength: 50,
                label: "Sedang",
                barClassName: "bg-[#FBC117]",
                textClassName: "text-[#9d7400]",
            };
        }
        if (score <= 5) {
            return {
                strength: 75,
                label: "Kuat",
                barClassName: "bg-[#29B3B6]",
                textClassName: "text-[#015959]",
            };
        }

        return {
            strength: 100,
            label: "Sangat kuat",
            barClassName: "bg-[#13876c]",
            textClassName: "text-[#0e5d4a]",
        };
    }, [password]);

    if (isValidSession === null) {
        return (
            <div className="flex flex-col h-full items-center justify-center rounded-3xl border border-[#bec8c8]/20 bg-[#faf9f7] shadow-[0px_4px_12px_rgba(0,32,32,0.02)]">
                <Loader2 className="h-8 w-8 animate-spin text-[#015959]" />
            </div>
        );
    }

    if (!isValidSession) {
        return (
            <div className="flex flex-col h-full">
                <AuthPageIntro
                    title="Link tidak valid"
                    description="Link reset password tidak valid atau sudah kadaluarsa. Minta email reset baru untuk melanjutkan dengan aman."
                    align="center"
                />

                <AuthSectionCard tone="danger" className="space-y-6 text-center">
                    <div className="mx-auto inline-flex h-18 w-18 items-center justify-center rounded-full bg-white text-[#b3261e] shadow-[0px_4px_12px_rgba(0,32,32,0.02)]">
                        <AlertCircle className="h-9 w-9" />
                    </div>
                    <p className="text-sm leading-7 text-[#8c1d18]">
                        Token pemulihan mungkin sudah digunakan atau masa aktifnya habis. Gunakan link terbaru agar proses reset tetap aman.
                    </p>
                    <div className="flex justify-center mt-8">
                        <Link
                            href="/forgot-password"
                            className="inline-flex min-h-12 items-center justify-center rounded-none bg-[#015959] hover:bg-[#1e6868] px-6 py-3 text-sm font-semibold text-white shadow-[0px_4px_12px_rgba(0,32,32,0.08)] transition-all duration-300"
                        >
                            Minta link baru
                        </Link>
                    </div>
                    <div className="flex justify-center mt-4">
                        <AuthSecondaryLink href="/login" className="gap-2">
                            <ArrowLeft className="h-4 w-4 text-[#1a1c1b]" />
                            Kembali ke login
                        </AuthSecondaryLink>
                    </div>
                </AuthSectionCard>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex flex-col h-full">
                <AuthPageIntro
                    title="Password berhasil diubah"
                    description="Password akun kamu sudah diperbarui. Kamu akan dialihkan ke halaman login dalam beberapa detik."
                    align="center"
                />

                <AuthSectionCard tone="success" className="space-y-6 text-center">
                    <div className="mx-auto inline-flex h-18 w-18 items-center justify-center rounded-full bg-white text-[#13876c] shadow-[0px_4px_12px_rgba(0,32,32,0.02)]">
                        <CheckCircle className="h-9 w-9" />
                    </div>
                    <p className="text-sm leading-7 text-[#0e5d4a]">
                        Gunakan password baru saat login berikutnya dan simpan di password manager tepercaya untuk keamanan yang lebih baik.
                    </p>
                    <div className="flex justify-center mt-8">
                        <AuthSecondaryLink href="/login" className="gap-2">
                            <ArrowLeft className="h-4 w-4 text-[#1a1c1b]" />
                            Masuk sekarang
                        </AuthSecondaryLink>
                    </div>
                </AuthSectionCard>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <AuthPageIntro
                title="Reset password"
                description="Buat password baru yang lebih kuat untuk akun kamu. Setelah tersimpan, password lama tidak akan bisa digunakan lagi."
            />

            <AuthFormShell>
                <AuthSectionCard className="space-y-4">
                    <div className="flex items-start gap-4">
                        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#015959] shadow-[0px_4px_12px_rgba(0,32,32,0.02)]">
                            <ShieldCheck className="h-5 w-5" />
                        </span>
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-[#1a1c1b]">Rekomendasi keamanan</p>
                            <AuthMetaList
                                items={[
                                    "Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol bila memungkinkan.",
                                    "Hindari memakai password lama atau pola yang mudah ditebak.",
                                    "Simpan password baru di password manager agar tidak perlu menuliskannya ulang.",
                                ]}
                            />
                        </div>
                    </div>
                </AuthSectionCard>

                {error ? (
                    <AuthMessage tone="danger" title="Password belum diperbarui" description={error} />
                ) : null}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <AuthField label="Password baru" helper="Minimal 8 karakter dengan huruf besar, kecil, dan angka">
                        <AuthInputShell
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan password baru"
                            inputClassName="pr-12"
                        />
                        <div className="-mt-[3.35rem] flex justify-end pr-3">
                            <AuthIconButton
                                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </AuthIconButton>
                        </div>

                        <div className="space-y-3 rounded-2xl border border-[#bec8c8]/20 bg-[#f4f3f1] p-4 mt-8">
                            <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-[#6f7978]">
                                <span>Kekuatan password</span>
                                <span className={`font-semibold ${passwordStrength.textClassName}`}>{passwordStrength.label}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-[#e1e3e1]">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${passwordStrength.barClassName}`}
                                    style={{ width: `${passwordStrength.strength}%` }}
                                />
                            </div>
                            <AuthMetaList
                                items={[
                                    `Minimal 8 karakter${password.length >= 8 ? " — terpenuhi" : ""}`,
                                    `Mengandung huruf besar${/[A-Z]/.test(password) ? " — terpenuhi" : ""}`,
                                    `Mengandung huruf kecil${/[a-z]/.test(password) ? " — terpenuhi" : ""}`,
                                    `Mengandung angka${/[0-9]/.test(password) ? " — terpenuhi" : ""}`,
                                ]}
                                className="gap-2 text-xs"
                            />
                        </div>
                    </AuthField>

                    <AuthField
                        label="Konfirmasi password"
                        error={confirmPassword && password !== confirmPassword ? "Password tidak cocok" : undefined}
                        helper={confirmPassword && password === confirmPassword ? "Password cocok" : undefined}
                    >
                        <AuthInputShell
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ulangi password baru"
                            inputClassName="pr-12"
                            className={confirmPassword
                                ? password === confirmPassword
                                    ? "border-[rgba(19,135,108,0.32)]"
                                    : "border-[rgba(217,79,61,0.32)]"
                                : undefined}
                        />
                        <div className="-mt-[3.35rem] flex justify-end pr-3">
                            <AuthIconButton
                                aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </AuthIconButton>
                        </div>
                    </AuthField>

                    <AuthPrimaryButton type="submit" disabled={isLoading || !password || !confirmPassword}>
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan password baru"
                        )}
                    </AuthPrimaryButton>
                </form>

                <div className="flex justify-center mt-8">
                    <AuthSecondaryLink href="/login" className="gap-2">
                        <ArrowLeft className="h-4 w-4 text-[#1a1c1b]" />
                        Kembali ke login
                    </AuthSecondaryLink>
                </div>
            </AuthFormShell>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="flex flex-col h-full items-center justify-center rounded-3xl border border-[#bec8c8]/20 bg-[#faf9f7] shadow-[0px_4px_12px_rgba(0,32,32,0.02)]">
                    <Loader2 className="h-8 w-8 animate-spin text-[#015959]" />
                </div>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}
