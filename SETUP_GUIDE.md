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

Thư mục `supabase/migrations/` chỉ chứa **một file duy nhất**:
`20260702000000_init_schema.sql`. Đây là nguồn schema duy nhất, mô tả đúng 5 bảng mà app thực sự
dùng (`rooms`, `tenants`, `bills`, `activity_logs`, `utility_settings`, id dạng text). Chạy file
này trong **SQL Editor** của Supabase — dù bạn tạo project mới từ đầu hay đang dọn lại một project
cũ từng chạy các migration khác, file này tự dọn các bảng/trigger rác còn sót lại trước khi tạo
đúng 5 bảng cần thiết.

## Bước 4: Tạo tài khoản Admin

1. Vào **Authentication → Users → Add user → Create new user**.
2. Nhập Email/Password, đảm bảo trạng thái **Confirmed**.

## Bước 5: Chạy dự án

```bash
pnpm install   # hoặc npm install
pnpm dev       # hoặc npm run dev
```

Mở [http://localhost:3000](http://localhost:3000), đăng nhập bằng tài khoản admin vừa tạo.
