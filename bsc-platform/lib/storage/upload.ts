import { createClient } from "@/lib/supabase/client";

export type UploadResult = {
    url: string;
    path: string;
};

export async function uploadImage(
    file: File,
    bucket: string,
    folder: string
): Promise<UploadResult> {
    const supabase = createClient();
    
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
