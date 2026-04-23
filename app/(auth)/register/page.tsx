"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
    AuthFeatureGrid,
    AuthFormShell,
    AuthIconButton,
    AuthInputShell,
    AuthKicker,
    AuthLegalNote,
    AuthMessage,
    AuthPageIntro,
    AuthPasswordShell,
    AuthPrimaryButton,
    AuthSectionCard,
    AuthTextLink,
} from "@/components/shared/auth-ui";
import { AuthLayout } from "@/components/shared/phase-two-shells";
import { createClient } from "@/lib/supabase/client";

const registerSchema = z.object({
    name: z.string().min(1, "Nama lengkap harus diisi"),
    email: z.string().email("Format email tidak valid"),
    password: z.string()
        .min(8, "Password minimal 8 karakter")
        .regex(/[A-Z]/, "Password harus mengandung huruf besar")
        .regex(/[0-9]/, "Password harus mengandung angka"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const confirmPasswordVal = watch("confirmPassword");
    const passwordVal = watch("password");

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            const { error: signUpError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        name: data.name,
                    },
                    emailRedirectTo: `${window.location.origin}/login`,
                },
            });

            if (signUpError) {
                if (signUpError.message.includes("already registered")) {
                    setError("Email sudah terdaftar. Silakan login.");
                } else {
                    setError(signUpError.message);
                }
                return;
            }

            setRegisteredEmail(data.email);
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
                            Kami sudah mengirim link verifikasi ke <strong className="font-semibold text-foreground">{registeredEmail}</strong>.
                            Buka email tersebut untuk mengaktifkan akun dan lanjut masuk ke Gelaran.
                        </p>
                    }
                    align="center"
                />

                <AuthSectionCard tone="success" className="space-y-6 text-center">
                    <div className="mx-auto inline-flex h-18 w-18 items-center justify-center rounded-full bg-white text-[#13876c] shadow-[0px_4px_12px_rgba(0,32,32,0.02)]">
                        <CheckCircle className="h-9 w-9" />
                    </div>
                    <div className="space-y-3">
                        <p className="text-sm leading-7 text-[#0e5d4a]">
                            Jika email belum muncul dalam beberapa menit, periksa folder spam atau promotions,
                            lalu ulangi proses pendaftaran bila diperlukan.
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <Link
                            href="/login"
                            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#015959] px-6 py-3 text-sm font-semibold text-white shadow-[0px_4px_12px_rgba(0,32,32,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1e6868]"
                        >
                            Ke halaman login
                        </Link>
                    </div>
                </AuthSectionCard>
            </div>
        );
    }

    return (
        <AuthLayout
            title="Create your account"
            aside={
                <div className="max-w-md space-y-6 mt-8">
                    <AuthKicker className="bg-white/10 text-white backdrop-blur-md border border-white/20">Join the pulse</AuthKicker>
                    <AuthFeatureGrid
                        items={[
                            {
                                title: "Early access",
                                description: "Get closer to new releases, booking windows, and featured cultural programming.",
                                icon: CheckCircle,
                            },
                            {
                                title: "Protected profile",
                                description: "Enforces current password rules and email verification before full access.",
                                icon: ShieldCheck,
                            },
                        ]}
                        className="opacity-90 [&_article]:bg-white/10 [&_article]:border-white/20 [&_article]:backdrop-blur-md [&_article]:text-white [&_h3]:text-white [&_p]:text-white/80 [&_span]:text-white [&_span]:bg-white/20"
                    />
                </div>
            }
        >
            <AuthPageIntro
                eyebrow="Cultural archive"
                title="Create your account"
                description="Enter your details to begin your journey with Gelaran."
            />
            <AuthFormShell>
                {error ? (
                    <AuthMessage tone="danger" title="Pendaftaran belum berhasil" description={error} />
                ) : null}

                <form className="space-y-7" onSubmit={handleSubmit(onSubmit)}>
                    <AuthField htmlFor="name" label="Full name" error={errors.name?.message}>
                        <AuthInputShell
                            id="name"
                            {...register("name")}
                            type="text"
                            autoComplete="name"
                            required
                            placeholder="Batik Winarno"
                            icon={User}
                        />
                    </AuthField>

                    <AuthField htmlFor="email" label="Email address" error={errors.email?.message}>
                        <AuthInputShell
                            id="email"
                            {...register("email")}
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="archivist@solo.heritage"
                            icon={Mail}
                        />
                    </AuthField>

                    <AuthField htmlFor="password" label="Password" helper="Minimal 8 karakter, huruf besar, dan angka" error={errors.password?.message}>
                        <AuthPasswordShell
                            id="password"
                            {...register("password")}
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            placeholder="••••••••"
                            icon={Lock}
                            endAdornment={
                                <AuthIconButton
                                    type="button"
                                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </AuthIconButton>
                            }
                        />
                    </AuthField>

                    <AuthField
                        htmlFor="confirmPassword"
                        label="Confirm password"
                        error={errors.confirmPassword?.message}
                    >
                        <AuthPasswordShell
                            id="confirmPassword"
                            {...register("confirmPassword")}
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            placeholder="••••••••"
                            icon={Lock}
                            className={confirmPasswordVal
                                ? passwordVal === confirmPasswordVal
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
                            "Create Account"
                        )}
                    </AuthPrimaryButton>
                </form>
            </AuthFormShell>

            <AuthLegalNote className="mt-8 text-center hidden text-xs">
                Dengan mendaftar, kamu menyetujui <Link href="/terms" className="font-semibold text-[#015959] hover:underline">Syarat & Ketentuan</Link> dan <Link href="/privacy" className="font-semibold text-[#015959] hover:underline">Kebijakan Privasi</Link> kami.
            </AuthLegalNote>

            <footer className="mt-8 text-center">
                <p className="text-[#3f4948] text-sm">
                    Already have an account? {" "}
                    <AuthTextLink href="/login">
                        Sign in
                    </AuthTextLink>
                </p>
            </footer>
        </AuthLayout>
    );
}
