# Hướng Dẫn Cài Đặt & Chạy Dự Án (Vite + React + Supabase)

Dự án chạy trên **Vite + React 19** (thư mục `src/`), không phải Next.js. Scaffold Next.js
(`app/`, `actions/`, `lib/supabase/`) đã bị gỡ bỏ vì không tương thích với `package.json` hiện tại
và không bao giờ được build. Xem `MIGRATION_PLAN.md` để biết chi tiết quyết định này.

---

## Bước 1: Tạo dự án trên Supabase

1. Truy cập [Supabase.com](https://supabase.com/) và tạo một tài khoản (nếu chưa có).
2. Nhấn **"New Project"**, đặt tên, tạo mật khẩu Database, chọn Region gần bạn nhất.
3. Đợi vài phút để Supabase khởi tạo xong.

## Bước 2: Lấy API Keys và cấu hình `.env`

1. Trong Supabase Project, vào **Settings → API**.
2. Copy **Project URL** và **anon public key**.
3. Tạo/chỉnh file `.env` ở thư mục gốc dự án:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[MÃ-CỦA-BẠN].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...[MÃ-ANON-CỦA-BẠN]
```

Vite đọc được cả `NEXT_PUBLIC_*` lẫn `VITE_*` (xem `vite.config.ts` → `envPrefix`), nên không bắt
buộc phải đổi tiền tố. **Không** đưa `SUPABASE_SERVICE_ROLE_KEY` vào bất kỳ biến nào có tiền tố
`VITE_`/`NEXT_PUBLIC_` — key đó sẽ bị nhúng vào bundle frontend và lộ ra công khai.

## Bước 3: Khởi tạo Database

Thư mục `supabase/migrations/` chứa file `supabase-schema.sql` — đây là schema **đang thật sự
được dùng** bởi app (bảng `rooms`, `tenants`, `bills`, `activity_logs`, `utility_settings`,
`document_templates`, id dạng text). Chạy file này trong **SQL Editor** của Supabase nếu bạn tạo
project mới từ đầu.

Các file migration đánh số `20260604...` là bản schema chuẩn hóa (UUID) từng dự tính cho hướng
Next.js đã bỏ. Nếu project Supabase của bạn đã có sẵn các bảng đó (`contracts`, `occupants`,
`settings`, `activities`) thì không cần xóa — chúng để trống và có thể tái sử dụng dần cho các
tính năng như hợp đồng thật (xem mục 3.2 trong `MIGRATION_PLAN.md`), miễn là sửa kiểu cột khóa
ngoại về TEXT cho khớp id của `rooms`/`tenants`.

## Bước 4: Tạo Storage Bucket (cho Document Templates)

1. Vào **Storage → New bucket**, đặt tên `templates`, bật **Public bucket**.
2. Vào tab **Policies** của bucket, cấp quyền Insert/Update/Select cho `authenticated` users.

## Bước 5: Tạo tài khoản Admin

1. Vào **Authentication → Users → Add user → Create new user**.
2. Nhập Email/Password, đảm bảo trạng thái **Confirmed**.
3. Nếu trigger tạo `profiles` (trong `supabase-schema.sql`/migration profiles) đã chạy, một dòng
   trong bảng `profiles` sẽ tự sinh tương ứng — đây là nguồn dữ liệu thật cho tên/role hiển thị ở
   Header thay vì dữ liệu cứng.

## Bước 6: Chạy dự án

```bash
pnpm install   # hoặc npm install
pnpm dev       # hoặc npm run dev
```

Mở [http://localhost:3000](http://localhost:3000), đăng nhập bằng tài khoản admin vừa tạo.
