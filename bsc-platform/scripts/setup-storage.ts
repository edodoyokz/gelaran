import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
});

interface BucketConfig {
    name: string;
    public: boolean;
    fileSizeLimit?: number;
    allowedMimeTypes?: string[];
}

const BUCKETS: BucketConfig[] = [
    {
        name: "avatars",
        public: true,
        fileSizeLimit: 2 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    },
    {
        name: "events",
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    },
    {
        name: "organizers",
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    },
    {
        name: "tickets",
        public: false,
        fileSizeLimit: 1 * 1024 * 1024,
        allowedMimeTypes: ["image/png", "image/jpeg", "application/pdf"],
    },
];

async function createBucket(config: BucketConfig) {
    const { data: existingBucket } = await supabase.storage.getBucket(config.name);

    if (existingBucket) {
        console.log(`  ✓ Bucket "${config.name}" already exists`);
        const { error } = await supabase.storage.updateBucket(config.name, {
            public: config.public,
            fileSizeLimit: config.fileSizeLimit,
            allowedMimeTypes: config.allowedMimeTypes,
        });

        if (error) {
            console.error(`  ✗ Failed to update bucket "${config.name}":`, error.message);
            return false;
        }
        return true;
    }

    const { error } = await supabase.storage.createBucket(config.name, {
        public: config.public,
        fileSizeLimit: config.fileSizeLimit,
        allowedMimeTypes: config.allowedMimeTypes,
    });

    if (error) {
        console.error(`  ✗ Failed to create bucket "${config.name}":`, error.message);
        return false;
    }

    console.log(`  ✓ Bucket "${config.name}" created`);
    return true;
}

function printPolicyInstructions() {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                    MANUAL STEP REQUIRED                          ║
╠══════════════════════════════════════════════════════════════════╣
║  Storage policies must be configured via Supabase Dashboard.     ║
║                                                                  ║
║  Steps:                                                          ║
║  1. Go to: ${SUPABASE_URL.replace('.co', '.co/project/_/storage/policies')}
║  2. For each bucket, click "New Policy"                          ║
║  3. Configure as follows:                                        ║
╚══════════════════════════════════════════════════════════════════╝

AVATARS BUCKET:
┌─────────────────────────────────────────────────────────────────┐
│ Policy 1: "Allow public read"                                   │
│   - Allowed operation: SELECT                                   │
│   - Target roles: (leave empty for all)                         │
│   - Policy: true                                                │
├─────────────────────────────────────────────────────────────────┤
│ Policy 2: "Allow authenticated upload"                          │
│   - Allowed operation: INSERT                                   │
│   - Target roles: authenticated                                 │
│   - Policy: true                                                │
├─────────────────────────────────────────────────────────────────┤
│ Policy 3: "Allow authenticated update"                          │
│   - Allowed operation: UPDATE                                   │
│   - Target roles: authenticated                                 │
│   - Policy: true                                                │
├─────────────────────────────────────────────────────────────────┤
│ Policy 4: "Allow authenticated delete"                          │
│   - Allowed operation: DELETE                                   │
│   - Target roles: authenticated                                 │
│   - Policy: true                                                │
└─────────────────────────────────────────────────────────────────┘

EVENTS BUCKET:
┌─────────────────────────────────────────────────────────────────┐
│ Same as AVATARS bucket (public read, authenticated write)       │
└─────────────────────────────────────────────────────────────────┘

ORGANIZERS BUCKET:
┌─────────────────────────────────────────────────────────────────┐
│ Same as AVATARS bucket (public read, authenticated write)       │
└─────────────────────────────────────────────────────────────────┘

TICKETS BUCKET (Private):
┌─────────────────────────────────────────────────────────────────┐
│ Policy 1: "Allow authenticated read"                            │
│   - Allowed operation: SELECT                                   │
│   - Target roles: authenticated                                 │
│   - Policy: true                                                │
├─────────────────────────────────────────────────────────────────┤
│ Policy 2: "Allow authenticated upload"                          │
│   - Allowed operation: INSERT                                   │
│   - Target roles: authenticated                                 │
│   - Policy: true                                                │
└─────────────────────────────────────────────────────────────────┘
`);
}

async function main() {
    console.log("Setting up Supabase Storage buckets...\n");

    let allSuccess = true;

    for (const bucket of BUCKETS) {
        const success = await createBucket(bucket);
        if (!success) allSuccess = false;
    }

    console.log("");

    if (allSuccess) {
        console.log("✓ All buckets created/updated successfully!\n");
        printPolicyInstructions();
    } else {
        console.log("✗ Some buckets failed. Check errors above.");
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("Setup failed:", error);
    process.exit(1);
});
