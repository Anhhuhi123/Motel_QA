-- Create Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  floor INTEGER NOT NULL,
  wing TEXT,
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Occupied', 'Available', 'Maintenance')),
  max_occupants INTEGER NOT NULL DEFAULT 2,
  current_occupants INTEGER NOT NULL DEFAULT 0,
  monthly_rent BIGINT NOT NULL, -- Stored in VND
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by status
CREATE INDEX idx_rooms_status ON rooms(status);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Policies (Assuming admin role is required for now, or authenticated users)
CREATE POLICY "Authenticated users can view rooms" ON rooms
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert rooms" ON rooms
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update rooms" ON rooms
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete rooms" ON rooms
  FOR DELETE USING (auth.role() = 'authenticated');
