-- KỊCH BẢN TẠO DATABASE DUY NHẤT CHO SUPABASE (bản chuẩn hóa cuối cùng)
-- Copy toàn bộ nội dung file này và chạy trong "SQL Editor" của Supabase.
--
-- File này thay thế mọi migration cũ trong repo (bản schema Next.js UUID đã bỏ,
-- và bản supabase-schema.sql cũ có thêm bảng document_templates không còn dùng).
-- Đây là NGUỒN DUY NHẤT (single source of truth) mô tả đúng 5 bảng mà app
-- (src/services/api.ts) thực sự đọc/ghi.

-- ============================================================================
-- BƯỚC 0: DỌN CÁC ĐỐI TƯỢNG RÁC TỪ SCHEMA CŨ (an toàn để chạy dù chưa từng tồn tại)
-- ============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS bill_items CASCADE;
DROP TABLE IF EXISTS meter_readings CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS document_templates CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS occupants CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ⚠️ Bỏ comment (xóa dấu --) ở các dòng dưới đây nếu muốn XÓA SẠCH dữ liệu thật
-- hiện có và tạo lại 5 bảng từ đầu (ví dụ khi cần đổi cấu trúc cột đang dùng).
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS utility_settings CASCADE;

-- ============================================================================
-- 1. BẢNG PHÒNG TRỌ (ROOMS)
-- ============================================================================
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
    last_electricity_reading NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 2. BẢNG NGƯỜI THUÊ (TENANTS)
-- ============================================================================
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

-- ============================================================================
-- 3. BẢNG HÓA ĐƠN (BILLS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    room TEXT NOT NULL,
    month TEXT NOT NULL,
    electricity INTEGER NOT NULL DEFAULT 0,
    water INTEGER NOT NULL DEFAULT 0,
    rent INTEGER NOT NULL,
    total INTEGER NOT NULL,
    status TEXT NOT NULL,
    electricity_units NUMERIC,
    previous_electricity_reading NUMERIC,
    current_electricity_reading NUMERIC,
    internet_fee INTEGER,
    garbage_fee INTEGER,
    parking_fee INTEGER,
    other_fee INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 4. BẢNG NHẬT KÝ HOẠT ĐỘNG (ACTIVITY LOGS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    "user" TEXT NOT NULL, -- tên cột nằm trong ngoặc kép vì trùng từ khóa SQL
    action TEXT NOT NULL,
    detail TEXT NOT NULL,
    time_label TEXT NOT NULL,
    type TEXT NOT NULL,
    amount INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 5. BẢNG CÀI ĐẶT TIỆN ÍCH (UTILITY SETTINGS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS utility_settings (
    id TEXT PRIMARY KEY DEFAULT 'default-settings',
    electricity_price INTEGER NOT NULL DEFAULT 0,
    water_price INTEGER NOT NULL DEFAULT 0, -- phí nước CỐ ĐỊNH/tháng, không phải đơn giá/m3
    internet_fee INTEGER NOT NULL DEFAULT 0,
    garbage_fee INTEGER NOT NULL DEFAULT 0,
    parking_fee INTEGER NOT NULL DEFAULT 0,
    other_fee INTEGER NOT NULL DEFAULT 0,
    auto_sync BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Đảm bảo cột last_electricity_reading tồn tại kể cả khi bảng rooms đã có sẵn từ trước
-- (chạy lại migration này trên project cũ mà không XÓA SẠCH ở Bước 0 phía trên).
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS last_electricity_reading NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS electricity_units NUMERIC;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS previous_electricity_reading NUMERIC;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS current_electricity_reading NUMERIC;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS internet_fee INTEGER;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS garbage_fee INTEGER;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS parking_fee INTEGER;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS other_fee INTEGER;

-- Tạo một record cấu hình mặc định (nếu chưa có)
INSERT INTO utility_settings (id, electricity_price, water_price, internet_fee, garbage_fee, parking_fee, other_fee, auto_sync)
VALUES ('default-settings', 3500, 100000, 250000, 50000, 120000, 0, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- BƯỚC CUỐI: TẮT ROW LEVEL SECURITY
-- ============================================================================
-- App này dùng chung 1 anon/publishable key cho mọi thao tác đọc/ghi (không có
-- luồng Supabase Auth phân quyền theo user), nên bật RLS mà không có policy sẽ
-- chặn toàn bộ INSERT/UPDATE/DELETE (SELECT vẫn có thể vô tình được cho phép
-- qua policy cũ, gây ra tình trạng "xem được nhưng không tạo được gì mới").
-- Tắt RLS ở đây là điều kiện cần để các hàm createRoom/createTenant/... trong
-- src/services/api.ts hoạt động được.
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE bills DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE utility_settings DISABLE ROW LEVEL SECURITY;
