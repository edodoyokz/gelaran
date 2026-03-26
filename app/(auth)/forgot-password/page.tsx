"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle, ArrowLeft, LifeBuoy } from "lucide-react";
import {
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
            <div className="flex flex-col h-full">
                <AuthPageIntro
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
                        <CheckCircle className="h-9 w-9" />
                    </div>
                    <p className="text-sm leading-7 text-[#0e5d4a]">
                        Periksa folder spam jika email belum muncul. Link reset biasanya hanya aktif untuk waktu terbatas.
                    </p>
                    <div className="flex justify-center mt-8">
                        <AuthSecondaryLink href="/login" className="gap-2">
                            <ArrowLeft className="h-4 w-4 text-[#1a1c1b]" />
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
                title="Lupa password?"
                description="Masukkan email akun kamu. Kami akan mengirim link reset yang aman agar kamu bisa membuat password baru tanpa mengubah data akun lainnya."
            />

            <AuthFormShell>
                <AuthSectionCard className="space-y-4">
                    <div className="flex items-start gap-4">
                        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#015959] shadow-[0px_4px_12px_rgba(0,32,32,0.02)]">
                            <LifeBuoy className="h-5 w-5" />
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

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <AuthField label="Email akun" helper="Kami akan kirim instruksi reset ke email ini">
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

                    <AuthPrimaryButton type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Mengirim...
                            </>
                        ) : (
                            "Kirim link reset"
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
