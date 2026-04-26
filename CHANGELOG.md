# Changelog

Toán Vui — log các thay đổi giữa các phiên bản. Tuân theo [SemVer](https://semver.org/lang/vi/):
**MAJOR.MINOR.PATCH** = thay đổi phá tương thích · tính năng mới · sửa lỗi.

---

## [1.4.1] — 2026-04-26

### Thêm
- **Trang `/admin/notify`** — admin paste danh sách email + tiêu đề + nội dung → click Gửi. Dùng Gmail SMTP (nodemailer) + App Password lưu ở env `GMAIL_APP_PASSWORD` / `GMAIL_FROM`. Limit 200 email/lần gọi, 500/ngày (Gmail quota cá nhân).
- Link "Gửi mail" thêm vào navbar admin.

---

## [1.4.0] — 2026-04-26

**Đợt 5 — Đăng nhập bằng Google**

### Thêm
- **Google OAuth** trên trang `/login` và `/register`. Phụ huynh dùng Gmail click 1 nút là vào, không phải nhớ mật khẩu, đỡ spam đăng ký rác (Google đã verify email sẵn).
- **`/auth/callback`** route handler exchange code → session → điều hướng theo trạng thái: có `students` row → `/home`, chưa có → `/register/complete`.
- **`/register/complete`** trang hoàn tất hồ sơ bé (tên, biệt danh, lớp) cho user lần đầu login Google. Email/password user vẫn nhập trực tiếp ở `/register` như cũ.
- Component `GoogleSignInButton` dùng chung 2 trang (logo G màu Google chuẩn).

### Sửa
- Middleware allow `/auth/...` paths để OAuth callback chạy được trước khi có session cookie.

### Yêu cầu cấu hình
- Google Cloud Console: tạo OAuth Client (Web), thêm `https://<project>.supabase.co/auth/v1/callback` vào Authorized redirect URIs.
- Supabase Dashboard → Auth → Providers → Google: paste Client ID + Secret, toggle ON.
- App ở "Testing" status: phải thêm email vào Audience > Test users mới login Google được (cap 100 user).

---

## [1.3.11] — 2026-04-26

### Fix
- **504 timeout còn sót sau v1.3.10** ở topic prompt dài / Claude lag: lý do là 3 burst Promise.all **tuần tự** → mỗi burst đợi call chậm nhất, 3 burst cộng dồn dễ vượt 60s. Giờ **gộp 21 calls vào 1 Promise.all phẳng** → wall time = call chậm nhất duy nhất (~15-25s), không cộng dồn theo difficulty.
- Tag mỗi promise với `difficulty` để re-group sau khi Promise.all xong.
- Parallel-count `before` cho cả 3 difficulty ngay từ đầu (3 query cùng lúc thay vì tuần tự).

---

## [1.3.10] — 2026-04-26

### Fix / Tối ưu
- **Seed-bank `FUNCTION_INVOCATION_TIMEOUT (504)`**: v1.3.9 nâng cap lên 20 calls **tuần tự** → 60-80s, vượt `maxDuration=60`. Giờ chạy **song song** mỗi difficulty: 7 Claude calls cùng lúc qua `Promise.all` → ~5-8s/difficulty × 3 = ~15-25s tổng, an toàn dưới 60s.
- 7 calls × 5 câu = 35 candidates → sau dedup nội (~10-20% trùng) còn 28-32 unique → đủ đạt target=30 trong 1 lần seed cho phần lớn topic. Topic nào hụt vài câu, frontend filter `incomplete` sẽ tự retry ở lần "Seed all" sau.
- Bỏ `MAX_CALLS_PER_REQUEST` và `truncated` (không còn ý nghĩa khi mỗi difficulty là single-shot).
- Skip difficulty đã đủ kho (before ≥ target) — không gọi Claude phí.

---

## [1.3.9] — 2026-04-26

### Tối ưu
- **Seed-bank: 1 request seed xong cả 3 độ khó.** Trước v1.3.8 cap `MAX_CALLS_PER_REQUEST=12` chỉ vừa cho 2 difficulty (easy + medium = 12 calls), hard luôn `=0` → admin phải bấm Seed lần 2. Tăng cap lên **20** (6 calls/diff × 3 + 2 dự phòng dedup) và set explicit `maxDuration = 60` cho route — Hobby và Pro plan đều có 60s budget thay vì default 10/15s.

---

## [1.3.8] — 2026-04-26

### Fix
- **Bank seed `added=0` (root cause)**: Migration 006 bật RLS cho `exercise_bank` nhưng chỉ tạo policy SELECT, **không có policy INSERT/UPDATE/DELETE**. Hậu quả: mọi `upsert` từ `/api/admin/seed-bank` bị Postgres âm thầm filter bởi RLS, return `count=0` → kho luôn 0 câu dù parser, prompt, model, version đều đúng. Migration `009_exercise_bank_admin_write.sql` thêm 3 policy cho admin.
- **Insert count đáng tin**: bỏ phụ thuộc vào `count: "exact"` (không ổn định khi `ignoreDuplicates: true`), thay bằng `.select("id")` rồi đếm `data.length`.

### Thêm
- Response `/api/admin/seed-bank` thêm field `parsed` (số câu parser trả ra trước khi insert) bên cạnh `added` (số rows thực sự vào DB). Giúp tách bạch lỗi parser vs lỗi DB ngay từ Network tab.
- Bulk seed log hiển thị cảnh báo `⚠ parser=N nhưng insert=0` khi parser ra câu mà DB không nhận.

### Hành động cần làm
- Anh chạy migration `009_exercise_bank_admin_write.sql` trên Supabase Dashboard (SQL Editor), sau đó vào `/admin/bank` bấm "Seed tất cả" — phải thấy added > 0.

---

## [1.3.7] — 2026-04-26

### Debug
- Em test parser logic locally với raw response thực — **parser CHẠY ĐÚNG**, return 2/2 exercises hợp lệ. Vậy bug không ở parser. Bump version + thêm `parser_version` stamp để xác nhận Vercel deploy có thực sự dùng parser mới hay đang serve bundle cũ.

---

## [1.3.6] — 2026-04-26

### Debug
- Sửa `api_version` literal "1.3.4" → "1.3.6" (em quên update ở v1.3.5).
- Thêm `raw_length` (độ dài full response) và `raw_end` (300 ký tự cuối) vào response → biết rõ Haiku có bị truncate không, và nếu có thì cuối cùng dừng ở đâu.

---

## [1.3.5] — 2026-04-26

### Fix
- **Parser robust**: Haiku 4.5 trả JSON wrap trong ` ```json ... ``` ` markdown. Parser cũ thỉnh thoảng strip không sạch. Giờ extract array bằng cách **find first `[` và last `]`** — bỏ qua mọi wrapper / preamble / trailing prose. Có cả nhánh khôi phục response bị truncate (đóng array tại `},` cuối cùng).
- **max_tokens**: tăng lên 600/exercise (3000 cho batch 5) để Vietnamese hint dài không bị cắt.
- **raw_preview**: tăng lên 1500 ký tự để debug toàn bộ response.

---

## [1.3.4] — 2026-04-26

### Debug
- Thêm `api_version` stamp vào response `/api/admin/seed-bank` để dễ xác nhận deployment đã update.
- Force `raw_preview` luôn xuất hiện (null nếu không có call), tránh JSON omit silent.

---

## [1.3.3] — 2026-04-26

### Debug
- **`/api/admin/seed-bank`** trả thêm field `raw_preview` (500 ký tự đầu của response Claude lần đầu) khi parser ra 0 câu. Nhìn ở Network tab admin/bank để biết Haiku 4.5 đang trả về gì → fix triệt để.

---

## [1.3.2] — 2026-04-26

### Fix
- **Bank seed +0 câu**: parser quá khắt khe khi Claude (Haiku/Sonnet) trả về JSON kèm preamble (`Here's the array:...`) hoặc bọc trong object (`{exercises: [...]}`). Parser giờ extract array bằng regex fallback và unwrap `{exercises: ...}` tự động. Khi vẫn fail, log raw response 300 ký tự đầu lên Vercel logs để debug.
- **Seed-bank route**: log model + topic + difficulty khi gọi Claude fail, dễ tìm lỗi qua Vercel.

---

## [1.3.1] — 2026-04-26

### Fix
- **Migration 007**: bỏ apostrophe trong comment header (`we're` → `we are`) khiến Supabase Dashboard SQL Editor parse nhầm, báo `syntax error at or near "Medium"`. Anh phải re-paste Chunk A.

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
