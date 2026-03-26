import { createClient } from "@/lib/supabase/client";

export type UploadResult = {
    url: string;
    path: string;
};

export type StorageBucketName = "avatars" | "events" | "organizers" | "tickets";

type BucketPolicy = {
    maxSizeBytes: number;
    allowedMimeTypes: readonly string[];
    isPublic: boolean;
};

const STORAGE_BUCKET_POLICIES: Record<StorageBucketName, BucketPolicy> = {
    avatars: {
        maxSizeBytes: 2 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
        isPublic: true,
    },
    events: {
        maxSizeBytes: 5 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        isPublic: true,
    },
    organizers: {
        maxSizeBytes: 5 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
        isPublic: true,
    },
    tickets: {
        maxSizeBytes: 1 * 1024 * 1024,
        allowedMimeTypes: ["image/png", "image/jpeg", "application/pdf"],
        isPublic: false,
    },
};

function formatAllowedTypes(types: readonly string[]) {
    return types.join(", ");
}

export function getStorageBucketPolicy(bucket: string) {
    const policy = STORAGE_BUCKET_POLICIES[bucket as StorageBucketName];
    return policy ?? null;
}

export function validateUploadFile(file: File, bucket: string) {
    const policy = getStorageBucketPolicy(bucket);

    if (!policy) {
        throw new Error(`Unsupported upload bucket: ${bucket}`);
    }

    if (!policy.allowedMimeTypes.includes(file.type)) {
        throw new Error(
            `Invalid file type for bucket ${bucket}. Allowed: ${formatAllowedTypes(policy.allowedMimeTypes)}`
        );
    }

    if (file.size > policy.maxSizeBytes) {
        throw new Error(`File size exceeds limit for bucket ${bucket}. Max: ${policy.maxSizeBytes} bytes`);
    }

    return policy;
}

export async function uploadImage(
    file: File,
    bucket: string,
    folder: string
): Promise<UploadResult> {
    const supabase = createClient();

    validateUploadFile(file, bucket);
    
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
        });
    
    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }
    
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
    
    return {
        url: publicUrl,
        path: fileName,
    };
}

export async function deleteImage(bucket: string, path: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase.storage.from(bucket).remove([path]);
    
    if (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }
}

export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
        .substring(0, 100);
}
