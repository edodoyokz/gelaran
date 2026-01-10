"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        console.error("Global application error:", error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem",
                        background: "linear-gradient(135deg, #fef2f2 0%, #ffffff 50%, #fff7ed 100%)",
                        fontFamily: "system-ui, -apple-system, sans-serif",
                    }}
                >
                    <div
                        style={{
                            maxWidth: "28rem",
                            width: "100%",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                width: "5rem",
                                height: "5rem",
                                background: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 1.5rem",
                                boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.3)",
                            }}
                        >
                            <AlertOctagon
                                style={{
                                    width: "2.5rem",
                                    height: "2.5rem",
                                    color: "white",
                                }}
                            />
                        </div>

                        <h1
                            style={{
                                fontSize: "1.875rem",
                                fontWeight: "700",
                                color: "#111827",
                                marginBottom: "0.75rem",
                            }}
                        >
                            Critical Error
                        </h1>

                        <p
                            style={{
                                color: "#6b7280",
                                marginBottom: "2rem",
                                lineHeight: "1.6",
                            }}
                        >
                            A critical error occurred and the application could not recover. 
                            Please try refreshing the page or return to the homepage.
                        </p>

                        {error.digest && (
                            <div
                                style={{
                                    background: "#f9fafb",
                                    padding: "0.75rem 1rem",
                                    borderRadius: "0.5rem",
                                    marginBottom: "1.5rem",
                                    border: "1px solid #e5e7eb",
                                }}
                            >
                                <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                                    Error ID:{" "}
                                </span>
                                <code
                                    style={{
                                        fontSize: "0.875rem",
                                        fontFamily: "monospace",
                                        color: "#374151",
                                        background: "white",
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.25rem",
                                        border: "1px solid #e5e7eb",
                                    }}
                                >
                                    {error.digest}
                                </code>
                            </div>
                        )}

                        <div
                            style={{
                                display: "flex",
                                gap: "0.75rem",
                                flexDirection: "column",
                            }}
                        >
                            <button
                                type="button"
                                onClick={reset}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.5rem",
                                    padding: "0.875rem 1.5rem",
                                    background: "#4f46e5",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "0.75rem",
                                    fontWeight: "600",
                                    fontSize: "1rem",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = "#4338ca";
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.background = "#4338ca";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = "#4f46e5";
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.background = "#4f46e5";
                                }}
                            >
                                <RefreshCw style={{ width: "1.25rem", height: "1.25rem" }} />
                                Try Again
                            </button>

                            <a
                                href="/"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.5rem",
                                    padding: "0.875rem 1.5rem",
                                    background: "#f3f4f6",
                                    color: "#374151",
                                    border: "none",
                                    borderRadius: "0.75rem",
                                    fontWeight: "600",
                                    fontSize: "1rem",
                                    cursor: "pointer",
                                    textDecoration: "none",
                                    transition: "all 0.2s",
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = "#e5e7eb";
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.background = "#e5e7eb";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = "#f3f4f6";
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.background = "#f3f4f6";
                                }}
                            >
                                <Home style={{ width: "1.25rem", height: "1.25rem" }} />
                                Go to Homepage
                            </a>
                        </div>

                        <p
                            style={{
                                marginTop: "2rem",
                                paddingTop: "1.5rem",
                                borderTop: "1px solid #e5e7eb",
                                fontSize: "0.875rem",
                                color: "#9ca3af",
                            }}
                        >
                            If this problem persists, please{" "}
                            <a
                                href="/contact"
                                style={{
                                    color: "#4f46e5",
                                    textDecoration: "none",
                                    fontWeight: "500",
                                }}
                            >
                                contact support
                            </a>
                        </p>
                    </div>
                </div>
            </body>
        </html>
    );
}
