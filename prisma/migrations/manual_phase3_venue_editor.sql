-- =========================================
-- Phase 3: Enhanced Venue Editor Migration
-- Run this in Supabase SQL Editor
-- =========================================

-- 1. Create SectionType enum
DO $$ BEGIN
    CREATE TYPE "SectionType" AS ENUM ('SEATED', 'STANDING', 'MIXED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add new columns to venue_sections table
ALTER TABLE venue_sections 
ADD COLUMN IF NOT EXISTS section_type "SectionType" DEFAULT 'SEATED',
ADD COLUMN IF NOT EXISTS position_x DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS position_y DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS width DOUBLE PRECISION DEFAULT 100,
ADD COLUMN IF NOT EXISTS height DOUBLE PRECISION DEFAULT 100,
ADD COLUMN IF NOT EXISTS rotation DOUBLE PRECISION DEFAULT 0;

-- 3. Create venue_layouts table
CREATE TABLE IF NOT EXISTS venue_layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
    image_url TEXT,
    image_width INTEGER,
    image_height INTEGER,
    scale DOUBLE PRECISION DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_venue_layouts_event_id ON venue_layouts(event_id);

-- Done!
SELECT 'Migration completed successfully!' as status;
