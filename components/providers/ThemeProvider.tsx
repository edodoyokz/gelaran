"use client";

import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "bsc-theme";

function getSystemTheme(): ResolvedTheme {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: Theme): ResolvedTheme {
    if (theme === "system") {
        return getSystemTheme();
    }
    return theme;
}

interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: Theme;
    enableTransition?: boolean;
}

export function ThemeProvider({
    children,
    defaultTheme = "system",
    enableTransition = true,
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(defaultTheme);
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        const initialTheme = stored || defaultTheme;
        setThemeState(initialTheme);
        setResolvedTheme(resolveTheme(initialTheme));
        setMounted(true);
    }, [defaultTheme]);

    useEffect(() => {
        if (!mounted) return;

        const resolved = resolveTheme(theme);
        setResolvedTheme(resolved);

        const root = document.documentElement;

        if (enableTransition) {
            root.classList.add("transitioning");
        }

        if (resolved === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        if (enableTransition) {
            const timeout = setTimeout(() => {
                root.classList.remove("transitioning");
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [theme, mounted, enableTransition]);

    useEffect(() => {
        if (!mounted || theme !== "system") return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        
        const handleChange = () => {
            setResolvedTheme(getSystemTheme());
            const root = document.documentElement;
            if (getSystemTheme() === "dark") {
                root.classList.add("dark");
            } else {
                root.classList.remove("dark");
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme, mounted]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        const newTheme = resolvedTheme === "dark" ? "light" : "dark";
        setTheme(newTheme);
    }, [resolvedTheme, setTheme]);

    const value: ThemeContextType = {
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
    };

    if (!mounted) {
        return (
            <ThemeContext.Provider value={{ ...value, resolvedTheme: "light" }}>
                {children}
            </ThemeContext.Provider>
        );
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
