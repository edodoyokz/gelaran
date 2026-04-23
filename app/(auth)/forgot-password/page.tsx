"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle, ArrowLeft, LifeBuoy, LockKeyhole, ArrowRight } from "lucide-react";
import {
    AuthEditorialPanel,
    AuthField,
    AuthFormShell,
    AuthInputShell,
    AuthMessage,
    AuthPageIntro,
    AuthPrimaryButton,
    AuthSecondaryLink,
    AuthSectionCard,
} from "@/components/shared/auth-ui";
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
                redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
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
            <div className="flex flex-col h-full">
                <AuthPageIntro
                    eyebrow="Recovery email sent"
                    title="Cek email kamu"
                    description={
                        <p>
                            Jika email <strong className="font-semibold text-[#1a1c1b]">{email}</strong> terdaftar di sistem kami,
                            kamu akan menerima link untuk reset password dalam beberapa saat.
                        </p>
                    }
                    align="center"
                />

                <AuthSectionCard tone="success" className="space-y-6 text-center">
                    <div className="mx-auto inline-flex h-18 w-18 items-center justify-center rounded-full bg-white text-[#13876c] shadow-[0px_4px_12px_rgba(0,32,32,0.02)]">
                        <CheckCircle aria-hidden="true" className="h-9 w-9" />
                    </div>
                    <p className="text-sm leading-7 text-[#0e5d4a]">
                        Periksa folder spam jika email belum muncul. Link reset biasanya hanya aktif untuk waktu terbatas.
                    </p>
                    <div className="flex justify-center mt-8">
                        <AuthSecondaryLink href="/login" className="gap-2">
                            <ArrowLeft aria-hidden="true" className="h-4 w-4 text-[#1a1c1b]" />
                            Kembali ke login
                        </AuthSecondaryLink>
                    </div>
                </AuthSectionCard>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <AuthPageIntro
                eyebrow="Security first"
                title="Lupa password?"
                description="Masukkan email akun kamu. Kami akan mengirim link reset yang aman agar kamu bisa membuat password baru tanpa mengubah data akun lainnya."
            />

            <AuthEditorialPanel
                kicker="Security first"
                title={<>Safeguarding your <span className="italic text-[#1e6868]">cultural</span> access.</>}
                description="Akses tiket, event, dan arsip personal kamu lewat tautan reset yang dikirim ke email terdaftar. Buka dari perangkat yang aman untuk menjaga sesi pemulihan tetap valid."
                badge={
                    <>
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#eef6f5] text-[#015959]">
                            <LockKeyhole aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#6f7978]">256-bit encryption</p>
                            <p className="text-sm text-[#3f4948]">Instruksi reset dikirim melalui alur keamanan akun Gelaran.</p>
                        </div>
                    </>
                }
                className="mb-8"
            />

            <AuthFormShell>
                <AuthSectionCard className="space-y-4 rounded-[1.35rem] border-[rgba(190,200,200,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(244,243,241,0.84))] p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#015959] shadow-[0px_4px_12px_rgba(0,32,32,0.02)]">
                            <LifeBuoy aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <div className="space-y-2 text-sm leading-6 text-[#3f4948]">
                            <p className="font-semibold text-[#1a1c1b]">Sebelum lanjut</p>
                            <p>
                                Gunakan email yang sama dengan akun Gelaran. Setelah email diterima, buka link reset langsung dari perangkat yang aman.
                            </p>
                        </div>
                    </div>
                </AuthSectionCard>

                {error ? (
                    <AuthMessage tone="danger" title="Link reset belum terkirim" description={error} />
                ) : null}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <AuthField htmlFor="email" label="Email akun" helper="Kami akan kirim instruksi reset ke email ini">
                        <AuthInputShell
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="aditya@example.com"
                            icon={Mail}
                        />
                    </AuthField>

                    <AuthPrimaryButton type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
                                Mengirim…
                            </>
                        ) : (
                            <>
                                <span>Kirim link reset</span>
                                <ArrowRight aria-hidden="true" className="h-4 w-4" />
                            </>
                        )}
                    </AuthPrimaryButton>
                </form>

                <div className="flex justify-center mt-8">
                    <AuthSecondaryLink href="/login" className="gap-2">
                        <ArrowLeft aria-hidden="true" className="h-4 w-4 text-[#1a1c1b]" />
                        Kembali ke login
                    </AuthSecondaryLink>
                </div>
            </AuthFormShell>
        </div>
    );
}
