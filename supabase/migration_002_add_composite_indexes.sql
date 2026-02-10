-- Migration 002: Add composite indexes for query optimization
-- Run this in the Supabase SQL Editor

-- Composite index for session lookups by student + date (holiday cancellation, conflict checks)
CREATE INDEX IF NOT EXISTS idx_sessions_student_date ON sessions(student_id, date);

-- Composite index for session counts by student + status (payment due calculation)
CREATE INDEX IF NOT EXISTS idx_sessions_student_status ON sessions(student_id, status);

-- Composite index for payment lookups by student + status + paid_date (last paid date queries)
CREATE INDEX IF NOT EXISTS idx_payments_student_status_paid ON payments(student_id, status, paid_date);
