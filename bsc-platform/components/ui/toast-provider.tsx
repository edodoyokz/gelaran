"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertTriangle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div 
                        key={toast.id}
                        className={`
                            pointer-events-auto
                            flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
                            transform transition-all duration-300 ease-in-out
                            animate-in slide-in-from-bottom-5 fade-in
                            ${toast.type === 'success' ? 'bg-white border-emerald-100 text-emerald-800 shadow-emerald-50' : ''}
                            ${toast.type === 'error' ? 'bg-white border-red-100 text-red-800 shadow-red-50' : ''}
                            ${toast.type === 'info' ? 'bg-white border-blue-100 text-blue-800 shadow-blue-50' : ''}
                        `}
                        role="alert"
                    >
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                        {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                        
                        <p>{toast.message}</p>
                        
                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="ml-2 p-1 hover:bg-black/5 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 opacity-50" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
