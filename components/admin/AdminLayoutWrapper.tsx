"use client";

import { useEffect, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { useTheme } from "@/lib/hooks/useTheme";
import { useAdminProfile } from "./AdminProfileProvider";
import { cn } from "@/lib/utils";

interface AdminLayoutWrapperProps {
    children: React.ReactNode;
}

function getInitials(name: string) {
    return name.slice(0, 2).toUpperCase();
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const profile = useAdminProfile();

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
        document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileMenuOpen]);

    return (
        <div className="bg-surface-container-lowest text-on-surface min-h-screen flex font-body antialiased">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block relative z-40">
                <AdminSidebar
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
                />
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen ? (
                <>
                    <button
                        type="button"
                        className="fixed inset-0 z-55 border-0 bg-black/40 backdrop-blur-[2px] lg:hidden w-full cursor-default"
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Close admin navigation"
                    />
                    <div className="fixed inset-y-0 left-0 z-60 w-[min(88vw,16rem)] lg:hidden">
                        <AdminSidebar isCollapsed={false} />
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute -right-12 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg"
                            aria-label="Close menu"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </>
            ) : null}

            {/* Main Content Area */}
            <main
                className={cn(
                    "flex-1 flex flex-col min-h-screen transition-all duration-300 w-full",
                    isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
                )}
            >
                {/* TopNavBar */}
                <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-teal-500/10 dark:border-teal-400/10 shadow-sm dark:shadow-none flex items-center justify-between px-4 sm:px-6 py-3 w-full">
                    <div className="flex items-center gap-4 lg:gap-8">
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 text-teal-900 dark:text-teal-100 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/50"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="hidden lg:flex p-2 text-teal-900 dark:text-teal-100 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/50 transition-colors"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <h2 className="hidden sm:block font-headline text-2xl font-black text-teal-900 dark:text-teal-50">Gelaran</h2>
                        <div className="relative w-48 sm:w-96 hidden md:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-container/20 placeholder:text-slate-400 outline-none" placeholder="Search analytics, events, or users..." type="text"/>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button onClick={toggleTheme} className="p-2 text-teal-900 dark:text-teal-100 hover:bg-teal-50 dark:hover:bg-teal-900/50 rounded-full transition-colors relative active:scale-95 duration-150">
                            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                        <button className="hidden sm:block p-2 text-teal-900 dark:text-teal-100 hover:bg-teal-50 dark:hover:bg-teal-900/50 rounded-full transition-colors relative active:scale-95 duration-150">
                            <span className="material-symbols-outlined shrink-0" style={{ fontVariationSettings: "'FILL' 0" }}>notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
                        </button>
                        <button className="hidden sm:block p-2 text-teal-900 dark:text-teal-100 hover:bg-teal-50 dark:hover:bg-teal-900/50 rounded-full transition-colors active:scale-95 duration-150">
                            <span className="material-symbols-outlined shrink-0" style={{ fontVariationSettings: "'FILL' 0" }}>settings</span>
                        </button>
                        <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                        <div className="flex items-center gap-3 sm:pl-2">
                            <div className="hidden md:block text-right">
                                <p className="text-xs font-bold text-on-surface truncate max-w-[120px]">{profile?.name || "Admin User"}</p>
                                <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter truncate max-w-[120px]">{profile?.role?.replace("_", " ") || "Admin"}</p>
                            </div>
                            {profile?.avatarUrl ? (
                                <img alt="Profile" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-primary-container/10 object-cover" src={profile.avatarUrl} />
                            ) : (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-primary-container/10 bg-primary-container flex items-center justify-center text-white text-xs font-bold">
                                    {getInitials(profile?.name || "Admin")}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Canvas Content */}
                <div className="p-4 sm:p-8 max-w-[1600px] w-full mx-auto space-y-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
