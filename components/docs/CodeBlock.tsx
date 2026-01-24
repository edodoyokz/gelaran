"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
    code: string;
    language?: string;
}

export function CodeBlock({ code, language = "bash" }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-6 rounded-lg overflow-hidden bg-slate-900 text-slate-50 text-sm font-mono shadow-md">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
                <span className="text-xs text-slate-400 uppercase">{language}</span>
                <button
                    onClick={handleCopy}
                    className="text-slate-400 hover:text-white transition-colors p-1"
                    aria-label="Copy code"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
            </div>
            <div className="p-4 overflow-x-auto">
                <pre className="whitespace-pre-wrap">{code}</pre>
            </div>
        </div>
    );
}
