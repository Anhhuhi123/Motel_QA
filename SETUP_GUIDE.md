# Hướng Dẫn Cài Đặt & Chạy Dự Án (Supabase + Next.js)

Tài liệu này sẽ hướng dẫn bạn từng bước từ con số 0: Cách tạo project trên Supabase, cách chạy file SQL để tạo database (migration), và cách khởi động ứng dụng Next.js.

---

## Bước 1: Tạo dự án trên Supabase

1. Truy cập [Supabase.com](https://supabase.com/) và tạo một tài khoản (nếu chưa có).
2. Nhấn vào nút **"New Project"**.
3. Chọn Organization của bạn (hoặc tạo mới), đặt tên cho Project (ví dụ: `Motel_QA_DB`), tạo một mật khẩu Database mạnh và chọn khu vực (Region) gần bạn nhất (ví dụ: Singapore).
4. Nhấn **"Create new project"** và đợi khoảng vài phút để Supabase khởi tạo database cho bạn.

---

## Bước 2: Lấy thông tin API Keys (Biến môi trường)

Để ứng dụng Next.js của chúng ta có thể giao tiếp với Supabase, bạn cần copy 2 mã khóa.

1. Trong giao diện Supabase Project của bạn, nhìn thanh menu bên trái, chọn biểu tượng bánh răng **Settings** -> **API**.
2. Tìm phần **Project URL**, copy URL đó.
3. Tìm phần **Project API keys**, copy mã **`anon`** `public`.
4. Mở file `.env` nằm trong thư mục `propria/` trên máy của bạn và dán vào:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[MÃ-CỦA-BẠN].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...[MÃ-ANON-CỦA-BẠN]
```
*(Lưu ý: Không cần điền `SUPABASE_SERVICE_ROLE_KEY` lúc này vì chúng ta chủ yếu dùng anon key và Next.js SSR cho việc bảo mật).*

---

## Bước 3: Chạy Migrations (Khởi tạo Database)

Chúng ta có 6 file SQL migration nằm trong thư mục `propria/supabase/migrations/`. Bạn cần chạy chúng theo đúng số thứ tự từ 00 đến 05 để khởi tạo các bảng trong Database.

1. Tại thanh menu bên trái của Supabase, chọn **SQL Editor** (biểu tượng dấu `/`).
2. Nhấn **"New query"**.
3. Mở file đầu tiên trên máy tính của bạn: `20260604000000_init_profiles.sql`, copy TOÀN BỘ nội dung, dán vào SQL Editor trên Supabase, và nhấn nút **Run** (màu xanh góc dưới bên phải).
4. Xóa nội dung cũ, tiếp tục làm tương tự cho các file còn lại theo ĐÚNG THỨ TỰ:
   - ➜ Chạy `20260604000001_create_rooms.sql`
   - ➜ Chạy `20260604000002_create_tenants.sql`
   - ➜ Chạy `20260604000003_create_billing.sql`
   - ➜ Chạy `20260604000004_create_documents.sql`
   - ➜ Chạy `20260604000005_create_activities.sql`

> [!SUCCESS]
> Sau khi chạy xong 6 file này, Database của bạn đã có đầy đủ cấu trúc bảng (rooms, tenants, bills...) và các phân quyền RLS an toàn.

---

## Bước 4: Tạo Storage Buckets (Nơi lưu trữ file)

Vì dự án có tính năng sinh hợp đồng `.docx` và quản lý tài liệu, bạn cần tạo Bucket lưu trữ file.

1. Ở menu bên trái Supabase, chọn **Storage** (biểu tượng hộp giấy).
2. Nhấn **"New bucket"**.
3. Nhập tên Bucket là `templates`.
4. Bật công tắc **"Public bucket"** (rất quan trọng, để có thể download được biểu mẫu).
5. Nhấn **Save**.
6. (Tùy chọn) Tạo thêm 2 bucket nữa tên là `tenant-documents` và `contract-files` (như đã thiết kế trong kiến trúc) để dự phòng cho việc lưu trữ file PDF sau này.

**Quan trọng: Thiết lập quyền truy cập Storage**
Để ứng dụng có thể upload được file vào Bucket `templates`, bạn cần cấp quyền:
1. Trong mục Storage, chọn tab **Policies**.
2. Tại bucket `templates`, nhấn **New Policy** cho mục `INSERT` hoặc `ALL`.
3. Cấu hình cho phép tất cả các thao tác (hoặc chỉ `authenticated` users) được phép Insert/Update/Select.

---

## Bước 5: Cấu hình Authentication (Đăng nhập)

Do ứng dụng của chúng ta hiện tại dành cho Admin, bạn cần tạo sẵn một tài khoản Admin để đăng nhập.

1. Ở menu bên trái Supabase, chọn **Authentication**.
2. Chuyển sang tab **Users** và nhấn **"Add user"** -> **"Create new user"**.
3. Nhập một Email và Password mà bạn muốn dùng làm tài khoản quản trị viên. (Ví dụ: `admin@motel.com` / `12345678`).
4. Bỏ tick "Auto Confirm User" nếu bạn đã tự động confirm (Hoặc bật nó lên tùy giao diện). Tốt nhất là chắc chắn tài khoản đang ở trạng thái **Confirmed**.

> [!NOTE]
> Nhờ vào đoạn trigger chúng ta đã chạy ở SQL số 00, khi bạn tạo user này, bảng `profiles` cũng đã tự động tạo một dòng dữ liệu tương ứng.

---

## Bước 6: Khởi chạy dự án Next.js trên máy tính của bạn

Hiện tại cấu trúc dự án của bạn (trong thư mục `propria`) đang lai giữa Vite cũ và Next.js mới. Chúng ta cần cập nhật file `package.json` để chạy được Next.js.

1. Mở file `propria/package.json`, thay thế nội dung thành:
```json
{
  "name": "motel-qa-next",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "15.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0"
  }
}
```

2. Xóa các thư mục thừa của Vite (nếu muốn dọn dẹp) như: `vite.config.ts`, `index.html` (ở gốc), và thư mục `src/` cũ. (Bởi vì toàn bộ code Next.js đã nằm ở thư mục `app/`, `actions/`, `lib/`, `types/`).

3. Bật Terminal (hoặc iTerm), trỏ vào thư mục `propria`:
   ```bash
   cd /Users/macbook/Desktop/Motel_QA/propria
   ```

4. Chạy lệnh cài đặt các thư viện Next.js và Supabase:
   ```bash
   npm install
   ```

5. Khởi động server Next.js:
   ```bash
   npm run dev
   ```

6. Mở trình duyệt và truy cập: **[http://localhost:3000](http://localhost:3000)**.
   - Bạn sẽ bị chuyển hướng ra trang `/login`.
   - Đăng nhập bằng tài khoản Email/Password bạn vừa tạo ở Bước 5.
   - Trải nghiệm ứng dụng Dashboard!
