"use client";

import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { OrganizerSidebar } from "./OrganizerSidebar";
import { MaterialSymbol } from "@/components/ui/material-symbol";
import { useTheme } from "@/lib/hooks/useTheme";
import { cn } from "@/lib/utils";

interface OrganizerLayoutWrapperProps {
    children: React.ReactNode;
    organizationName: string;
    organizationLogo?: string | null;
    isVerified?: boolean;
}

export function OrganizerLayoutWrapper({
    children,
    organizationName,
    organizationLogo,
    isVerified,
}: OrganizerLayoutWrapperProps) {
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
        <div className="bg-white dark:bg-slate-950 text-on-surface min-h-screen flex font-body antialiased">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block relative z-40">
                <OrganizerSidebar
                    organizationName={organizationName}
                    organizationLogo={organizationLogo}
                    isVerified={isVerified}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
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
                    <div className="fixed inset-y-0 left-0 z-60 w-[min(88vw,16rem)] lg:hidden animate-slide-in-left">
                        <OrganizerSidebar 
                            organizationName={organizationName}
                            organizationLogo={organizationLogo}
                            isVerified={isVerified}
                            isCollapsed={false}
                        />
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
                {/* TopAppBar */}
                <header className="fixed top-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm px-4 sm:px-8 py-4 flex justify-between items-center transition-all duration-300" style={{ left: isSidebarCollapsed ? '5rem' : '16rem' }}>
                    
                    <div className="flex items-center gap-2 lg:hidden">
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-teal-900 dark:text-teal-100 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/50"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="hidden md:flex items-center gap-4 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 w-96 border border-slate-200/50 dark:border-slate-700/50 focus-within:ring-2 ring-brand-light-teal transition-all">
                        <MaterialSymbol name="search" className="text-slate-400" />
                        <input className="bg-transparent border-none outline-none focus:ring-0 text-sm w-full placeholder:text-slate-400 text-slate-900 dark:text-slate-100" placeholder="Search events, orders, or curators..." type="text"/>
                    </div>
                    
                    <div className="flex items-center gap-4 sm:gap-6">
                        <button type="button" onClick={toggleTheme} className="text-slate-600 dark:text-slate-300 hover:text-brand-teal transition-colors active:scale-95">
                            {theme === 'dark' ? <Sun className="h-[22px] w-[22px]" /> : <Moon className="h-[22px] w-[22px]" />}
                        </button>
                        <div className="relative">
                            <button type="button" className="text-slate-600 dark:text-slate-300 hover:text-brand-teal transition-colors">
                                <MaterialSymbol name="notifications" className="shrink-0" />
                            </button>
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-orange rounded-full"></span>
                        </div>
                        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-700 pl-4 sm:pl-6">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-bold text-brand-teal leading-tight max-w-[150px] truncate">{organizationName}</p>
                                <p className="text-xs text-slate-500">{isVerified ? "Verified Organizer" : "Organizer"}</p>
                            </div>
                            {organizationLogo ? (
                                <img alt="Organizer Profile" className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-light-teal/20" src={organizationLogo}/>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 text-brand-teal dark:text-teal-100 flex items-center justify-center font-bold text-sm ring-2 ring-brand-light-teal/20">
                                    {organizationName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="mt-20 p-4 sm:p-8 max-w-[1600px] w-full mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
