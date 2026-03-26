"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Upload, Trash2, Loader2 } from "lucide-react";

interface ImageTracerProps {
    eventId: string;
    currentImage?: string | null;
    onImageUpload: (imageUrl: string, width: number, height: number) => void;
    onImageRemove: () => void;
}

export function ImageTracer({
    eventId,
    currentImage,
    onImageUpload,
    onImageRemove,
}: ImageTracerProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
    const [opacity, setOpacity] = useState(0.3);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Pilih file gambar (PNG, JPG, SVG)");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("Ukuran file maksimal 5MB");
            return;
        }

        setIsUploading(true);

        try {
            // Create preview
            const localUrl = URL.createObjectURL(file);
            setPreviewUrl(localUrl);

            // Get image dimensions
            const img = new Image();
            img.onload = async () => {
                const width = img.naturalWidth;
                const height = img.naturalHeight;

                // Upload to server
                const formData = new FormData();
                formData.append("file", file);
                formData.append("eventId", eventId);
                formData.append("type", "venue-layout");

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    onImageUpload(data.url, width, height);
                    setPreviewUrl(data.url);
                } else {
                    throw new Error("Upload failed");
                }
            };
            img.src = localUrl;
        } catch (error) {
            console.error("Upload error:", error);
            alert("Gagal upload gambar. Coba lagi.");
            setPreviewUrl(currentImage || null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        if (confirm("Hapus gambar denah?")) {
            setPreviewUrl(null);
            onImageRemove();
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Upload size={18} className="text-indigo-600" />
                Gambar Denah (Opsional)
            </h4>

            <p className="text-sm text-gray-500 mb-4">
                Upload gambar denah venue untuk membantu penempatan section.
                Gambar akan ditampilkan sebagai background.
            </p>

            {previewUrl ? (
                <div className="space-y-4">
                    {/* Preview */}
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                        <img
                            src={previewUrl}
                            alt="Venue Layout"
                            className="w-full h-40 object-contain bg-gray-100"
                            style={{ opacity }}
                        />
                    </div>

                    {/* Opacity Control */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Opacity:</span>
                        <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={opacity}
                            onChange={(e) => setOpacity(parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm text-gray-600 w-12">
                            {Math.round(opacity * 100)}%
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                            Ganti Gambar
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors flex flex-col items-center gap-2 text-gray-500 disabled:opacity-50"
                >
                    {isUploading ? (
                        <>
                            <Loader2 size={24} className="animate-spin text-indigo-600" />
                            <span className="text-sm">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Upload size={24} />
                            <span className="text-sm font-medium">Klik untuk upload gambar</span>
                            <span className="text-xs text-gray-400">PNG, JPG, SVG (max 5MB)</span>
                        </>
                    )}
                </button>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
}

export default ImageTracer;
