# Kế Hoạch Dọn Dẹp Database — Chỉ Giữ Lại Bảng Quan Trọng

## Bối cảnh

Dự án hiện có **2 bộ schema Supabase khác nhau** nằm chung trong `supabase/migrations/`, để lại tổng cộng tới 14 bảng khả dĩ nếu cả hai từng được chạy trên cùng một project:

1. **Schema đang thực sự dùng** — `supabase/migrations/supabase-schema.sql`, id kiểu `TEXT`, được `src/services/api.ts` gọi trực tiếp qua `supabase.from(...)`.
2. **Schema cũ (đã bỏ)** — 5 file `20260604000000..000005_*.sql`, id kiểu `UUID`, được viết cho một hướng kiến trúc Next.js đã bị gỡ bỏ khỏi repo (`SETUP_GUIDE.md` xác nhận: *"Scaffold Next.js đã bị gỡ bỏ vì không tương thích... không bao giờ được build"*). **Không có dòng code nào trong `src/` tham chiếu tới các bảng này.**

Đây là lý do phía Supabase dashboard nhìn thấy "khá nhiều bảng" — phần lớn là rác từ hướng đi cũ, không phục vụ gì cho app hiện tại và chỉ gây khó theo dõi/rủi ro nhầm lẫn khi sửa schema sau này.

## Kiểm kê toàn bộ bảng

| Bảng | Nguồn | Được code dùng? | Quyết định |
|---|---|---|---|
| `rooms` | supabase-schema.sql | ✅ `api.ts` (fetchRooms/createRoom/updateRoom/deleteRoom) | **Giữ** |
| `tenants` | supabase-schema.sql | ✅ `api.ts` (fetchTenants/createTenant/updateTenant/deleteTenant) | **Giữ** |
| `bills` | supabase-schema.sql | ✅ `api.ts` (fetchBills/createBill/updateBill/deleteBill) | **Giữ** |
| `activity_logs` | supabase-schema.sql | ✅ `api.ts` (fetchActivityLogs/createActivityLog) | **Giữ** |
| `utility_settings` | supabase-schema.sql | ✅ `api.ts` (fetchUtilitySettings/updateUtilitySettings) | **Giữ** |
| `document_templates` | supabase-schema.sql | ❌ Không còn (component `TemplatesView.tsx` đã bị xóa khỏi `src/`) | **Xóa** |
| `profiles` | migration `000000_init_profiles` | ❌ Không có | **Xóa** |
| `rooms` (bản UUID) | migration `000001_create_rooms` | ❌ Trùng tên với bảng thật — nếu từng chạy, đã bị `DROP...CASCADE` ghi đè khi chạy `supabase-schema.sql` | Không cần xử lý riêng |
| `tenants` (bản UUID) | migration `000002_create_tenants` | ❌ Trùng tên, tương tự trên | Không cần xử lý riêng |
| `contracts` | migration `000002_create_tenants` | ❌ Không có | **Xóa** |
| `occupants` | migration `000002_create_tenants` | ❌ Không có | **Xóa** |
| `settings` | migration `000003_create_billing` | ❌ Không có (khác `utility_settings` đang dùng) | **Xóa** |
| `meter_readings` | migration `000003_create_billing` | ❌ Không có (tính năng Thanh Toán Nhanh mới lưu chỉ số điện thẳng trên `rooms.last_electricity_reading`, không dùng bảng riêng) | **Xóa** |
| `bills` (bản UUID) | migration `000003_create_billing` | ❌ Trùng tên, tương tự trên | Không cần xử lý riêng |
| `bill_items` | migration `000003_create_billing` | ❌ Không có | **Xóa** |
| `document_templates` (bản UUID) | migration `000004_create_documents` | ❌ Trùng tên, tương tự trên | Không cần xử lý riêng |
| `documents` | migration `000004_create_documents` | ❌ Không có | **Xóa** |
| `activities` | migration `000005_create_activities` | ❌ Không có (khác `activity_logs` đang dùng) | **Xóa** |

**Kết quả cuối cùng: chỉ giữ 5 bảng** — `rooms`, `tenants`, `bills`, `activity_logs`, `utility_settings`. Đây là toàn bộ những gì app cần để chạy các tính năng hiện có (Phòng, Người thuê, Hóa đơn, Tài khoản/cấu hình giá, Dashboard hoạt động gần đây).

## Kế hoạch thực hiện

### Bước 1 — Dọn repo (loại bỏ schema rác, tránh nhầm lẫn về sau)
- Xóa 5 file migration cũ: `supabase/migrations/20260604000000_init_profiles.sql` đến `20260604000005_create_activities.sql`. Chúng không map với schema thật (UUID vs TEXT id) và không được `SETUP_GUIDE.md` khuyến nghị chạy cho project mới.
- Sửa `supabase/migrations/supabase-schema.sql`: bỏ khối tạo bảng `document_templates` (mục 6) và dòng `DROP TABLE IF EXISTS document_templates CASCADE;` ở đầu file, vì không còn tính năng nào dùng tới.
- Sửa `SETUP_GUIDE.md`:
  - Bước 3: bỏ đoạn nhắc tới các migration `20260604...` và các bảng `contracts/occupants/settings/activities` (không còn tồn tại để nhắc tới nữa).
  - Bỏ hẳn Bước 4 ("Tạo Storage Bucket cho Document Templates") vì tính năng mẫu hợp đồng đã bị gỡ.
  - Bước 5: bỏ nhắc tới trigger tạo `profiles` (bảng đã xóa) — tên/role hiển thị ở Header vẫn đang dùng dữ liệu tĩnh, không phụ thuộc bảng này.

### Bước 2 — Dọn Supabase project thật (chạy 1 lần trong SQL Editor)
Chỉ chạy phần này nếu project Supabase của bạn từng áp dụng các migration cũ (kiểm tra nhanh: vào **Table Editor**, nếu thấy `profiles`, `contracts`, `occupants`, `settings`, `meter_readings`, `bill_items`, `documents`, hoặc `activities` thì đúng là có rác cần dọn):

```sql
-- Gỡ trigger/function tự tạo profile khi có user mới (nếu migration profiles từng chạy)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Xóa các bảng rác từ schema Next.js đã bỏ — tên không trùng với bảng đang dùng
-- nên an toàn để xóa thẳng, không ảnh hưởng dữ liệu thật (rooms/tenants/bills/...)
DROP TABLE IF EXISTS bill_items CASCADE;
DROP TABLE IF EXISTS meter_readings CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS occupants CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Chỉ chạy dòng dưới nếu bảng document_templates thật sự không còn dữ liệu cần giữ
-- (tính năng mẫu hợp đồng đã bị gỡ khỏi app, không còn code nào đọc/ghi bảng này)
DROP TABLE IF EXISTS document_templates CASCADE;
```

**Lưu ý an toàn:** không đụng tới `rooms`, `tenants`, `bills`, `activity_logs`, `utility_settings` — đây là 5 bảng dữ liệu thật, đang được app đọc/ghi hằng ngày.

### Bước 3 — Xác minh sau khi dọn
1. Vào Supabase **Table Editor**, xác nhận chỉ còn đúng 5 bảng: `rooms`, `tenants`, `bills`, `activity_logs`, `utility_settings`.
2. Chạy `npm run dev`, đăng nhập, kiểm tra lần lượt các trang Phòng / Người thuê / Hóa đơn / Tài khoản / Dashboard vẫn tải và lưu dữ liệu bình thường (không có bảng nào bị xóa nhầm).
3. Thử tạo user Supabase Auth mới, xác nhận không còn lỗi liên quan tới trigger `on_auth_user_created` cũ (vì đã gỡ ở Bước 2).

## File sẽ sửa/xóa
- Xóa: `supabase/migrations/20260604000000_init_profiles.sql` → `20260604000005_create_activities.sql` (5 file)
- Sửa: `supabase/migrations/supabase-schema.sql` (bỏ `document_templates`)
- Sửa: `SETUP_GUIDE.md` (Bước 3, 4, 5)
