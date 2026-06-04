-- Create Tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  national_id TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  dob DATE,
  gender TEXT,
  occupation TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Contracts table
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  deposit_amount BIGINT NOT NULL, -- In VND
  deposit_status TEXT DEFAULT 'Pending' CHECK (deposit_status IN ('Paid', 'Partial', 'Pending', 'Overdue')),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Terminated', 'Expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Occupants table
CREATE TABLE occupants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  UNIQUE(room_id, tenant_id)
);

-- Indexes
CREATE INDEX idx_contracts_tenant ON contracts(tenant_id);
CREATE INDEX idx_contracts_room ON contracts(room_id);
CREATE INDEX idx_occupants_room ON occupants(room_id);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE occupants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can perform all actions on tenants" ON tenants
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can perform all actions on contracts" ON contracts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can perform all actions on occupants" ON occupants
  FOR ALL USING (auth.role() = 'authenticated');
