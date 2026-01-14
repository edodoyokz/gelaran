"use client";

import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { useTheme } from "@/lib/hooks/useTheme";

interface AdminLayoutWrapperProps {
    children: React.ReactNode;
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileMenuOpen]);

    return (
        <>
            <div className="hidden lg:block">
                <AdminSidebar
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
            </div>

            <div className="lg:hidden fixed top-4 left-4 z-50 flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 rounded-lg shadow-md transition-colors"
                    style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                    }}
                    aria-label="Open menu"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-2 rounded-lg shadow-md transition-colors"
                    style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                    }}
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>

            {isMobileMenuOpen && (
                <>
                    <button
                        type="button"
                        className="lg:hidden fixed inset-0 z-50 border-0 cursor-default"
                        style={{ background: 'var(--surface-overlay)' }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        onKeyDown={(e) => e.key === "Escape" && setIsMobileMenuOpen(false)}
                        aria-label="Close menu overlay"
                    />
                    <div 
                        className="lg:hidden fixed left-0 top-0 h-full z-50 animate-slide-in-left"
                        style={{ animationDuration: '200ms' }}
                    >
                        <AdminSidebar isCollapsed={false} />
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-lg"
                            style={{
                                background: 'var(--surface-hover)',
                                color: 'var(--text-primary)',
                            }}
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </>
            )}

            <main
                className={`transition-all duration-300 min-h-screen ${
                    isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
                }`}
            >
                {children}
            </main>
        </>
    );
}
