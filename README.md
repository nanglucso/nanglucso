# Nanglucso

Hãy tạo cho tôi một ứng dụng web Single Page Application (SPA) dùng để ôn thi trắc nghiệm môn "Năng lực số và ứng dụng trí tuệ nhân tạo AI" với giao diện hiện đại, tối giản, chuẩn Responsive (đẹp trên cả điện thoại và máy tính).\

Các tính năng chính cần có:

Trang chủ: Hiển thị thanh tiến độ tổng quan, nút bắt đầu học và giới thiệu ngắn gọn.

Chế độ Ôn lý thuyết: Hiển thị từng câu hỏi một. Người dùng chọn đáp án -> Nếu Đúng thì hiện màu xanh, nếu Sai thì hiện màu đỏ và highlight đáp án Đúng. Có nút "Câu tiếp theo" và "Câu trước đó".

Chế độ Tra cứu: Một ô tìm kiếm cho phép người dùng gõ từ khóa để tìm nhanh câu hỏi và xem đáp án ngay lập tức.

Chế độ Gameshow (Thi thử): Trộn ngẫu nhiên câu hỏi, có đồng hồ đếm ngược thời gian làm bài, khi nộp bài thì hiển thị điểm số và hiệu ứng pháo hoa chúc mừng nếu đạt điểm cao.

Thống kê câu sai: Tự động lưu những câu hỏi mà người dùng đã trả lời sai vào một mục riêng để họ có thể vào ôn lại (Sử dụng LocalStorage của trình duyệt để lưu dữ liệu).

Dưới đây là file danh sách câu hỏi gồm 200 câu  (kèm file giáo trình để dễ dàng đối chiếu đáp án :

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nanglucso.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/721f054d-5709-4a59-8b0e-f9dda2901022).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
