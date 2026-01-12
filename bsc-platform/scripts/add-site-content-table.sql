-- Add SiteContent table for landing page management
-- Run this in Supabase SQL Editor

-- Create enum for content type
DO $$ BEGIN
    CREATE TYPE "SiteContentType" AS ENUM ('TEXT', 'IMAGE', 'JSON', 'HTML');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create site_contents table
CREATE TABLE IF NOT EXISTS "site_contents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "type" "SiteContentType" NOT NULL DEFAULT 'JSON',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_contents_pkey" PRIMARY KEY ("id")
);

-- Create unique index on key
CREATE UNIQUE INDEX IF NOT EXISTS "site_contents_key_key" ON "site_contents"("key");

-- Insert default content for landing page
INSERT INTO "site_contents" ("key", "value", "type") VALUES
(
    'hero',
    '{
        "title": "Temukan Pengalaman Tak Terlupakan.",
        "subtitle": "Jelajahi konser, workshop, dan festival terbaik di sekitarmu.",
        "backgroundImage": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
        "searchPlaceholder": "Konser, Festival...",
        "locationPlaceholder": "Jakarta, Indonesia",
        "ctaText": "Cari"
    }',
    'JSON'
),
(
    'footer',
    '{
        "brandName": "BSC Tickets",
        "tagline": "Platform manajemen event dan penjualan tiket terpercaya.",
        "copyright": "© 2026 BSC Event Platform. All rights reserved.",
        "links": [
            {"label": "Tentang Kami", "href": "/about"},
            {"label": "Hubungi", "href": "/contact"},
            {"label": "Syarat & Ketentuan", "href": "/terms"},
            {"label": "Kebijakan Privasi", "href": "/privacy"}
        ],
        "socialLinks": []
    }',
    'JSON'
),
(
    'seo',
    '{
        "siteTitle": "BSC Tickets - Platform Event & Ticketing",
        "siteDescription": "Platform manajemen event dan penjualan tiket terpercaya di Indonesia. Temukan konser, workshop, festival, dan event menarik lainnya.",
        "siteKeywords": "event, tiket, konser, workshop, festival, indonesia",
        "ogImage": ""
    }',
    'JSON'
)
ON CONFLICT ("key") DO NOTHING;
