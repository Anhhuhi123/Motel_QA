-- Create Activities table for Audit Logging
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment', 'maintenance', 'tenant', 'alert', 'system')),
  amount BIGINT, -- Optional, for payments (in VND)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for chronological fetching
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can perform all actions on activities" ON activities FOR ALL USING (auth.role() = 'authenticated');
