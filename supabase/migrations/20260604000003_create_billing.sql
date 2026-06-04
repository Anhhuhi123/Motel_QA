-- Create Settings table (Singleton for global utility prices)
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  electricity_price BIGINT NOT NULL DEFAULT 3500, -- In VND
  water_price BIGINT NOT NULL DEFAULT 15000, -- In VND
  internet_fee BIGINT NOT NULL DEFAULT 100000, -- In VND
  garbage_fee BIGINT NOT NULL DEFAULT 50000, -- In VND
  parking_fee BIGINT NOT NULL DEFAULT 0, -- In VND
  other_fee BIGINT NOT NULL DEFAULT 0, -- In VND
  auto_sync BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO settings (electricity_price, water_price) VALUES (3500, 15000);

-- Create Meter Readings table
CREATE TABLE meter_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  reading_month DATE NOT NULL, -- e.g., '2023-08-01' for August 2023
  electricity_index INTEGER NOT NULL,
  water_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, reading_month)
);

-- Create Bills table
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  billing_month DATE NOT NULL,
  total_amount BIGINT NOT NULL, -- In VND
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Paid', 'Pending', 'Unpaid', 'Overdue')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, billing_month)
);

-- Create Bill Items table
CREATE TABLE bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- e.g., 'Rent', 'Electricity', 'Water', 'Internet', 'Garbage'
  description TEXT,
  amount BIGINT NOT NULL, -- In VND
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bills_room_month ON bills(room_id, billing_month);
CREATE INDEX idx_meter_readings_room ON meter_readings(room_id, reading_month);
CREATE INDEX idx_bill_items_bill ON bill_items(bill_id);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meter_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can perform all actions on settings" ON settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can perform all actions on meter_readings" ON meter_readings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can perform all actions on bills" ON bills FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can perform all actions on bill_items" ON bill_items FOR ALL USING (auth.role() = 'authenticated');
