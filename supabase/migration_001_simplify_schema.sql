-- Migration 001: Simplify schema
-- - Replace old schedule columns with JSONB schedule
-- - Remove notification_sent columns
-- - Drop notification_log table and related enums
-- - Drop schedule_frequency enum
--
-- Run this in the Supabase SQL Editor on the live database.

-- ============================================
-- 1. Update students table
-- ============================================

-- Add new schedule JSONB column
ALTER TABLE students ADD COLUMN schedule JSONB NOT NULL DEFAULT '{}';

-- Drop old schedule columns
ALTER TABLE students DROP COLUMN IF EXISTS schedule_frequency;
ALTER TABLE students DROP COLUMN IF EXISTS schedule_days_of_week;
ALTER TABLE students DROP COLUMN IF EXISTS schedule_days_of_month;
ALTER TABLE students DROP COLUMN IF EXISTS schedule_time;

-- Make email optional (default empty string)
ALTER TABLE students ALTER COLUMN email SET DEFAULT '';

-- ============================================
-- 2. Remove notification_sent columns
-- ============================================

ALTER TABLE sessions DROP COLUMN IF EXISTS notification_sent;
ALTER TABLE holidays DROP COLUMN IF EXISTS notification_sent;
ALTER TABLE payments DROP COLUMN IF EXISTS notification_sent;

-- ============================================
-- 3. Drop notification_log table
-- ============================================

DROP TABLE IF EXISTS notification_log;

-- ============================================
-- 4. Drop unused enums
-- ============================================

DROP TYPE IF EXISTS schedule_frequency;
DROP TYPE IF EXISTS notification_type;
DROP TYPE IF EXISTS notification_status;

-- ============================================
-- 5. Drop unused indexes
-- ============================================

DROP INDEX IF EXISTS idx_notification_log_type;
DROP INDEX IF EXISTS idx_notification_log_sent_at;
