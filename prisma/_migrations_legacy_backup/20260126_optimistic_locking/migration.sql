-- ============================================
-- Optimistic Locking for Seats
-- Purpose: Add version column for optimistic locking in concurrent seat operations
-- ============================================

-- Add version column to Seat table for optimistic locking
ALTER TABLE "seats" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 0;

SELECT 'Optimistic locking migration completed successfully!' as status;
