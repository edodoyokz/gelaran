"use client";

import React, { createContext, useContext, useState, useRef, ReactNode, useCallback } from 'react';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface ConfirmOptions {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
}

interface ConfirmContextType {
    confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<{ message: string; options: ConfirmOptions }>({ message: '', options: {} });
    
    const resolveRef = useRef<(value: boolean) => void>(() => {});

    const confirm = useCallback((message: string, options: ConfirmOptions = {}) => {
        setConfig({ message, options });
        setIsOpen(true);
        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve;
        });
    }, []);

    const handleConfirm = useCallback(() => {
        setIsOpen(false);
        resolveRef.current(true);
    }, []);

    const handleCancel = useCallback(() => {
        setIsOpen(false);
        resolveRef.current(false);
    }, []);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') {
                handleCancel();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
                        onClick={handleCancel}
                        aria-hidden="true"
                    />
                    
                    <div 
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative z-10 animate-in zoom-in-95 duration-200"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                        aria-describedby="modal-desc"
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`
                                    p-3 rounded-full shrink-0
                                    ${config.options.variant === 'danger' ? 'bg-red-50 text-red-600' : ''}
                                    ${config.options.variant === 'warning' ? 'bg-amber-50 text-amber-600' : ''}
                                    ${config.options.variant === 'success' ? 'bg-emerald-50 text-emerald-600' : ''}
                                    ${(!config.options.variant || config.options.variant === 'info') ? 'bg-blue-50 text-blue-600' : ''}
                                `}>
                                    {config.options.variant === 'danger' && <AlertTriangle className="w-6 h-6" />}
                                    {config.options.variant === 'warning' && <AlertTriangle className="w-6 h-6" />}
                                    {config.options.variant === 'success' && <CheckCircle className="w-6 h-6" />}
                                    {(!config.options.variant || config.options.variant === 'info') && <Info className="w-6 h-6" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900" id="modal-title">
                                        {config.options.title || "Konfirmasi"}
                                    </h3>
                                    <p className="mt-2 text-gray-600" id="modal-desc">
                                        {config.message}
                                    </p>
                                    {config.options.description && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            {config.options.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                {config.options.cancelText || "Batal"}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                autoFocus
                                className={`
                                    px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
                                    ${config.options.variant === 'danger' 
                                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-lg shadow-red-200' 
                                        : config.options.variant === 'warning'
                                        ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 shadow-lg shadow-amber-200'
                                        : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 shadow-lg shadow-indigo-200'}
                                `}
                            >
                                {config.options.confirmText || "Ya, Lanjutkan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error("useConfirm must be used within a ConfirmProvider");
    }
    return context;
}
