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
import { getAuthDemoConfig } from "@/lib/demo-mode";
import { getPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

const DEMO_ACCOUNTS = [
    {
        category: "Admin",
        icon: Shield,
        accentClassName: "border-[rgba(217,79,61,0.18)] bg-[rgba(217,79,61,0.08)]",
        badgeClassName: "bg-[rgba(217,79,61,0.14)] text-[#ba1a1a]",
        accounts: [{ email: "admin@gelaran.id", name: "Admin Gelaran Solo", role: "SUPER_ADMIN" }],
    },
    {
        category: "Organizers",
        icon: Briefcase,
        accentClassName: "border-[rgba(41,179,182,0.2)] bg-[#015959]/5",
        badgeClassName: "bg-[rgba(41,179,182,0.14)] text-[#015959]",
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
        accentClassName: "border-[rgba(19,135,108,0.2)] bg-[#13876c]/10",
        badgeClassName: "bg-[rgba(19,135,108,0.14)] text-[#0e5d4a]",
        accounts: [
            { email: "budi.santoso@email.com", name: "Budi Santoso", role: "CUSTOMER" },
            { email: "siti.nur@email.com", name: "Siti Nurhaliza", role: "CUSTOMER" },
            { email: "ahmad.rizki@email.com", name: "Ahmad Rizki", role: "CUSTOMER" },
        ],
    },
] as const;

const DEFAULT_PASSWORD = "password123";
const authDemoConfig = getAuthDemoConfig(getPublicEnv().NEXT_PUBLIC_APP_STAGE);

function sanitizeReturnUrl(value: string | null) {
    if (!value) return "/";
    if (!value.startsWith("/")) return "/";
    if (value.startsWith("//")) return "/";

    try {
        const parsed = new URL(value, "http://localhost");
        if (parsed.origin !== "http://localhost") return "/";
        if (!parsed.pathname.startsWith("/")) return "/";

        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
        return "/";
    }
}

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = sanitizeReturnUrl(searchParams.get("returnUrl"));

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDemoMode, setShowDemoMode] = useState(authDemoConfig.defaultExpanded);

    const performLogin = async (loginEmail: string, loginPassword: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword,
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

    const handleQuickLogin = async (demoEmail: string) => {
        if (!authDemoConfig.enabled) {
            setError("Demo login hanya tersedia di local development");
            return;
        }

        setEmail(demoEmail);
        setPassword(DEFAULT_PASSWORD);
        await performLogin(demoEmail, DEFAULT_PASSWORD);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await performLogin(email, password);
    };

    return (
        <AuthFormShell>
            {authDemoConfig.enabled ? (
                <div className="space-y-3 rounded-xl border border-[rgba(190,200,200,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(244,243,241,0.84))] p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#015959] shadow-[0px_2px_8px_rgba(0,32,32,0.04)]">
                                <Sparkles className="h-4 w-4" />
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Demo Mode</p>
                                <p className="text-[10px] uppercase tracking-wider text-[#6f7978]">
                                    Pass: {DEFAULT_PASSWORD}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowDemoMode(!showDemoMode)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#015959] transition-colors duration-200 hover:text-[#1e6868]"
                        >
                            {showDemoMode ? "Tutup" : "Buka"}
                            <ArrowRight className={`h-3 w-3 transition-transform duration-200 ${showDemoMode ? "rotate-90" : ""}`} />
                        </button>
                    </div>

                    {showDemoMode ? (
                        <div className="grid gap-3 pt-2 border-t border-[rgba(190,200,200,0.22)]">
                            {DEMO_ACCOUNTS.map((group) => (
                                <section
                                    key={group.category}
                                    className={`rounded-lg border p-3 shadow-sm ${group.accentClassName}`}
                                >
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded bg-white ${group.badgeClassName}`}>
                                            <group.icon className="h-3.5 w-3.5" />
                                        </span>
                                        <p className="text-xs font-semibold text-foreground">{group.category}</p>
                                    </div>
                                    <div className="grid gap-1.5">
                                        {group.accounts.map((account) => (
                                            <button
                                                key={account.email}
                                                type="button"
                                                onClick={() => handleQuickLogin(account.email)}
                                                disabled={isLoading}
                                                className="w-full rounded-md border border-white/70 bg-white/88 px-3 py-2 text-left shadow-sm transition-all duration-200 hover:border-[#6f908e] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-xs font-semibold text-foreground">{account.name}</p>
                                                        <p className="truncate text-[10px] text-[#3f4948]">{account.email}</p>
                                                    </div>
                                                    <span className="shrink-0 rounded border border-[#bec8c8] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#3f4948]">
                                                        {account.role.replace(/_/g, " ")}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    ) : null}
                </div>
            ) : null}

            {error ? (
                <AuthMessage tone="danger" title="Masuk belum berhasil" description={error} />
            ) : null}

                <form className="space-y-7" onSubmit={handleSubmit}>
                    <AuthField
                        htmlFor="email"
                        label="Email address"
                    >
                    <AuthInputShell
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="archivist@gelaran.com"
                        icon={Mail}
                    />
                </AuthField>

                    <AuthField
                        htmlFor="password"
                        label="Password"
                        helper={
                            <Link
                            href="/forgot-password"
                            className="font-semibold text-[#015959] transition-colors duration-200 hover:text-[#1e6868]"
                        >
                            Lupa password?
                        </Link>
                    }
                >
                    <AuthPasswordShell
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        icon={Lock}
                        endAdornment={
                            <AuthIconButton
                                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </AuthIconButton>
                        }
                    />
                </AuthField>

                <AuthPrimaryButton type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Masuk...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </AuthPrimaryButton>
            </form>

            <AuthLegalNote className="pt-2 text-center text-[0.83rem]">
                By signing in, you continue into your Gelaran tickets, archives, and workspace journey.
            </AuthLegalNote>
        </AuthFormShell>
    );
}

export default function LoginPage() {
    return (
        <AuthLayout
            title="Rediscover Solo's Heritage"
            aside={
                <div className="max-w-md space-y-6 mt-8">
                    <AuthKicker className="bg-white/10 text-white backdrop-blur-md border border-white/20">Editorial entry</AuthKicker>
                    <AuthFeatureGrid
                        items={[
                            {
                                title: "Secure access",
                                description: "Protected sign-in flow with the same return-url routing used across the current customer journey.",
                                icon: Shield,
                            },
                            {
                                title: "Fast review path",
                                description: "Sign in with your existing account or demo shortcuts to explore secure workspaces.",
                                icon: Sparkles,
                            },
                        ]}
                        className="opacity-90 [&_article]:bg-white/10 [&_article]:border-white/20 [&_article]:backdrop-blur-md [&_article]:text-white [&_h3]:text-white [&_p]:text-white/80 [&_span]:text-white [&_span]:bg-white/20"
                    />
                </div>
            }
        >
            <AuthPageIntro
                eyebrow="Archive access"
                title="Welcome Back"
                description="Enter your credentials to access the digital archives of the royal city."
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

            <footer className="mt-8 text-center">
                <p className="text-[#3f4948] text-sm">
                    New to the archive? {" "}
                    <AuthTextLink href="/register">
                        Create an account
                    </AuthTextLink>
                </p>
            </footer>
        </AuthLayout>
    );
}
