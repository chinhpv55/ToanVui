# Changelog

Toán Vui — log các thay đổi giữa các phiên bản. Tuân theo [SemVer](https://semver.org/lang/vi/):
**MAJOR.MINOR.PATCH** = thay đổi phá tương thích · tính năng mới · sửa lỗi.

---

## [1.3.0] — 2026-04-26

**Đợt 4 — Mở rộng curriculum: Lớp 3 KNTT + Lớp 4 (CD/KNTT) + Lớp 5 (CD/KNTT)**

### Thêm
- **Cột `level_tag`** (`co_ban` | `nang_cao`) trên `curriculum_topics` để phân loại đề SGK chuẩn vs đề luyện thi HSG / tư duy logic. Tất cả topic hiện có default `co_ban`; sau này admin có thể thêm topic `nang_cao`.
- **Đa-bộ-sách / đa-lớp**: app giờ dạy được toán **lớp 3-5 cho cả Cánh Diều và Kết nối tri thức**. Form đăng ký đã có dropdown lớp 1-9, nay user thực sự có nội dung phù hợp khi chọn lớp 3-5.
- ~190 topic mới chia 5 chương trình:
  - Lớp 3 KNTT (~46 topic) — bộ song song với CD lớp 3 đã có
  - Lớp 4 Cánh Diều (~51 topic) — 4 phần SGK (Số tự nhiên, Phép tính STN, Phân số, Phép tính phân số)
  - Lớp 4 KNTT (~46 topic) — 13 chủ đề SGK
  - Lớp 5 Cánh Diều (~46 topic) — Số thập phân, Tỉ số phần trăm, Hình học, Vận tốc
  - Lớp 5 KNTT (~39 topic)

### Sửa / Tối ưu
- **Prompts đa-grade/series**: `BATCH_SYSTEM_PROMPT` chuyển từ hardcode "lớp 3 Cánh Diều" sang `buildBatchSystemPrompt(grade, series)` động. Claude giờ sinh đề khớp đúng SGK của bé.
- `/api/generate-exercise` và `/api/admin/seed-bank` đều fetch + truyền `topic.series` qua prompt.

### Hạ tầng
- Migration `007_seed_grade_4_5.sql`: schema upgrade (level_tag) + seed lớp 3 KNTT + lớp 4 (CD + KNTT).
- Migration `008_seed_grade_5.sql`: seed lớp 5 (CD + KNTT).
- Bỏ qua các bài "Luyện tập"/"Ôn tập" thuần để bank gọn (AI tự xoay quanh chủ đề chính, đỡ trùng).

---

## [1.2.0] — 2026-04-26

**Đợt 3 — Kho bài tập (cache) + chia model theo cấp**

### Thêm
- **Kho bài tập (`exercise_bank`)**: Claude sinh xong câu nào thì lưu vào kho. Lần sau user yêu cầu cùng (chủ đề × độ khó), app trả từ kho ngay (gần $0). Mỗi user có bảng `student_seen_exercises` để không gặp lại câu đã làm.
- **Trang `/admin/bank`**: thống kê số câu/topic/độ khó, nút **Seed tất cả** để pre-seed sẵn (mặc định 30 câu × 3 độ khó × topic), progress bar khi chạy bulk.
- **Multi-model**: lớp 1-5 dùng Haiku 4.5 (~12x rẻ hơn Sonnet), lớp 6-9 dùng Sonnet 4.6.

### Sửa / Tối ưu
- `/api/generate-exercise` đổi flow: **bank-first** → AI lazy fill → lưu kho → mark seen. Giảm chi phí ~80-95% sau khi kho đầy.

### Hạ tầng
- Migration `006_exercise_bank.sql`: 2 bảng + 3 RPC (`get_unseen_exercises`, `mark_exercises_seen`, `bank_stats`).
- `/api/admin/seed-bank` (admin-only) với cap `MAX_CALLS_PER_REQUEST=12` để giới hạn chi phí mỗi lần gọi.

---

## [1.1.0] — 2026-04-26

**Đợt 2 — Admin panel + Chọn lớp + Bảng xếp hạng tuần**

### Thêm
- **Trang `/admin`** cho quản trị viên: danh sách user, filter theo plan, kích hoạt / tạm khoá / reset trial. Đi kèm RPC `admin_list_users()`.
- **Đăng ký**: thêm dropdown chọn **Lớp 1–9** (mặc định lớp 3) và trường **Biệt danh** dùng cho bảng xếp hạng.
- **Trang `/leaderboard`**: top 50 theo số câu đúng trong tuần, reset thứ Hai. Tier theo các vì sao trong giải ngân hà (Procyon → Aldebaran → Capella → Betelgeuse → Rigel → Polaris → Vega → Sirius). Tabs **Cùng lớp** / **Toàn trường**. Chỉ hiển thị nickname + avatar (privacy-first cho trẻ em).
- **Header**: hiện icon 🛠️ trong app cho admin, và icon 🌌 Xếp hạng trong bottom nav cho mọi user.

### Hạ tầng
- Migration `005_admin_leaderboard.sql`: 2 RPC `SECURITY DEFINER` (`admin_list_users`, `get_weekly_leaderboard`).

---

## [1.0.0] — 2026-04-26

**Đợt 1 — Trial/Active/Suspended gating + tối ưu chi phí API**

### Thêm
- **Mô hình tài khoản 3 trạng thái**: `trial` (10 phiên hoặc 7 ngày), `active` (đã kích hoạt), `suspended` (tạm khoá). Tự suspend toàn bộ user cũ trừ admin và Vân Khánh khi triển khai để bảo vệ ngân sách API.
- **Trang chặn dùng thử**: modal hiện thông tin liên hệ admin (Zalo 0949908210 / chinhpv@gmail.com) khi user hết quyền.
- **Vai trò admin**: trường `is_admin` + RLS cho phép admin xem/cập nhật mọi `user_accounts`.

### Sửa / Tối ưu
- **Giảm ~5x chi phí gọi Claude**: gộp 5 lần gọi song song thành 1 lần trả về mảng. Counter trial chỉ tăng khi `is_session_start=true` (prefetch không tốn credit), khớp đúng spec "10 lần bài tập".

### Hạ tầng
- Migration `004_user_accounts_gating.sql`: bảng `user_accounts`, trigger auto-tạo khi đăng ký, RLS, RPC `is_admin()` và `increment_exercise_count()`.

---

## [0.1.0] — Trước 2026-04-26

Phiên bản gốc: app luyện toán lớp 3 với 53 chủ đề Cánh Diều, sinh đề bằng Claude Sonnet, hệ sao + streak, dashboard cho phụ huynh.
