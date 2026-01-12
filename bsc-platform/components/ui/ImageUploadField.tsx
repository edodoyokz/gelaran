"use client";

import { useCallback, useState, useRef } from "react";
import { uploadImage } from "@/lib/storage/upload";
import { X, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
    label: string;
    value?: string;
    onChange: (url: string) => void;
    bucket: string;
    folder: string;
    aspectRatio?: string;
    maxSizeMB?: number;
    disabled?: boolean;
    className?: string;
}

export function ImageUploadField({
    label,
    value,
    onChange,
    bucket,
    folder,
    aspectRatio = "16/9",
    maxSizeMB = 5,
    disabled = false,
    className,
}: ImageUploadFieldProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (disabled || isUploading) return;

        setError(null);

        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!validTypes.includes(file.type)) {
            setError("Please upload a valid image (JPG, PNG, WebP, GIF)");
            return;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`Image size must be less than ${maxSizeMB}MB`);
            return;
        }

        try {
            setIsUploading(true);
            const { url } = await uploadImage(file, bucket, folder);
            onChange(url);
        } catch (err) {
            console.error("Upload error:", err);
            setError("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    }, [disabled]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!disabled) {
            onChange("");
        }
    };

    return (
        <div className={cn("w-full", className)}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            
            <div
                onClick={() => !disabled && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{ aspectRatio }}
                className={cn(
                    "relative w-full rounded-lg border-2 border-dashed transition-all duration-200 overflow-hidden flex flex-col items-center justify-center cursor-pointer group",
                    isDragging 
                        ? "border-indigo-500 bg-indigo-50" 
                        : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50",
                    value ? "border-solid border-gray-200" : "",
                    disabled ? "opacity-60 cursor-not-allowed hover:border-gray-300 hover:bg-transparent" : "",
                    error ? "border-red-300 bg-red-50" : ""
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFileInput}
                    disabled={disabled}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center justify-center text-indigo-600">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <span className="text-sm font-medium">Uploading...</span>
                    </div>
                ) : value ? (
                    <div className="relative w-full h-full group/image">
                        <img 
                            src={value} 
                            alt={label} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <span className="text-white text-sm font-medium px-3 py-1.5 rounded-full border border-white/50 backdrop-blur-sm">
                                Change Image
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-1.5 bg-white text-gray-700 rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors z-10"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                        {error ? (
                            <>
                                <div className="p-2 bg-red-100 rounded-full mb-3 text-red-600">
                                    <X className="h-6 w-6" />
                                </div>
                                <p className="text-sm font-medium text-red-600 mb-1">Upload Failed</p>
                                <p className="text-xs text-red-500 px-4">{error}</p>
                                <p className="text-xs text-gray-400 mt-2">Click to try again</p>
                            </>
                        ) : (
                            <>
                                <div className={cn(
                                    "p-3 rounded-full mb-3 transition-colors",
                                    isDragging ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                                )}>
                                    <Upload className="h-6 w-6" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                    <span className="text-indigo-600">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    JPG, PNG, WebP or GIF (max {maxSizeMB}MB)
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
