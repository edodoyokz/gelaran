"use client";

import { createContext, useCallback, useEffect, useLayoutEffect, useState, type ReactNode } from "react";

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

function isTheme(value: string | null): value is Theme {
    return value === "light" || value === "dark" || value === "system";
}

function getSystemTheme(): ResolvedTheme {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialTheme(defaultTheme: Theme): Theme {
    if (typeof window === "undefined") return defaultTheme;

    const storedTheme = localStorage.getItem(STORAGE_KEY);
    return isTheme(storedTheme) ? storedTheme : defaultTheme;
}

function resolveTheme(theme: Theme, systemTheme: ResolvedTheme): ResolvedTheme {
    return theme === "system" ? systemTheme : theme;
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
    const [theme, setThemeState] = useState<Theme>(() => getInitialTheme(defaultTheme));
    const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());

    const resolvedTheme = resolveTheme(theme, systemTheme);

    useLayoutEffect(() => {
        const root = document.documentElement;

        if (enableTransition) {
            root.classList.add("transitioning");
        }

        root.classList.toggle("dark", resolvedTheme === "dark");

        if (!enableTransition) {
            return;
        }

        const timeout = window.setTimeout(() => {
            root.classList.remove("transitioning");
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [enableTransition, resolvedTheme]);

    useEffect(() => {
        if (theme !== "system") {
            return;
        }

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            setSystemTheme(mediaQuery.matches ? "dark" : "light");
        };

        handleChange();
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    }, [resolvedTheme, setTheme]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                resolvedTheme,
                setTheme,
                toggleTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}
