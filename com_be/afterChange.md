# Backend (com_be) - Báo cáo Thay đổi & Nâng cấp (afterChange)

Tài liệu này ghi chú chi tiết tất cả những thay đổi, bổ sung, và tối ưu đã được thực hiện trong dự án backend `com_be` kể từ khi dự án bắt đầu cho tới thời điểm hiện tại, so với bản gốc tại `https://github.com/TalJa1/com_be`. 

## 1. Hệ thống Cấu hình & Biến môi trường (.env)
- **Tối ưu `.env.example` và `.env`:** Thêm mẫu chuẩn cho người dùng mới tham khảo. Cụ thể hóa các thông số Cloudinary, Firebase, Database.
- **Bảo mật JWT (`JWT_SECRET`):** Đã xóa bỏ chuỗi khóa mặc định `change-me`, tạo và áp dụng chuỗi `JWT_SECRET` siêu ngẫu nhiên dài 64 ký tự nhằm chống giả mạo token.
- **CORS Config:** Mở rộng `CORS_ORIGINS` cho phép liên kết trực tiếp với Vercel (`https://donationweb-ovd9.onrender.com`), chống lỗi Cross-Origin khi gọi API.

## 2. Hệ thống Xác thực (Authentication) & User
- **Chuyển đổi hoàn toàn sang Firebase Auth:**
  - Lược bỏ luồng xác thực Google OAuth trực tiếp trên server cũ.
  - Sửa đổi `app/api/routes/auth.py`, tích hợp Firebase Admin SDK. Giờ đây Backend làm nhiệm vụ lấy `id_token` từ Frontend, ném cho hàm `verify_id_token` của Firebase để xác thực cực kỳ bảo mật, sau đó tự sinh ra thẻ `JWT` riêng trả về trình duyệt.
- Bổ sung trường dữ liệu `avatar` (dưới dạng URL Cloudinary) vào model User.

## 3. Quản lý Đơn hàng (Orders) & Logic Thống Kê (Impact)
- Sửa đổi `app/api/routes/orders.py`: Khi tạo một đơn hàng (`POST /orders`), hệ thống không chỉ lưu vào Database mà còn tự động tính toán tổng số tiền (funds), số bữa ăn (meals) và cập nhật số liệu tương ứng vào bảng `ImpactStat`. Tự động tạo và cập nhật các chỉ số phân bổ Quỹ (Report) hàng tháng.
- Thiết kế hệ thống in ấn Hóa đơn với API lấy số liệu trực tiếp.

## 4. Các Chức năng Mới
- **Hệ thống Upload Ảnh (Cloudinary):**
  - Tạo mới file `app/api/routes/upload.py`.
  - Thiết kế luồng cho phép nhận ảnh qua chuẩn `multipart/form-data`, nén và đẩy thẳng lên Cloudinary (vào folder `avatars`), sau đó trả về `secure_url`. Tích hợp trực tiếp với tính năng cập nhật Hồ sơ người dùng và Sản phẩm.

## 5. Cập nhật Thư viện (`requirements.txt`)
So sánh với dự án gốc, hệ thống đã được cài cắm thêm rất nhiều "vũ khí" hạng nặng. Đã bổ sung chuẩn xác các gói sau vào `requirements.txt`:
- `cloudinary`: Phục vụ API upload ảnh.
- `passlib[bcrypt]`, `bcrypt`: Hỗ trợ mã hóa.
- `firebase-admin`, `google-auth`, `requests`: Bộ công cụ bắt buộc để chạy Firebase Admin, chữa triệt để lỗi `ModuleNotFoundError` khi deploy lên Render.

## 6. Triển khai đám mây (Render Deployment)
- Đổi lệnh khởi chạy Web (Start Command) thành: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` để Render có thể tự động bắt được tín hiệu mạng mở của máy chủ. Khắc phục lỗi `No open ports detected on 0.0.0.0`.
- Thiết lập Database cho PostgreSQL (từ Neon) chuẩn xác thông qua biến `DATABASE_URL`.

## 7. Hệ thống Thông báo Email (Order Confirmation)
- **Kiến trúc & Công cụ:**
  - Không sử dụng Firebase / Frontend để gửi mail (dù có hỗ trợ Trigger Email). Lý do: Logic gửi mail thuộc về Business Logic; đặt ở Frontend dễ dẫn đến bất đồng bộ dữ liệu (rớt mạng sau khi tạo đơn nhưng chưa gửi mail), bảo mật kém (lộ API) và chi phí (yêu cầu Firebase Blaze). Đặt logic ở Backend FastAPI đảm bảo an toàn tuyệt đối, error handling dễ dàng qua hệ thống log tập trung, và duy trì flow liền mạch.
  - Sử dụng dịch vụ **Resend API** thông qua HTTP POST request bằng thư viện `httpx` (đã có sẵn trong dự án) thay vì cấu hình SMTP phức tạp. Giúp gửi mail cực nhanh, siêu nhẹ, không cần cài thêm package nào và không lo lỗi xác thực SMTP của Google.
  - Sử dụng `Jinja2` (sẵn có) để render template HTML.
- **Chi tiết Code & Vị trí:**
  - `app/core/config.py`: Đã thay thế các cấu hình SMTP cũ bằng cấu hình Resend (`resend_api_key`, `resend_from_email`).
  - `app/templates/order_email.html` (File mới): Template hiển thị đẹp mắt, sử dụng biến truyền vào (user name, mã đơn, danh sách sản phẩm, đóng góp, báo cáo dòng tiền).
  - `app/core/mailer.py` (File mới): Khởi tạo `Environment` của Jinja2, định nghĩa hàm `send_order_confirmation_email` dùng `httpx.post` kết nối tới API của Resend, với khối `try...except` bảo vệ logic để tránh lỗi crash app.
  - `app/api/routes/orders.py`:
    - *Cũ:* `async def create_order(..., session: SessionDep) -> Order:` (xử lý đồng bộ, lưu DB xong trả kết quả).
    - *Mới:* Bổ sung tham số `background_tasks: BackgroundTasks`. Sau khi `session.commit()`, gọi `background_tasks.add_task(send_order_confirmation_email, ...)` để tiến trình gửi mail diễn ra âm thầm, không chặn Response tới người dùng. 
- **Error Handling:** 
  - Mọi lỗi gọi HTTP API tới Resend (như rớt mạng, sai API Key) trong `mailer.py` đều bị chặn lại bởi `except Exception` và lưu xuống `logging.error`. Người dùng hoàn toàn không bị ảnh hưởng, vẫn nhận được response 201 (Đặt hàng thành công) siêu nhanh.
