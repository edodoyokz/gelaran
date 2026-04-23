import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function readSources() {
    const [resetPasswordPageSource, forgotPasswordPageSource, authUiSource, proxySource] = await Promise.all([
        readFile(new URL("../app/(auth)/reset-password/page.tsx", import.meta.url), "utf8"),
        readFile(new URL("../app/(auth)/forgot-password/page.tsx", import.meta.url), "utf8"),
        readFile(new URL("../components/shared/auth-ui.tsx", import.meta.url), "utf8"),
        readFile(new URL("../proxy.ts", import.meta.url), "utf8"),
    ]);

    return {
        resetPasswordPageSource,
        forgotPasswordPageSource,
        authUiSource,
        proxySource,
    };
}

test("reset password fields use shared password shell without negative-margin toggle layout", async () => {
    const { resetPasswordPageSource } = await readSources();

    assert.match(resetPasswordPageSource, /<AuthPasswordShell[\s\S]*id="password"/);
    assert.match(resetPasswordPageSource, /<AuthPasswordShell[\s\S]*id="confirmPassword"/);
    assert.doesNotMatch(resetPasswordPageSource, /-mt-\[3\.35rem\]/);
});

test("reset password redirect timeout is stored and cleared on unmount", async () => {
    const { resetPasswordPageSource } = await readSources();

    assert.match(resetPasswordPageSource, /const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> \| null>\(null\)/);
    assert.match(resetPasswordPageSource, /clearTimeout\(redirectTimeoutRef\.current\)/);
    assert.match(resetPasswordPageSource, /redirectTimeoutRef\.current = setTimeout\(/);
});

test("auth recovery loading copy uses ellipsis character", async () => {
    const { resetPasswordPageSource, forgotPasswordPageSource } = await readSources();

    assert.match(resetPasswordPageSource, /Menyimpan…/);
    assert.match(forgotPasswordPageSource, /Mengirim…/);
    assert.doesNotMatch(resetPasswordPageSource, /Menyimpan\.\.\./);
    assert.doesNotMatch(forgotPasswordPageSource, /Mengirim\.\.\./);
});

test("forgot password routes recovery through auth callback before reset page", async () => {
    const { forgotPasswordPageSource } = await readSources();

    assert.match(
        forgotPasswordPageSource,
        /redirectTo:\s*`\$\{window\.location\.origin\}\/auth\/callback\?next=\/reset-password`/
    );
});

test("reset password page relies on the callback route instead of client-side code forwarding", async () => {
    const { resetPasswordPageSource } = await readSources();

    assert.doesNotMatch(resetPasswordPageSource, /searchParams\.get\("code"\)/);
    assert.doesNotMatch(resetPasswordPageSource, /router\.replace\(`\/auth\/callback\?\$\{searchParams\.toString\(\)\}`\)/);
});

test("auth callback sanitizes next redirects to relative paths only", async () => {
    const authCallbackSource = await readFile(
        new URL("../app/auth/callback/route.ts", import.meta.url),
        "utf8"
    );

    assert.match(authCallbackSource, /function sanitizeNextPath/);
    assert.match(authCallbackSource, /!next\.startsWith\("\/"\) \|\| next\.startsWith\("\/\/"\)/);
    assert.match(authCallbackSource, /new URL\(safeNext, origin\)/);
});

test("auth callback supports both pkce code exchange and recovery token verification", async () => {
    const authCallbackSource = await readFile(
        new URL("../app/auth/callback/route.ts", import.meta.url),
        "utf8"
    );

    assert.match(authCallbackSource, /searchParams\.get\("code"\)/);
    assert.match(authCallbackSource, /searchParams\.get\("token_hash"\)/);
    assert.match(authCallbackSource, /searchParams\.get\("type"\)/);
    assert.match(authCallbackSource, /supabase\.auth\.exchangeCodeForSession\(code\)/);
    assert.match(authCallbackSource, /supabase\.auth\.verifyOtp\(\s*\{/);
});

test("proxy keeps reset password reachable for recovery sessions while still guarding login/register", async () => {
    const { proxySource } = await readSources();

    assert.match(proxySource, /const authPaths = \["\/login", "\/register", "\/forgot-password"\]/);
    assert.doesNotMatch(proxySource, /const authPaths = \[[^\]]*"\/reset-password"/);
});

test("auth ui marks decorative shared icons as aria-hidden", async () => {
    const { authUiSource } = await readSources();

    assert.match(authUiSource, /<Icon aria-hidden="true" className="h-4 w-4" \/>/);
    assert.match(authUiSource, /<span aria-hidden="true" className="mr-3 inline-flex h-5 w-5 shrink-0 items-center justify-center text-\(--text-secondary\)">/);
});
