-- GaanaVykhari Admin - Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE session_status AS ENUM ('scheduled', 'attended', 'canceled', 'missed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'upi', 'razorpay');

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  fee_per_classes INTEGER NOT NULL DEFAULT 4,
  fee_amount INTEGER NOT NULL DEFAULT 0,
  schedule JSONB NOT NULL DEFAULT '{}',
  induction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_class_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status session_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  canceled_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT holidays_date_range CHECK (from_date <= to_date)
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  due_date DATE NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method payment_method,
  paid_date TIMESTAMPTZ,
  razorpay_link_id TEXT,
  razorpay_link_url TEXT,
  razorpay_payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_sessions_student_id ON sessions(student_id);
CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_student_date ON sessions(student_id, date);
CREATE INDEX idx_sessions_student_status ON sessions(student_id, status);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_student_status_paid ON payments(student_id, status, paid_date);
CREATE INDEX idx_holidays_dates ON holidays(from_date, to_date);
CREATE INDEX idx_students_is_active ON students(is_active);

-- ============================================
-- TRIGGERS: auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER holidays_updated_at
  BEFORE UPDATE ON holidays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RPC: cancel sessions for holiday range
-- ============================================

CREATE OR REPLACE FUNCTION cancel_sessions_for_holiday(
  p_from_date DATE,
  p_to_date DATE
)
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  UPDATE sessions
  SET status = 'canceled',
      canceled_reason = 'Holiday',
      updated_at = NOW()
  WHERE date >= p_from_date
    AND date <= p_to_date
    AND status = 'scheduled';

  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (single-teacher app)
CREATE POLICY "Authenticated users full access" ON students
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access" ON sessions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access" ON holidays
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access" ON payments
  FOR ALL USING (auth.role() = 'authenticated');

-- Allow service role full access (for API routes using admin client)
CREATE POLICY "Service role full access" ON students
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON sessions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON holidays
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON payments
  FOR ALL USING (auth.role() = 'service_role');
