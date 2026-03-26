"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import {
    Camera,
    CameraOff,
    Volume2,
    VolumeX,
    CheckCircle,
    XCircle,
    AlertCircle,
    SwitchCamera,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { getGateResultDisplay, type GateDisplayResultCode } from "@/lib/gate/result-display";

interface CheckInResult {
    result: GateDisplayResultCode;
    message?: string;
    ticket?: {
        ticketType: string;
        attendeeName: string;
        bookingCode: string;
        eventTitle: string;
        checkedInAt: string;
    };
    checkedInAt?: string;
}

interface ScanHistoryItem {
    id: string;
    code: string;
    result: CheckInResult["result"];
    attendeeName?: string;
    ticketType?: string;
    timestamp: Date;
}

interface QRScannerProps {
    onCheckIn: (code: string) => Promise<CheckInResult>;
    onScanComplete?: (result: CheckInResult) => void;
}

export default function QRScanner({ onCheckIn, onScanComplete }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
    const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
    const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const lastScannedCode = useRef<string>("");
    const cooldownRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);

    const playSound = useCallback((type: "success" | "error") => {
        if (!soundEnabled) return;
        
        try {
            const ctx = initAudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            if (type === "success") {
                oscillator.frequency.setValueAtTime(880, ctx.currentTime);
                oscillator.frequency.setValueAtTime(1108, ctx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.3);
            } else {
                oscillator.frequency.setValueAtTime(330, ctx.currentTime);
                oscillator.frequency.setValueAtTime(220, ctx.currentTime + 0.15);
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.4);
            }
        } catch {}
    }, [soundEnabled, initAudioContext]);

    const getCameras = useCallback(async () => {
        try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
                setCameras(devices);
                setHasPermission(true);
                return devices;
            }
            return [];
        } catch {
            setHasPermission(false);
            return [];
        }
    }, []);

    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                const state = scannerRef.current.getState();
                if (state === Html5QrcodeScannerState.SCANNING) {
                    await scannerRef.current.stop();
                }
            } catch {}
        }
        setIsScanning(false);
    }, []);

    const handleScan = useCallback(async (decodedText: string) => {
        if (decodedText === lastScannedCode.current) return;
        if (isProcessing) return;
        
        lastScannedCode.current = decodedText;
        setIsProcessing(true);
        setLastResult(null);
        
        try {
            const result = await onCheckIn(decodedText);
            setLastResult(result);
            
            if (result.result === "SUCCESS") {
                playSound("success");
            } else {
                playSound("error");
            }
            
            const historyItem: ScanHistoryItem = {
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                code: decodedText,
                result: result.result,
                attendeeName: result.ticket?.attendeeName,
                ticketType: result.ticket?.ticketType,
                timestamp: new Date(),
            };
            setScanHistory((prev) => [historyItem, ...prev.slice(0, 9)]);
            
            onScanComplete?.(result);
            
            cooldownRef.current = setTimeout(() => {
                lastScannedCode.current = "";
            }, 2000);
            
        } catch {
            setLastResult({ result: "INVALID", message: "Gagal membaca hasil scan." });
            playSound("error");
        } finally {
            setIsProcessing(false);
        }
    }, [isProcessing, onCheckIn, onScanComplete, playSound]);

    const startScanner = useCallback(async () => {
        setError(null);
        setIsInitializing(true);
        
        try {
            let availableCameras = cameras;
            if (cameras.length === 0) {
                availableCameras = await getCameras();
            }
            
            if (availableCameras.length === 0) {
                setError("Tidak ada kamera yang ditemukan");
                setIsInitializing(false);
                return;
            }
            
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode("qr-reader");
            }
            
            const cameraId = availableCameras[currentCameraIndex]?.id;
            
            await scannerRef.current.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1,
                },
                handleScan,
                () => {}
            );
            
            setIsScanning(true);
            setHasPermission(true);
        } catch (err) {
            console.error("Scanner error:", err);
            if (String(err).includes("Permission")) {
                setError("Izin kamera ditolak. Silakan aktifkan izin kamera.");
                setHasPermission(false);
            } else {
                setError("Gagal mengaktifkan kamera. Coba refresh halaman.");
            }
        } finally {
            setIsInitializing(false);
        }
    }, [cameras, currentCameraIndex, getCameras, handleScan]);

    const switchCamera = useCallback(async () => {
        if (cameras.length < 2) return;
        
        await stopScanner();
        const nextIndex = (currentCameraIndex + 1) % cameras.length;
        setCurrentCameraIndex(nextIndex);
        
        setTimeout(() => {
            startScanner();
        }, 100);
    }, [cameras.length, currentCameraIndex, stopScanner, startScanner]);

    useEffect(() => {
        return () => {
            if (cooldownRef.current) {
                clearTimeout(cooldownRef.current);
            }
            stopScanner();
        };
    }, [stopScanner]);

    useEffect(() => {
        if (lastResult) {
            const timeout = setTimeout(() => {
                setLastResult(null);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [lastResult]);

    const getResultColor = (result: CheckInResult["result"]) => {
        const display = getGateResultDisplay(result);
        switch (display.tone) {
            case "success":
                return "text-green-400";
            case "warning":
                return "text-yellow-400";
            default:
                return "text-red-400";
        }
    };

    const getResultBgColor = (result: CheckInResult["result"]) => {
        const display = getGateResultDisplay(result);
        switch (display.tone) {
            case "success":
                return "bg-green-900/50 border-green-700";
            case "warning":
                return "bg-yellow-900/50 border-yellow-700";
            default:
                return "bg-red-900/50 border-red-700";
        }
    };

    const getResultIcon = (result: CheckInResult["result"]) => {
        switch (result) {
            case "SUCCESS":
                return <CheckCircle className="h-12 w-12 text-green-500" />;
            case "ALREADY_CHECKED_IN":
                return <AlertCircle className="h-12 w-12 text-yellow-500" />;
            case "ACCESS_DENIED":
            case "SESSION_INACTIVE":
                return <AlertCircle className="h-12 w-12 text-red-500" />;
            default:
                return <XCircle className="h-12 w-12 text-red-500" />;
        }
    };

    const getResultText = (result: CheckInResult["result"]) => {
        return getGateResultDisplay(result).title;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`p-2 rounded-lg transition-colors ${
                            soundEnabled
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-700 text-gray-400"
                        }`}
                        title={soundEnabled ? "Suara aktif" : "Suara mati"}
                    >
                        {soundEnabled ? (
                            <Volume2 className="h-5 w-5" />
                        ) : (
                            <VolumeX className="h-5 w-5" />
                        )}
                    </button>
                    
                    {cameras.length > 1 && isScanning && (
                        <button
                            type="button"
                            onClick={switchCamera}
                            className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                            title="Ganti kamera"
                        >
                            <SwitchCamera className="h-5 w-5" />
                        </button>
                    )}
                </div>
                
                <button
                    type="button"
                    onClick={isScanning ? stopScanner : startScanner}
                    disabled={isInitializing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        isScanning
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"
                    } disabled:opacity-50`}
                >
                    {isInitializing ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Memuat...
                        </>
                    ) : isScanning ? (
                        <>
                            <CameraOff className="h-5 w-5" />
                            Stop Scanner
                        </>
                    ) : (
                        <>
                            <Camera className="h-5 w-5" />
                            Mulai Scan
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span className="text-sm">{error}</span>
                    <button
                        type="button"
                        onClick={startScanner}
                        className="ml-auto p-1 hover:bg-red-500/20 rounded"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            )}

            {hasPermission === false && !error && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
                    <CameraOff className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400 mb-2">Izin kamera diperlukan</p>
                    <p className="text-gray-500 text-sm mb-4">
                        Aktifkan izin kamera di pengaturan browser untuk menggunakan scanner
                    </p>
                    <button
                        type="button"
                        onClick={startScanner}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Coba Lagi
                    </button>
                </div>
            )}

            <div className="relative">
                <div
                    id="qr-reader"
                    className={`rounded-xl overflow-hidden bg-gray-800 ${
                        isScanning ? "aspect-square" : "hidden"
                    }`}
                />
                
                {isScanning && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg" />
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg" />
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg" />
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-lg" />
                        
                        <div className="absolute inset-x-8 top-1/4 h-0.5 bg-linear-to-r from-transparent via-indigo-500 to-transparent animate-pulse" />
                        
                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="h-12 w-12 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                )}

                {!isScanning && hasPermission !== false && !error && (
                    <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-xl bg-gray-700 flex items-center justify-center">
                            <Camera className="h-12 w-12 text-gray-500" />
                        </div>
                        <p className="text-gray-400 mb-2">Kamera tidak aktif</p>
                        <p className="text-gray-500 text-sm">
                            Klik &quot;Mulai Scan&quot; untuk mengaktifkan kamera
                        </p>
                    </div>
                )}
            </div>

            {lastResult && (
                <div
                    className={`rounded-xl p-4 border transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 ${getResultBgColor(
                        lastResult.result
                    )}`}
                >
                    <div className="flex items-center gap-3">
                        {getResultIcon(lastResult.result)}
                        <div className="min-w-0 flex-1">
                            <h3 className={`text-lg font-bold ${getResultColor(lastResult.result)}`}>
                                {getResultText(lastResult.result)}
                            </h3>
                            {lastResult.ticket && (
                                <div className="text-sm text-gray-300 space-y-0.5">
                                    <p className="truncate">
                                        <span className="text-gray-500">Nama:</span>{" "}
                                        {lastResult.ticket.attendeeName}
                                    </p>
                                    <p>
                                        <span className="text-gray-500">Tiket:</span>{" "}
                                        {lastResult.ticket.ticketType}
                                    </p>
                                </div>
                            )}
                            {(lastResult.message || getGateResultDisplay(lastResult.result).description) && (
                                <p className="text-sm text-gray-400 mt-1">
                                    {lastResult.message || getGateResultDisplay(lastResult.result).description}
                                </p>
                            )}
                            {lastResult.checkedInAt && (
                                <p className="text-sm text-gray-400 mt-1">
                                    Checked in: {new Date(lastResult.checkedInAt).toLocaleString("id-ID")}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {scanHistory.length > 0 && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-300">
                            Riwayat Scan Terakhir
                        </h4>
                        <button
                            type="button"
                            onClick={() => setScanHistory([])}
                            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            Hapus
                        </button>
                    </div>
                    <div className="divide-y divide-gray-700 max-h-48 overflow-y-auto">
                        {scanHistory.map((item) => (
                            <div
                                key={item.id}
                                className="px-4 py-2 flex items-center gap-3"
                            >
                                <div
                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                        item.result === "SUCCESS"
                                            ? "bg-green-500"
                                            : item.result === "ALREADY_CHECKED_IN"
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                    }`}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-white truncate">
                                        {item.attendeeName || item.code}
                                    </p>
                                    {item.ticketType && (
                                        <p className="text-xs text-gray-500 truncate">
                                            {item.ticketType}
                                        </p>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500 shrink-0">
                                    {item.timestamp.toLocaleTimeString("id-ID", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
