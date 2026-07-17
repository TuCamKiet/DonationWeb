# Frontend (com-passion) - Báo cáo Thay đổi & Nâng cấp (afterChange)

Tài liệu này ghi chú cực kỳ chi tiết tất cả những thay đổi, bổ sung UI/UX, logic, sửa lỗi và tích hợp API đã được thực hiện trong dự án frontend `com-passion` kể từ khi dự án bắt đầu cho tới thời điểm hiện tại, đối chiếu trực tiếp với bản gốc tại `https://github.com/TalJa1/com-passion`.

## 1. Đại tu Giao diện & Trải nghiệm Người dùng (UI/UX)
Phần Giao diện đã được nâng cấp đồ sộ với hàng loạt Component mới và tinh chỉnh animation mượt mà:

- **Hệ thống Loading (Skeletons):**
  - Tạo mới `src/components/Skeleton.tsx` và `Skeleton.css`.
  - Khắc phục triệt để lỗi "Giật nảy Giao diện" (Layout Shift) trên các trang `ProductDetail.tsx` và `StoryDetail.tsx`. Thay vì để trống làm nội dung bị co rúm lại lúc chờ API, hệ thống nay đã giăng sẵn các khung xương (skeleton) mô phỏng chính xác cả 3 phân vùng giao diện.
  - Sửa lỗi lật ngược Skeleton ở trang `Stories.tsx`: Đã truyền biến `isRev` vào component Skeleton để đảm bảo thứ tự ảnh/chữ bám sát chuẩn xác với thiết kế lùi xen kẽ của các Câu chuyện thực tế.
- **Trang chủ (`Home.tsx`) & Số liệu Động (`CountUp.tsx`):**
  - Bổ sung component `CountUp.tsx` tạo hiệu ứng số nhảy liên tục.
  - Xóa bỏ việc điền cứng (hard-code) các con số ảo (ví dụ 14 ngày, 5400 sản phẩm). Trang chủ giờ đây bắt đầu từ số 0 và đếm dần lên ngay khi nhận được Data thật từ Backend, tạo sự minh bạch tuyệt đối.
- **Tối ưu Con trỏ Chuột (`Cursor.tsx`):** 
  - Khắc phục lỗi "Bấm không ăn" của con trỏ custom hình chiếc lá. Đã dời tâm nhận diện (hotspot) từ giữa hình (`SIZE/2`) lên vị trí đỉnh nhọn góc trái (`4px`). Con trỏ giờ đây nhạy và chính xác như chuột mặc định.
- **Thanh Điều Hướng (`Navbar.tsx`):**
  - Khắc phục tình trạng giật lag (lagging) khi cuộn trang (scroll-in/out). Tối ưu hóa bằng các thuộc tính CSS nâng cao (`clip-path` và `will-change: transform`), giúp trình duyệt dùng thẻ Đồ họa (GPU) để kết xuất mượt mà đạt chuẩn 60FPS.
- **Các Component Bổ sung Hoàn Toàn Mới:**
  - `AvatarUploader.tsx`: Hỗ trợ người dùng thay đổi ảnh đại diện trực quan.
  - `CustomSelect.tsx`: Đồng bộ thiết kế của các menu thả xuống (dropdown) cho đẹp mắt hơn thay vì dùng thẻ `<select>` thô kệch mặc định.
  - `Invoice.tsx` & `Invoice.css`: Xây dựng giao diện Hóa đơn A4 ẩn dưới màn hình nền, sẵn sàng cho tính năng In ấn/Lưu PDF chuyên nghiệp.
  - `NewsletterSignup.tsx`: Bổ sung form đăng ký nhận thư thông báo từ dự án.
  - `ReportCard.tsx`: Thiết kế thẻ hiển thị Báo cáo thu chi (Transparency).
  - `WelcomePopup.tsx`: Thêm thông báo chào mừng popup.
  - Trải nghiệm cuộn trang: Bổ sung `ScrollToTop.tsx` và `SmoothScroll.tsx` giúp thao tác lướt web trơn tru.
- **Nhận diện thương hiệu (Favicon):** Đổi biểu tượng icon mặc định của Vite trên tab trình duyệt thành Icon "Giỏ thủ công" chính thức của dự án.

## 2. Hệ thống Xác thực (Authentication)
- **Đại tu tính năng Đăng nhập (Google -> Firebase):**
  - Gỡ bỏ hoàn toàn thư viện `@react-oauth/google`.
  - Chuyển sang sử dụng **Firebase Authentication**. Cấu hình trong `src/lib/firebase.ts`.
  - Việc đăng nhập (Popup Google) nay được quản lý bởi máy chủ Firebase, đảm bảo tính bảo mật và cấp phát Token (`idToken`) chuẩn mực về cho Backend qua file `src/context/AuthContext.tsx`.

## 3. Cấu hình Môi trường & Sửa lỗi API
- **Sửa lỗi Trailing Slash - Sát thủ 404 (`api.ts`):**
  - Ngăn chặn lỗi khi người dùng khai báo URL trên Vercel bị dư dấu gạch chéo `/` ở đuôi (ví dụ: `https://.../`).
  - Thêm logic tự động kiểm tra `endsWith('/')` và cắt gọt chuỗi (`slice`) để đảm bảo các Endpoint (ví dụ `//api/impact/stats`) không bị lỗi 404.
- **Cập nhật Biến Môi Trường (`.env.example`):** Bổ sung cụ thể mẫu khai báo API Backend và toàn bộ 7 khóa cấu hình Firebase. Bổ sung thư viện `firebase` và `react-to-print` vào `package.json`.

## 4. Quản lý Giỏ Hàng & Đặt Hàng (Cart)
- Bổ sung thông báo nhắc nhở cực kỳ tinh tế ở trang thành công (`Cart.tsx`): Sau khi gọi API `/orders` tạo đơn thành công, giao diện sẽ xuất hiện thêm một hộp thoại nhỏ xinh xắn (sử dụng màu sắc `var(--color-surface)` và `var(--color-accent)` tiệp với theme dự án) để nhắc người dùng check hộp thư email nhận hoá đơn điện tử. Tính năng này được tối ưu 100% bằng CSS/HTML DOM chuẩn, không làm thay đổi trạng thái state và hoàn toàn không ảnh hưởng tới logic giỏ hàng cũ.
