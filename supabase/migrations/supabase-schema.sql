-- KỊCH BẢN TẠO DATABASE (MIGRATION SCRIPT) CHO SUPABASE
-- Bạn có thể copy toàn bộ nội dung file này và dán vào "SQL Editor" trên trang quản trị Supabase để chạy (Run).

-- ⚠️ CẢNH BÁO: Bỏ comment (xóa dấu --) ở 6 dòng DROP dưới đây nếu bạn muốn XÓA SẠCH dữ liệu cũ và tạo lại bảng từ đầu.
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS utility_settings CASCADE;
DROP TABLE IF EXISTS document_templates CASCADE;


-- 1. BẢNG PHÒNG TRỌ (ROOMS)
CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL,
    name TEXT NOT NULL,
    floor INTEGER NOT NULL,
    wing TEXT NOT NULL,
    status TEXT NOT NULL,
    max_occupants INTEGER NOT NULL DEFAULT 2,
    current_occupants INTEGER NOT NULL DEFAULT 0,
    monthly_rent INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. BẢNG NGƯỜI THUÊ (TENANTS)
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    national_id TEXT,
    phone TEXT,
    room_assignment TEXT,
    contract_start TEXT,
    deposit_status TEXT,
    avatar_url TEXT,
    occupation TEXT,
    gender TEXT,
    dob TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BẢNG HÓA ĐƠN (BILLS)
CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    room TEXT NOT NULL,
    month TEXT NOT NULL,
    electricity INTEGER NOT NULL DEFAULT 0,
    water INTEGER NOT NULL DEFAULT 0,
    rent INTEGER NOT NULL,
    total INTEGER NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. BẢNG NHẬT KÝ HOẠT ĐỘNG (ACTIVITY LOGS)
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    "user" TEXT NOT NULL, -- Tên cột user nằm trong ngoặc kép vì nó trùng với từ khóa của SQL
    action TEXT NOT NULL,
    detail TEXT NOT NULL,
    time_label TEXT NOT NULL,
    type TEXT NOT NULL,
    amount INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. BẢNG CÀI ĐẶT TIỆN ÍCH (UTILITY SETTINGS)
CREATE TABLE IF NOT EXISTS utility_settings (
    id TEXT PRIMARY KEY DEFAULT 'default-settings',
    electricity_price INTEGER NOT NULL DEFAULT 0,
    water_price INTEGER NOT NULL DEFAULT 0,
    internet_fee INTEGER NOT NULL DEFAULT 0,
    garbage_fee INTEGER NOT NULL DEFAULT 0,
    parking_fee INTEGER NOT NULL DEFAULT 0,
    other_fee INTEGER NOT NULL DEFAULT 0,
    auto_sync BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tạo một record cấu hình mặc định (nếu chưa có)
INSERT INTO utility_settings (id, electricity_price, water_price, internet_fee, garbage_fee, parking_fee, other_fee, auto_sync)
VALUES ('default-settings', 3500, 25000, 150000, 50000, 100000, 0, true)
ON CONFLICT (id) DO NOTHING;

-- 6. BẢNG MẪU HỢP ĐỒNG (DOCUMENT TEMPLATES)
CREATE TABLE IF NOT EXISTS document_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
