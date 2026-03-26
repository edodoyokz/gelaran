"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    Loader2,
    Briefcase,
    ShoppingBag,
    Shield,
    Sparkles,
    ArrowRight,
} from "lucide-react";
import {
    AuthField,
    AuthFinePrint,
    AuthFormShell,
    AuthIconButton,
    AuthInputShell,
    AuthMessage,
    AuthPageIntro,
    AuthPrimaryButton,
    AuthSectionCard,
    AuthTextLink,
} from "@/components/shared/auth-ui";
import { getAuthDemoConfig } from "@/lib/demo-mode";
import { getPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

const DEMO_ACCOUNTS = [
    {
        category: "Admin",
        icon: Shield,
        accentClassName: "border-[rgba(217,79,61,0.18)] bg-[rgba(217,79,61,0.08)]",
        badgeClassName: "bg-[rgba(217,79,61,0.14)] text-(--error-text)",
        accounts: [{ email: "admin@gelaran.id", name: "Admin Gelaran Solo", role: "SUPER_ADMIN" }],
    },
    {
        category: "Organizers",
        icon: Briefcase,
        accentClassName: "border-[rgba(41,179,182,0.2)] bg-(--surface-brand-soft)",
        badgeClassName: "bg-[rgba(41,179,182,0.14)] text-(--accent-primary)",
        accounts: [
            { email: "info@sriwedari.solo.go.id", name: "Taman Sriwedari", role: "ORGANIZER" },
            { email: "info@gormanahan.solo.go.id", name: "GOR Manahan", role: "ORGANIZER" },
            { email: "hello@solocreativehub.id", name: "Solo Creative Hub", role: "ORGANIZER" },
            { email: "contact@solomusicfest.id", name: "Solo Music Fest", role: "ORGANIZER" },
            { email: "party@solonightlife.id", name: "Solo Nightlife", role: "ORGANIZER" },
        ],
    },
    {
        category: "Customers",
        icon: ShoppingBag,
        accentClassName: "border-[rgba(19,135,108,0.2)] bg-(--success-bg)",
        badgeClassName: "bg-[rgba(19,135,108,0.14)] text-(--success-text)",
        accounts: [
            { email: "budi.santoso@email.com", name: "Budi Santoso", role: "CUSTOMER" },
            { email: "siti.nur@email.com", name: "Siti Nurhaliza", role: "CUSTOMER" },
            { email: "ahmad.rizki@email.com", name: "Ahmad Rizki", role: "CUSTOMER" },
        ],
    },
] as const;

const DEFAULT_PASSWORD = "password123";
const authDemoConfig = getAuthDemoConfig(getPublicEnv().NEXT_PUBLIC_APP_STAGE);

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get("returnUrl") || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDemoMode, setShowDemoMode] = useState(authDemoConfig.defaultExpanded);

    const handleQuickLogin = async (demoEmail: string) => {
        if (!authDemoConfig.enabled) {
            setError("Demo login hanya tersedia di local development");
            return;
        }

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
        <AuthFormShell>
            {authDemoConfig.enabled ? (
                <AuthSectionCard className="space-y-4">
                    <div className="flex items-start gap-4">
                        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-(--accent-primary) shadow-(--shadow-xs)">
                            <Sparkles className="h-5 w-5" />
                        </span>
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm font-semibold text-foreground">Demo mode tersedia</p>
                                <p className="text-sm leading-6 text-(--text-secondary)">
                                    Gunakan akun siap pakai untuk meninjau dashboard customer, organizer,
                                    atau admin tanpa membuat kredensial baru.
                                </p>
                            </div>
                            <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">
                                Password default: {DEFAULT_PASSWORD}
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowDemoMode(!showDemoMode)}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-(--accent-primary) transition-colors duration-200 hover:text-(--accent-primary-hover)"
                            >
                                {showDemoMode ? "Sembunyikan akun demo" : "Tampilkan akun demo"}
                                <ArrowRight className={`h-4 w-4 transition-transform duration-200 ${showDemoMode ? "rotate-90" : ""}`} />
                            </button>
                        </div>
                    </div>

                    {showDemoMode ? (
                        <div className="grid gap-4">
                            {DEMO_ACCOUNTS.map((group) => (
                                <section
                                    key={group.category}
                                    className={`rounded-3xl border p-4 shadow-(--shadow-xs) sm:p-5 ${group.accentClassName}`}
                                >
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${group.badgeClassName}`}>
                                            <group.icon className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{group.category}</p>
                                            <p className="text-xs text-(--text-secondary)">
                                                Login cepat untuk alur {group.category.toLowerCase()}.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid gap-2.5">
                                        {group.accounts.map((account) => (
                                            <button
                                                key={account.email}
                                                type="button"
                                                onClick={() => handleQuickLogin(account.email)}
                                                disabled={isLoading}
                                                className="w-full rounded-2xl border border-white/70 bg-white/88 px-4 py-3 text-left shadow-(--shadow-xs) transition-all duration-200 hover:-translate-y-0.5 hover:border-(--border-strong) disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">{account.name}</p>
                                                        <p className="text-xs text-(--text-secondary)">{account.email}</p>
                                                    </div>
                                                    <span className="rounded-full border border-(--border) px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-(--text-secondary)">
                                                        {account.role}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    ) : null}
                </AuthSectionCard>
            ) : null}

            {error ? (
                <AuthMessage tone="danger" title="Masuk belum berhasil" description={error} />
            ) : null}

            <form className="space-y-5" onSubmit={handleSubmit}>
                <AuthField
                    label="Email"
                    helper="Gunakan email yang terhubung ke akun Gelaran"
                >
                    <AuthInputShell
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        icon={Mail}
                    />
                </AuthField>

                <AuthField
                    label="Password"
                    helper={
                        <Link
                            href="/forgot-password"
                            className="font-semibold text-(--accent-primary) transition-colors duration-200 hover:text-(--accent-primary-hover)"
                        >
                            Lupa password?
                        </Link>
                    }
                >
                    <AuthInputShell
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password"
                        icon={Lock}
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

                <AuthPrimaryButton type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Masuk...
                        </>
                    ) : (
                        "Masuk ke Gelaran"
                    )}
                </AuthPrimaryButton>
            </form>
        </AuthFormShell>
    );
}

export default function LoginPage() {
    return (
        <div className="flex flex-col h-full">
            <AuthPageIntro
                title="Welcome Back"
                description="Enter your credentials to access the digital archives of the royal city, and manage your tickets, events, or workspaces."
            />

            <Suspense
                fallback={
                    <div className="flex h-64 items-center justify-center rounded-3xl border border-[#bec8c8]/20 bg-[#faf9f7] shadow-[0px_4px_12px_rgba(0,32,32,0.02)]">
                        <Loader2 className="h-8 w-8 animate-spin text-[#015959]" />
                    </div>
                }
            >
                <LoginForm />
            </Suspense>

            <footer className="mt-12 text-center">
                <p className="text-[#3f4948] text-sm">
                    Belum punya akun? {" "}
                    <AuthTextLink href="/register">
                        Daftar sekarang
                    </AuthTextLink>
                </p>
            </footer>
        </div>
    );
}
