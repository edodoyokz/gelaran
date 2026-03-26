"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    Loader2,
    CheckCircle,
    ShieldCheck,
} from "lucide-react";
import {
    AuthField,
    AuthFinePrint,
    AuthFormShell,
    AuthIconButton,
    AuthInputShell,
    AuthMessage,
    AuthMetaList,
    AuthPageIntro,
    AuthPrimaryButton,
    AuthSectionCard,
    AuthTextLink,
} from "@/components/shared/auth-ui";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const validatePassword = (pass: string) => {
        if (pass.length < 8) return "Password minimal 8 karakter";
        if (!/[A-Z]/.test(pass)) return "Password harus mengandung huruf besar";
        if (!/[0-9]/.test(pass)) return "Password harus mengandung angka";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Password tidak cocok");
            setIsLoading(false);
            return;
        }

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                    },
                    emailRedirectTo: `${window.location.origin}/login`,
                },
            });

            if (error) {
                if (error.message.includes("already registered")) {
                    setError("Email sudah terdaftar. Silakan login.");
                } else {
                    setError(error.message);
                }
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
            <div className="space-y-8">
                <AuthPageIntro
                    eyebrow="Registration complete"
                    title="Cek email kamu"
                    description={
                        <p>
                            Kami sudah mengirim link verifikasi ke <strong className="font-semibold text-foreground">{email}</strong>.
                            Buka email tersebut untuk mengaktifkan akun dan lanjut masuk ke Gelaran.
                        </p>
                    }
                    align="center"
                />

                <AuthSectionCard tone="success" className="space-y-6 text-center">
                    <div className="mx-auto inline-flex h-18 w-18 items-center justify-center rounded-full bg-white text-(--success) shadow-(--shadow-sm)">
                        <CheckCircle className="h-9 w-9" />
                    </div>
                    <div className="space-y-3">
                        <p className="text-sm leading-7 text-(--success-text)">
                            Jika email belum muncul dalam beberapa menit, periksa folder spam atau promotions,
                            lalu ulangi proses pendaftaran bila diperlukan.
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <Link
                            href="/login"
                            className="inline-flex min-h-12 items-center justify-center rounded-full bg-(--accent-secondary) px-6 py-3 text-sm font-semibold text-white shadow-(--shadow-md) transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--accent-secondary-hover)"
                        >
                            Ke halaman login
                        </Link>
                    </div>
                </AuthSectionCard>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <AuthPageIntro
                title="Create Account"
                description="Start with one account to save tickets, follow favorite organizers, and unlock access to a more personalized event experience."
            />

            <AuthFormShell>
                <AuthSectionCard className="space-y-4">
                    <div className="flex items-start gap-4">
                        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-(--accent-primary) shadow-(--shadow-xs)">
                            <ShieldCheck className="h-5 w-5" />
                        </span>
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-foreground">Standar akun Gelaran</p>
                            <AuthMetaList
                                items={[
                                    "Password minimal 8 karakter dengan kombinasi huruf besar dan angka.",
                                    "Email verifikasi akan dikirim sebelum akun aktif sepenuhnya.",
                                    "Satu akun bisa dipakai untuk pembelian tiket dan akses workspace terkait peran.",
                                ]}
                            />
                        </div>
                    </div>
                </AuthSectionCard>

                {error ? (
                    <AuthMessage tone="danger" title="Pendaftaran belum berhasil" description={error} />
                ) : null}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <AuthField label="Nama lengkap" helper="Nama ini akan tampil di profil akun">
                        <AuthInputShell
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nama lengkap kamu"
                        />
                    </AuthField>

                    <AuthField label="Email" helper="Gunakan email yang aktif untuk verifikasi">
                        <AuthInputShell
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nama@email.com"
                        />
                    </AuthField>

                    <AuthField label="Password" helper="Minimal 8 karakter, huruf besar, dan angka">
                        <AuthInputShell
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Buat password"
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
                    </AuthField>

                    <AuthField
                        label="Konfirmasi password"
                        error={confirmPassword && password !== confirmPassword ? "Password tidak cocok" : undefined}
                    >
                        <AuthInputShell
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ulangi password"
                            className={confirmPassword
                                ? password === confirmPassword
                                    ? "border-[rgba(19,135,108,0.32)]"
                                    : "border-[rgba(217,79,61,0.32)]"
                                : undefined}
                        />
                    </AuthField>

                    <AuthPrimaryButton type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Mendaftar...
                            </>
                        ) : (
                            "Daftar sekarang"
                        )}
                    </AuthPrimaryButton>
                </form>
            </AuthFormShell>

            <AuthFinePrint className="mt-8">
                Dengan mendaftar, kamu menyetujui <Link href="/terms" className="font-semibold text-[#015959] hover:underline">Syarat & Ketentuan</Link> dan <Link href="/privacy" className="font-semibold text-[#015959] hover:underline">Kebijakan Privasi</Link> kami.
            </AuthFinePrint>

            <footer className="mt-12 text-center">
                <p className="text-[#3f4948] text-sm">
                    Sudah punya akun? {" "}
                    <AuthTextLink href="/login">
                        Masuk di sini
                    </AuthTextLink>
                </p>
            </footer>
        </div>
    );
}
