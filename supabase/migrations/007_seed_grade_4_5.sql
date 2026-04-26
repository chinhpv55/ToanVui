-- ============================================================
-- Migration 007: Schema upgrade (level_tag) + curriculum L3 KNTT, L4 CD/KNTT
-- ============================================================
-- 1) Thêm enum level_tag_enum + cột curriculum_topics.level_tag
--    ('co_ban' = SGK chính thống, 'nang_cao' = đề luyện thi HSG / tư duy logic)
-- 2) Backfill level_tag = 'co_ban' cho mọi topic hiện có
-- 3) Cleanup + seed mới:
--    - Lớp 3 KNTT (Kết nối tri thức) — bộ song song với CD lớp 3
--    - Lớp 4 Cánh Diều
--    - Lớp 4 KNTT
-- ============================================================

-- ── Schema upgrade ──
DO $do$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'level_tag_enum') THEN
        CREATE TYPE level_tag_enum AS ENUM ('co_ban', 'nang_cao');
    END IF;
END
$do$;

ALTER TABLE curriculum_topics
    ADD COLUMN IF NOT EXISTS level_tag level_tag_enum NOT NULL DEFAULT 'co_ban';

CREATE INDEX IF NOT EXISTS idx_curriculum_level_tag ON curriculum_topics(level_tag);

-- ── Cleanup: only the rows we're about to seed ──
DELETE FROM curriculum_topics
 WHERE topic_code LIKE ANY (ARRAY['CD4-%', 'KN4-%', 'KN3-%']);

-- ============================================================
-- LỚP 3 — KẾT NỐI TRI THỨC
-- ============================================================
INSERT INTO curriculum_topics
    (subject, grade, series, semester, chapter_code, chapter_name, topic_code, topic_name, skill_type, week_suggestion, sort_order, ai_prompt_template, difficulty_levels, level_tag)
VALUES

-- Chủ đề 1: Ôn tập và bổ sung
('toan', 3, 'kntt', 1, 'C1', 'Ôn tập và bổ sung', 'KN3-C1-01', 'Ôn tập các số đến 1000', 'so_hoc', 1, 1,
 'Sinh bài tập về Ôn tập các số đến 1000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc, viết các số tròn chục, tròn trăm. Phân tích số thành hàng trăm, chục, đơn vị.
Medium: So sánh và sắp xếp số. Tìm số liền trước, liền sau. Viết số khi biết các hàng.
Hard: Tìm số thỏa điều kiện. Bài toán có lời văn về so sánh số.',
 '{"easy": "Đọc viết, phân tích hàng", "medium": "So sánh, sắp xếp, liền trước/sau", "hard": "Tìm số theo điều kiện"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C1', 'Ôn tập và bổ sung', 'KN3-C1-02', 'Ôn tập phép cộng, phép trừ trong phạm vi 1000', 'so_hoc', 1, 2,
 'Sinh bài tập về Phép cộng, trừ trong phạm vi 1000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Cộng, trừ không nhớ.
Medium: Cộng trừ có nhớ 1 lần. Tìm thành phần chưa biết.
Hard: Cộng trừ có nhớ 2 lần. Bài toán 2 bước.',
 '{"easy": "Không nhớ", "medium": "Có nhớ 1 lần, tìm x", "hard": "Có nhớ 2 lần, bài toán 2 bước"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C1', 'Ôn tập và bổ sung', 'KN3-C1-03', 'Tìm thành phần trong phép cộng, phép trừ', 'so_hoc', 2, 3,
 'Sinh bài tập về Tìm thành phần chưa biết trong phép cộng, phép trừ, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tìm x trong x + a = b hoặc x - a = b với số nhỏ.
Medium: Tìm x trong a - x = b. Số liệu trong phạm vi 1000.
Hard: Tìm x với 2 phép tính lồng nhau. Bài toán có lời văn.',
 '{"easy": "x + a = b dạng đơn giản", "medium": "a - x = b", "hard": "x với 2 phép tính"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C1', 'Ôn tập và bổ sung', 'KN3-C1-04', 'Ôn tập bảng nhân 2, 5; bảng chia 2, 5', 'so_hoc', 2, 4,
 'Sinh bài tập về bảng nhân 2, 5 và bảng chia 2, 5, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính kết quả phép nhân/chia trực tiếp trong bảng.
Medium: Tìm thừa số/số chia chưa biết. So sánh kết quả.
Hard: Bài toán có lời văn dùng bảng nhân/chia 2, 5.',
 '{"easy": "Tính trực tiếp", "medium": "Tìm thừa số chưa biết", "hard": "Bài toán lời văn"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C1', 'Ôn tập và bổ sung', 'KN3-C1-05', 'Bảng nhân 3, bảng chia 3', 'so_hoc', 3, 5,
 'Sinh bài tập về bảng nhân 3 và bảng chia 3, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính trực tiếp 3 × n và n : 3 trong bảng.
Medium: Tìm thừa số/số chia. Phép tính kết hợp.
Hard: Bài toán có lời văn về nhóm 3 đồ vật.',
 '{"easy": "Tính trực tiếp", "medium": "Tìm thừa số", "hard": "Bài toán nhóm 3"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C1', 'Ôn tập và bổ sung', 'KN3-C1-06', 'Bảng nhân 4, bảng chia 4', 'so_hoc', 3, 6,
 'Sinh bài tập về bảng nhân 4 và bảng chia 4, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính trực tiếp 4 × n và n : 4.
Medium: Tìm thừa số chưa biết. Bài toán đơn giản.
Hard: Bài toán có lời văn 1-2 bước dùng bảng 4.',
 '{"easy": "Tính trực tiếp", "medium": "Tìm thừa số", "hard": "Bài toán 1-2 bước"}'::jsonb, 'co_ban'),

-- Chủ đề 2: Bảng nhân, bảng chia
('toan', 3, 'kntt', 1, 'C2', 'Bảng nhân, bảng chia', 'KN3-C2-09', 'Bảng nhân 6, bảng chia 6', 'so_hoc', 4, 7,
 'Sinh bài tập về bảng nhân 6 và bảng chia 6, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính 6 × n và n : 6.
Medium: Tìm thừa số. Phép tính kết hợp đơn giản.
Hard: Bài toán có lời văn dùng bảng 6.',
 '{"easy": "Tính trực tiếp", "medium": "Tìm thừa số", "hard": "Bài toán lời văn"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C2', 'Bảng nhân, bảng chia', 'KN3-C2-10', 'Bảng nhân 7, bảng chia 7', 'so_hoc', 5, 8,
 'Sinh bài tập về bảng nhân 7 và bảng chia 7, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính 7 × n và n : 7.
Medium: Tìm thừa số. Phép tính nối tiếp.
Hard: Bài toán có lời văn về tuần (7 ngày).',
 '{"easy": "Tính trực tiếp", "medium": "Tìm thừa số", "hard": "Bài toán về tuần"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C2', 'Bảng nhân, bảng chia', 'KN3-C2-11', 'Bảng nhân 8, bảng chia 8', 'so_hoc', 5, 9,
 'Sinh bài tập về bảng nhân 8 và bảng chia 8, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính 8 × n và n : 8.
Medium: Tìm thừa số. So sánh kết quả.
Hard: Bài toán có lời văn 1-2 bước.',
 '{"easy": "Tính trực tiếp", "medium": "Tìm thừa số", "hard": "Bài toán 1-2 bước"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C2', 'Bảng nhân, bảng chia', 'KN3-C2-12', 'Bảng nhân 9, bảng chia 9', 'so_hoc', 6, 10,
 'Sinh bài tập về bảng nhân 9 và bảng chia 9, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính 9 × n và n : 9.
Medium: Tìm thừa số. Mẹo cộng chữ số = 9.
Hard: Bài toán có lời văn dùng bảng 9.',
 '{"easy": "Tính trực tiếp", "medium": "Tìm thừa số, mẹo 9", "hard": "Bài toán lời văn"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C2', 'Bảng nhân, bảng chia', 'KN3-C2-13', 'Tìm thành phần trong phép nhân, phép chia', 'so_hoc', 6, 11,
 'Sinh bài tập về Tìm thành phần chưa biết trong phép nhân, phép chia, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tìm x trong x × a = b với số nhỏ.
Medium: Tìm x trong a × x = b, x : a = b, a : x = b.
Hard: Bài toán có lời văn yêu cầu tìm thành phần.',
 '{"easy": "x × a = b số nhỏ", "medium": "x : a = b, a : x = b", "hard": "Bài toán lời văn"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C2', 'Bảng nhân, bảng chia', 'KN3-C2-14', 'Một phần mấy', 'so_hoc', 7, 12,
 'Sinh bài tập về Một phần mấy (1/2, 1/3, 1/4, 1/5...), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết hình đã tô 1/2, 1/3, 1/4. Tìm 1/N của một số chia hết.
Medium: Tìm 1/N của một số. So sánh phần.
Hard: Bài toán có lời văn về chia phần.',
 '{"easy": "Nhận biết phần, chia hết", "medium": "Tìm 1/N, so sánh", "hard": "Bài toán chia phần"}'::jsonb, 'co_ban'),

-- Chủ đề 3: Hình phẳng, hình khối
('toan', 3, 'kntt', 1, 'C3', 'Hình phẳng, hình khối', 'KN3-C3-16', 'Điểm ở giữa, trung điểm của đoạn thẳng', 'hinh_hoc', 7, 13,
 'Sinh bài tập về Điểm ở giữa, trung điểm của đoạn thẳng, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết điểm nằm giữa 2 điểm. Đọc tên trung điểm trong hình.
Medium: Tìm trung điểm khi biết tọa độ/độ dài. Đếm trung điểm trong hình phức tạp.
Hard: Bài toán có lời văn về đoạn thẳng và trung điểm.',
 '{"easy": "Nhận biết điểm giữa", "medium": "Tìm trung điểm", "hard": "Bài toán đoạn thẳng"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C3', 'Hình phẳng, hình khối', 'KN3-C3-17', 'Hình tròn, tâm, bán kính, đường kính', 'hinh_hoc', 8, 14,
 'Sinh bài tập về Hình tròn (tâm, bán kính, đường kính), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết tâm, bán kính, đường kính.
Medium: Tính bán kính khi biết đường kính (chia 2) và ngược lại.
Hard: Bài toán có lời văn về hình tròn (bánh xe, đồng hồ).',
 '{"easy": "Nhận biết tâm/bán kính/đường kính", "medium": "Tính bán kính/đường kính", "hard": "Bài toán bánh xe, đồng hồ"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C3', 'Hình phẳng, hình khối', 'KN3-C3-18', 'Hình vuông, hình chữ nhật', 'hinh_hoc', 8, 15,
 'Sinh bài tập về Hình vuông, hình chữ nhật, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết hình vuông, hình chữ nhật.
Medium: Đếm số hình trong hình phức tạp. Đếm cạnh, đỉnh.
Hard: Phân biệt với các hình khác. Bài toán xếp hình.',
 '{"easy": "Nhận biết", "medium": "Đếm số hình, cạnh, đỉnh", "hard": "Bài toán xếp hình"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C3', 'Hình phẳng, hình khối', 'KN3-C3-21', 'Khối lập phương, khối hộp chữ nhật', 'hinh_hoc', 9, 16,
 'Sinh bài tập về Khối lập phương, khối hộp chữ nhật, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết khối lập phương, khối hộp chữ nhật. Đếm mặt, cạnh, đỉnh.
Medium: So sánh đặc điểm 2 khối. Bài toán đếm khối nhỏ trong khối lớn.
Hard: Bài toán xếp khối, đếm tổng số khối nhỏ.',
 '{"easy": "Nhận biết, đếm mặt/cạnh/đỉnh", "medium": "So sánh, đếm khối", "hard": "Bài toán xếp khối"}'::jsonb, 'co_ban'),

-- Chủ đề 4: Phép nhân, chia trong 100
('toan', 3, 'kntt', 1, 'C4', 'Phép nhân, chia trong 100', 'KN3-C4-23', 'Nhân số có hai chữ số với số có một chữ số', 'so_hoc', 10, 17,
 'Sinh bài tập về Nhân số có 2 chữ số với số có 1 chữ số (kết quả ≤ 100), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhân không nhớ (12 × 3, 21 × 4...).
Medium: Nhân có nhớ 1 lần. Tìm thừa số.
Hard: Bài toán có lời văn 1-2 bước.',
 '{"easy": "Nhân không nhớ", "medium": "Có nhớ 1 lần, tìm thừa số", "hard": "Bài toán 1-2 bước"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C4', 'Phép nhân, chia trong 100', 'KN3-C4-24', 'Gấp một số lên một số lần', 'so_hoc', 10, 18,
 'Sinh bài tập về Gấp một số lên một số lần (a gấp b lần), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tìm số khi biết a gấp b lần (a × b).
Medium: So sánh "gấp lên" với "thêm". Số liệu trong phạm vi 100.
Hard: Bài toán có lời văn 2 bước về gấp lên.',
 '{"easy": "Tìm số gấp lên", "medium": "Phân biệt gấp/thêm", "hard": "Bài toán 2 bước"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C4', 'Phép nhân, chia trong 100', 'KN3-C4-25', 'Phép chia hết, phép chia có dư', 'so_hoc', 11, 19,
 'Sinh bài tập về Phép chia hết, chia có dư trong phạm vi 100, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Phân biệt chia hết và chia có dư. Tìm số dư.
Medium: Tìm số bị chia khi biết thương và dư. Tìm số chia.
Hard: Bài toán có lời văn về chia phần (có thừa).',
 '{"easy": "Phân biệt, tìm dư", "medium": "Tìm số bị chia/số chia", "hard": "Bài toán chia phần thừa"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C4', 'Phép nhân, chia trong 100', 'KN3-C4-26', 'Chia số có hai chữ số cho số có một chữ số', 'so_hoc', 11, 20,
 'Sinh bài tập về Chia số có 2 chữ số cho số 1 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Chia hết (54 : 6, 72 : 8...).
Medium: Chia có dư. Đặt tính dọc.
Hard: Bài toán có lời văn 2 bước.',
 '{"easy": "Chia hết", "medium": "Chia có dư, đặt tính", "hard": "Bài toán 2 bước"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C4', 'Phép nhân, chia trong 100', 'KN3-C4-27', 'Giảm một số đi một số lần', 'so_hoc', 12, 21,
 'Sinh bài tập về Giảm một số đi một số lần (a giảm b lần = a : b), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tìm số khi biết a giảm b lần.
Medium: Phân biệt "giảm đi" với "bớt". So sánh.
Hard: Bài toán có lời văn 2 bước.',
 '{"easy": "Tìm số giảm đi", "medium": "Phân biệt giảm/bớt", "hard": "Bài toán 2 bước"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C4', 'Phép nhân, chia trong 100', 'KN3-C4-28', 'Bài toán giải bằng hai bước tính', 'so_hoc', 12, 22,
 'Sinh bài tập về Bài toán giải bằng 2 bước tính, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Bài toán 2 bước với số nhỏ (cộng-nhân, trừ-chia).
Medium: Kết hợp 4 phép tính. Số liệu trong phạm vi 100.
Hard: Bài toán có ngữ cảnh thực tế (mua bán, nhóm/xếp).',
 '{"easy": "2 bước số nhỏ", "medium": "Kết hợp 4 phép tính", "hard": "Bài toán thực tế"}'::jsonb, 'co_ban'),

-- Chủ đề 5: Đo đại lượng
('toan', 3, 'kntt', 1, 'C5', 'Đơn vị đo đại lượng', 'KN3-C5-30', 'Mi-li-mét (mm)', 'do_luong', 13, 23,
 'Sinh bài tập về đơn vị đo độ dài Mi-li-mét, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: 1 cm = 10 mm. Đổi cm sang mm tròn.
Medium: Đổi đa bước (3 cm 5 mm = ? mm). So sánh độ dài.
Hard: Bài toán có lời văn về đo vật nhỏ (bút, kim).',
 '{"easy": "1 cm = 10 mm tròn", "medium": "Đổi đa bước, so sánh", "hard": "Bài toán đo vật nhỏ"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C5', 'Đơn vị đo đại lượng', 'KN3-C5-31', 'Gam (g)', 'do_luong', 13, 24,
 'Sinh bài tập về đơn vị đo khối lượng Gam, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: 1 kg = 1000 g. Đổi kg sang g tròn.
Medium: Đổi đa bước (2 kg 500 g). Cộng/trừ khối lượng.
Hard: Bài toán có lời văn về cân nặng đồ vật.',
 '{"easy": "1 kg = 1000 g tròn", "medium": "Đổi đa bước, cộng trừ", "hard": "Bài toán cân nặng"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C5', 'Đơn vị đo đại lượng', 'KN3-C5-32', 'Mi-li-lít (ml)', 'do_luong', 14, 25,
 'Sinh bài tập về đơn vị đo dung tích Mi-li-lít, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: 1 lít = 1000 ml. Đổi lít sang ml tròn.
Medium: Đổi đa bước. Cộng/trừ dung tích.
Hard: Bài toán có lời văn về dung tích chai, bình.',
 '{"easy": "1 lít = 1000 ml tròn", "medium": "Đổi đa bước, cộng trừ", "hard": "Bài toán chai bình"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C5', 'Đơn vị đo đại lượng', 'KN3-C5-33', 'Nhiệt độ. Đơn vị đo nhiệt độ (°C)', 'do_luong', 14, 26,
 'Sinh bài tập về Nhiệt độ và đơn vị đo °C, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc nhiệt độ trên nhiệt kế. So sánh nóng/lạnh.
Medium: Tính chênh lệch nhiệt độ. Cộng/trừ nhiệt độ.
Hard: Bài toán có lời văn về thời tiết, nhiệt độ cơ thể.',
 '{"easy": "Đọc nhiệt kế, so sánh", "medium": "Chênh lệch nhiệt độ", "hard": "Bài toán thời tiết"}'::jsonb, 'co_ban'),

-- Chủ đề 6: Phép nhân, chia trong 1000
('toan', 3, 'kntt', 1, 'C6', 'Phép nhân, chia trong 1000', 'KN3-C6-36', 'Nhân số có ba chữ số với số có một chữ số', 'so_hoc', 15, 27,
 'Sinh bài tập về Nhân số có 3 chữ số với số 1 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhân không nhớ (213 × 3).
Medium: Nhân có nhớ 1 lần.
Hard: Nhân có nhớ 2 lần. Bài toán có lời văn.',
 '{"easy": "Không nhớ", "medium": "Có nhớ 1 lần", "hard": "Có nhớ 2 lần, bài toán"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C6', 'Phép nhân, chia trong 1000', 'KN3-C6-37', 'Chia số có ba chữ số cho số có một chữ số', 'so_hoc', 15, 28,
 'Sinh bài tập về Chia số có 3 chữ số cho số 1 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Chia hết.
Medium: Chia có dư. Thương có 2 chữ số.
Hard: Bài toán có lời văn 2 bước.',
 '{"easy": "Chia hết", "medium": "Chia có dư", "hard": "Bài toán 2 bước"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 1, 'C6', 'Phép nhân, chia trong 1000', 'KN3-C6-38', 'Biểu thức số. Tính giá trị biểu thức', 'bieu_thuc', 16, 29,
 'Sinh bài tập về Biểu thức số (tính giá trị biểu thức có +, -, ×, ÷, dấu ngoặc), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Biểu thức có 2 phép tính cùng cấp (a + b - c, a × b : c).
Medium: Biểu thức có 2 phép khác cấp (nhân/chia trước, cộng/trừ sau). Số liệu trong phạm vi 1000.
Hard: Biểu thức có dấu ngoặc đơn. Bài toán có lời văn.',
 '{"easy": "2 phép cùng cấp", "medium": "Khác cấp, ưu tiên ×÷", "hard": "Có ngoặc, bài toán"}'::jsonb, 'co_ban'),

-- Tập 2 — Chủ đề 8: Số đến 10 000
('toan', 3, 'kntt', 2, 'C8', 'Các số đến 10 000', 'KN3-C8-45', 'Các số có bốn chữ số. Số 10 000', 'so_hoc', 19, 30,
 'Sinh bài tập về Các số có 4 chữ số (đến 10 000), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc, viết số 4 chữ số.
Medium: Phân tích thành nghìn, trăm, chục, đơn vị. Số liền trước/sau.
Hard: Tìm số thỏa điều kiện. Bài toán có lời văn.',
 '{"easy": "Đọc viết 4 chữ số", "medium": "Phân tích, liền trước/sau", "hard": "Tìm theo điều kiện"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 2, 'C8', 'Các số đến 10 000', 'KN3-C8-46', 'So sánh các số trong phạm vi 10 000', 'so_hoc', 19, 31,
 'Sinh bài tập về So sánh số trong phạm vi 10 000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: So sánh 2 số 4 chữ số.
Medium: Sắp xếp 3-4 số. Tìm số lớn nhất/nhỏ nhất.
Hard: Tìm chữ số còn thiếu để thỏa bất đẳng thức.',
 '{"easy": "So sánh 2 số", "medium": "Sắp xếp, tìm max/min", "hard": "Chữ số thiếu"}'::jsonb, 'co_ban'),

-- Tập 2 — Chủ đề 9: Chu vi, diện tích
('toan', 3, 'kntt', 2, 'C9', 'Chu vi, diện tích', 'KN3-C9-50', 'Chu vi hình chữ nhật, hình vuông', 'hinh_hoc', 20, 32,
 'Sinh bài tập về Chu vi hình chữ nhật, hình vuông, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính chu vi khi biết các cạnh (số nguyên).
Medium: Tìm cạnh khi biết chu vi. Bài toán đơn vị đo (cm, m).
Hard: Bài toán có lời văn về hàng rào, viền tranh.',
 '{"easy": "Tính chu vi từ cạnh", "medium": "Tìm cạnh từ chu vi", "hard": "Bài toán hàng rào"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 2, 'C9', 'Chu vi, diện tích', 'KN3-C9-52', 'Diện tích hình chữ nhật, hình vuông', 'hinh_hoc', 21, 33,
 'Sinh bài tập về Diện tích hình chữ nhật, hình vuông (đơn vị cm²), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính diện tích khi biết các cạnh.
Medium: Tìm cạnh khi biết diện tích. So sánh diện tích 2 hình.
Hard: Bài toán có lời văn về lát gạch, sơn tường.',
 '{"easy": "Tính diện tích", "medium": "Tìm cạnh, so sánh", "hard": "Bài toán lát gạch"}'::jsonb, 'co_ban'),

-- Tập 2 — Chủ đề 10: +, -, ×, ÷ trong 10 000
('toan', 3, 'kntt', 2, 'C10', 'Cộng, trừ, nhân, chia trong 10 000', 'KN3-C10-54', 'Phép cộng trong phạm vi 10 000', 'so_hoc', 22, 34,
 'Sinh bài tập về Phép cộng trong phạm vi 10 000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Cộng không nhớ.
Medium: Cộng có nhớ 1-2 lần.
Hard: Cộng có nhớ 3 lần. Bài toán 2 bước.',
 '{"easy": "Không nhớ", "medium": "Có nhớ 1-2 lần", "hard": "Có nhớ 3 lần, 2 bước"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 2, 'C10', 'Cộng, trừ, nhân, chia trong 10 000', 'KN3-C10-55', 'Phép trừ trong phạm vi 10 000', 'so_hoc', 22, 35,
 'Sinh bài tập về Phép trừ trong phạm vi 10 000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Trừ không nhớ.
Medium: Trừ có nhớ 1-2 lần.
Hard: Trừ có nhớ 3 lần. Bài toán 2 bước.',
 '{"easy": "Không nhớ", "medium": "Có nhớ 1-2 lần", "hard": "Có nhớ 3 lần, 2 bước"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 2, 'C10', 'Cộng, trừ, nhân, chia trong 10 000', 'KN3-C10-56', 'Nhân số có bốn chữ số với số có một chữ số', 'so_hoc', 23, 36,
 'Sinh bài tập về Nhân số 4 chữ số với số 1 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhân không nhớ.
Medium: Nhân có nhớ 1-2 lần.
Hard: Nhân có nhớ 3 lần. Bài toán có lời văn.',
 '{"easy": "Không nhớ", "medium": "Có nhớ 1-2 lần", "hard": "Có nhớ 3 lần, bài toán"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 2, 'C10', 'Cộng, trừ, nhân, chia trong 10 000', 'KN3-C10-57', 'Chia số có bốn chữ số cho số có một chữ số', 'so_hoc', 23, 37,
 'Sinh bài tập về Chia số 4 chữ số cho số 1 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Chia hết.
Medium: Chia có dư.
Hard: Thương có chữ số 0. Bài toán có lời văn.',
 '{"easy": "Chia hết", "medium": "Chia có dư", "hard": "Thương có 0, bài toán"}'::jsonb, 'co_ban'),

-- Chủ đề 11: Số đến 100 000
('toan', 3, 'kntt', 2, 'C11', 'Các số đến 100 000', 'KN3-C11-59', 'Các số có năm chữ số. Số 100 000', 'so_hoc', 25, 38,
 'Sinh bài tập về Số 5 chữ số (đến 100 000), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc, viết số 5 chữ số.
Medium: Phân tích thành chục nghìn, nghìn, trăm, chục, đơn vị.
Hard: Tìm số thỏa điều kiện. Bài toán có lời văn.',
 '{"easy": "Đọc viết", "medium": "Phân tích hàng", "hard": "Tìm theo điều kiện"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 2, 'C11', 'Các số đến 100 000', 'KN3-C11-60', 'So sánh các số trong phạm vi 100 000', 'so_hoc', 25, 39,
 'Sinh bài tập về So sánh số trong phạm vi 100 000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: So sánh 2 số.
Medium: Sắp xếp 3-5 số.
Hard: Tìm chữ số còn thiếu trong bất đẳng thức.',
 '{"easy": "So sánh 2 số", "medium": "Sắp xếp 3-5 số", "hard": "Chữ số thiếu"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 2, 'C11', 'Các số đến 100 000', 'KN3-C11-61', 'Làm tròn số đến hàng nghìn, hàng chục nghìn', 'so_hoc', 26, 40,
 'Sinh bài tập về Làm tròn đến hàng nghìn, chục nghìn, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Làm tròn đến hàng chục, trăm.
Medium: Làm tròn đến hàng nghìn, chục nghìn.
Hard: Bài toán ước lượng. So sánh sau làm tròn.',
 '{"easy": "Tròn đến chục/trăm", "medium": "Tròn đến nghìn/chục nghìn", "hard": "Ước lượng"}'::jsonb, 'co_ban'),

-- Chủ đề 13: Đồng hồ, lịch, tiền VN
('toan', 3, 'kntt', 2, 'C13', 'Thời gian, tiền', 'KN3-C13-66', 'Xem đồng hồ. Tháng - năm', 'do_luong', 28, 41,
 'Sinh bài tập về Xem đồng hồ và Tháng - năm, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc giờ trên đồng hồ chỉ giờ + phút (5 phút). Đếm tháng có 30/31 ngày.
Medium: Tính khoảng thời gian. Đổi giờ-phút.
Hard: Bài toán có lời văn về thời gian biểu, lịch.',
 '{"easy": "Đọc giờ, đếm ngày trong tháng", "medium": "Tính khoảng, đổi giờ-phút", "hard": "Bài toán thời gian biểu"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 2, 'C13', 'Thời gian, tiền', 'KN3-C13-68', 'Tiền Việt Nam', 'do_luong', 29, 42,
 'Sinh bài tập về Tiền Việt Nam (đồng), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết các mệnh giá tiền (1000, 2000, 5000, 10000, 20000, 50000).
Medium: Tính tổng/đổi tiền (đổi 50 000 = mấy tờ 10 000).
Hard: Bài toán có lời văn về mua hàng và tính tiền thừa.',
 '{"easy": "Nhận biết mệnh giá", "medium": "Tổng, đổi tiền", "hard": "Bài toán mua hàng"}'::jsonb, 'co_ban'),

-- Chủ đề 14: Nhân chia trong 100 000
('toan', 3, 'kntt', 2, 'C14', 'Nhân, chia trong 100 000', 'KN3-C14-70', 'Nhân số có năm chữ số với số có một chữ số', 'so_hoc', 30, 43,
 'Sinh bài tập về Nhân số 5 chữ số với số 1 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhân không nhớ.
Medium: Nhân có nhớ 1-2 lần.
Hard: Nhân có nhớ 3 lần. Bài toán lời văn.',
 '{"easy": "Không nhớ", "medium": "Có nhớ 1-2 lần", "hard": "Có nhớ 3 lần, bài toán"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 2, 'C14', 'Nhân, chia trong 100 000', 'KN3-C14-71', 'Chia số có năm chữ số cho số có một chữ số', 'so_hoc', 31, 44,
 'Sinh bài tập về Chia số 5 chữ số cho số 1 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Chia hết.
Medium: Chia có dư.
Hard: Bài toán có lời văn 2 bước.',
 '{"easy": "Chia hết", "medium": "Chia có dư", "hard": "Bài toán 2 bước"}'::jsonb, 'co_ban'),

-- Chủ đề 15: Thống kê, xác suất
('toan', 3, 'kntt', 2, 'C15', 'Thống kê, xác suất', 'KN3-C15-75', 'Bảng số liệu thống kê', 'thong_ke', 32, 45,
 'Sinh bài tập về Bảng số liệu thống kê, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc số liệu từ bảng đơn giản. Tìm giá trị lớn nhất/nhỏ nhất.
Medium: Tính tổng, hiệu các cột. So sánh dòng.
Hard: Bài toán có lời văn dựa trên bảng (mua bán, điểm số).',
 '{"easy": "Đọc bảng, max/min", "medium": "Tổng, hiệu, so sánh", "hard": "Bài toán từ bảng"}'::jsonb, 'co_ban'),

('toan', 3, 'kntt', 2, 'C15', 'Thống kê, xác suất', 'KN3-C15-76', 'Khả năng xảy ra của một sự kiện', 'thong_ke', 32, 46,
 'Sinh bài tập về Khả năng xảy ra của sự kiện (chắc chắn / có thể / không thể), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Phân biệt 3 mức độ với tình huống đơn giản.
Medium: So sánh khả năng giữa 2 sự kiện.
Hard: Bài toán có ngữ cảnh phức tạp (rút thẻ, tung xúc xắc).',
 '{"easy": "3 mức độ đơn giản", "medium": "So sánh 2 sự kiện", "hard": "Rút thẻ, xúc xắc"}'::jsonb, 'co_ban');

-- ============================================================
-- LỚP 4 — CÁNH DIỀU
-- ============================================================
INSERT INTO curriculum_topics
    (subject, grade, series, semester, chapter_code, chapter_name, topic_code, topic_name, skill_type, week_suggestion, sort_order, ai_prompt_template, difficulty_levels, level_tag)
VALUES

-- Phần I: Số tự nhiên
('toan', 4, 'canh_dieu', 1, 'P1', 'Số tự nhiên', 'CD4-P1-04', 'Các số trong phạm vi 1 000 000', 'so_hoc', 1, 1,
 'Sinh bài tập về Các số trong phạm vi 1 000 000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc, viết các số tròn nghìn, tròn chục nghìn. Phân tích thành hàng trăm nghìn, chục nghìn, nghìn, trăm, chục, đơn vị.
Medium: Viết số khi biết các hàng. Tìm số liền trước, liền sau. So sánh.
Hard: Tìm số thỏa điều kiện. Bài toán lời văn (dân số, doanh thu).',
 '{"easy": "Đọc viết tròn, phân tích hàng", "medium": "Viết từ hàng, so sánh", "hard": "Tìm theo điều kiện"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P1', 'Số tự nhiên', 'CD4-P1-06', 'Các số có nhiều chữ số (đến hàng triệu)', 'so_hoc', 2, 2,
 'Sinh bài tập về Các số có nhiều chữ số đến hàng triệu, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc, viết số 6-7 chữ số. Giá trị chữ số ở mỗi hàng.
Medium: Phân tích thành tổng các hàng. So sánh.
Hard: Tìm số lớn/nhỏ nhất 7 chữ số thỏa điều kiện. Bài toán dân số.',
 '{"easy": "Đọc viết, giá trị chữ số", "medium": "Phân tích, so sánh", "hard": "Tìm theo điều kiện"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P1', 'Số tự nhiên', 'CD4-P1-09', 'So sánh các số có nhiều chữ số', 'so_hoc', 3, 3,
 'Sinh bài tập về So sánh số có nhiều chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: So sánh 2 số bằng <, >, =.
Medium: Sắp xếp 4-5 số. Tìm chữ số còn thiếu trong bất đẳng thức.
Hard: Bài toán so sánh dữ liệu thực tế (dân số, sản lượng).',
 '{"easy": "So sánh 2 số", "medium": "Sắp xếp, chữ số thiếu", "hard": "Bài toán dữ liệu"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P1', 'Số tự nhiên', 'CD4-P1-10', 'Làm tròn số đến hàng trăm nghìn', 'so_hoc', 3, 4,
 'Sinh bài tập về Làm tròn số đến hàng trăm nghìn, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Làm tròn đến hàng chục, trăm, nghìn.
Medium: Làm tròn đến chục nghìn, trăm nghìn. Quy tắc lên/xuống.
Hard: Bài toán ước lượng. So sánh sau làm tròn.',
 '{"easy": "Tròn đến chục/trăm/nghìn", "medium": "Tròn lớn, lên/xuống", "hard": "Ước lượng thực tế"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P1', 'Số tự nhiên', 'CD4-P1-12', 'Số tự nhiên. Dãy số tự nhiên', 'so_hoc', 4, 5,
 'Sinh bài tập về Số tự nhiên và dãy số tự nhiên, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết dãy STN. Liền trước, liền sau.
Medium: Đếm số tự nhiên trong khoảng. Số chẵn/lẻ.
Hard: Tìm STN thỏa nhiều điều kiện. Đếm trong khoảng lớn.',
 '{"easy": "Liền trước/sau", "medium": "Đếm khoảng, chẵn/lẻ", "hard": "Nhiều điều kiện"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P1', 'Số tự nhiên', 'CD4-P1-13', 'Viết số tự nhiên trong hệ thập phân', 'so_hoc', 4, 6,
 'Sinh bài tập về Viết số tự nhiên trong hệ thập phân, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Viết số khi biết các hàng.
Medium: Phân tích thành tổng các hàng (35 421 = 30 000 + 5 000 + 400 + 20 + 1).
Hard: Số có cấu tạo đặc biệt (hàng X gấp đôi hàng Y).',
 '{"easy": "Viết từ hàng", "medium": "Phân tích thành tổng", "hard": "Cấu tạo đặc biệt"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P1', 'Số tự nhiên', 'CD4-P1-14', 'Yến, tạ, tấn', 'do_luong', 5, 7,
 'Sinh bài tập về đơn vị đo khối lượng Yến, tạ, tấn, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: 1 yến = 10 kg, 1 tạ = 100 kg, 1 tấn = 1000 kg. Đổi đơn giản.
Medium: Đổi đa bước (3 tấn 5 tạ = ? kg). So sánh đại lượng.
Hard: Bài toán xe tải, gạo, nông sản với số liệu lớn.',
 '{"easy": "Đổi đơn giản", "medium": "Đa bước, so sánh", "hard": "Bài toán thực tế"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P1', 'Số tự nhiên', 'CD4-P1-15', 'Giây', 'do_luong', 5, 8,
 'Sinh bài tập về đơn vị đo thời gian Giây, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: 1 phút = 60 giây. Đổi tròn.
Medium: Đổi đa bước (2 phút 30 giây = ? giây). So sánh thời gian.
Hard: Bài toán chạy bộ, video, phản ứng.',
 '{"easy": "60 giây = 1 phút", "medium": "Đa bước, so sánh", "hard": "Bài toán thực tế"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P1', 'Số tự nhiên', 'CD4-P1-16', 'Thế kỉ', 'do_luong', 6, 9,
 'Sinh bài tập về đơn vị Thế kỉ (1 thế kỉ = 100 năm, thế kỉ XXI: 2001-2100), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Năm X thuộc thế kỉ nào.
Medium: Năm Y cách bây giờ bao nhiêu năm/thế kỉ.
Hard: Bài toán lịch sử VN (Hai Bà Trưng, Lý Công Uẩn, Quang Trung).',
 '{"easy": "Năm X thế kỉ nào", "medium": "Cách bây giờ", "hard": "Lịch sử VN"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P1', 'Số tự nhiên', 'CD4-P1-17', 'Bài toán liên quan đến rút về đơn vị', 'so_hoc', 6, 10,
 'Sinh bài tập về Bài toán rút về đơn vị, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: 1 bước (biết giá N quyển → giá 1 quyển → giá M quyển).
Medium: 2 bước rút về đơn vị (mua, bán, đổi).
Hard: Nhiều bước, kết hợp so sánh / tổng.',
 '{"easy": "1 bước", "medium": "2 bước rút về đơn vị", "hard": "Nhiều bước"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P1', 'Số tự nhiên', 'CD4-P1-19', 'Góc nhọn, góc tù, góc bẹt', 'hinh_hoc', 7, 11,
 'Sinh bài tập về Phân loại góc (nhọn < 90°, vuông = 90°, tù > 90°, bẹt = 180°), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết loại góc qua hình.
Medium: Đếm số góc mỗi loại trong hình phức tạp.
Hard: Bài toán xếp hình, xác định góc theo điều kiện.',
 '{"easy": "Nhận biết loại góc", "medium": "Đếm góc trong hình", "hard": "Xác định theo điều kiện"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P1', 'Số tự nhiên', 'CD4-P1-20', 'Đơn vị đo góc. Độ (°)', 'hinh_hoc', 7, 12,
 'Sinh bài tập về Đơn vị đo góc Độ, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc số đo góc trên thước đo độ.
Medium: Tính tổng/hiệu các góc. So sánh góc.
Hard: Bài toán hình học liên quan đến góc.',
 '{"easy": "Đọc số đo", "medium": "Tổng/hiệu góc", "hard": "Bài toán hình"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P1', 'Số tự nhiên', 'CD4-P1-21', 'Hai đường thẳng vuông góc', 'hinh_hoc', 8, 13,
 'Sinh bài tập về Hai đường thẳng vuông góc, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết 2 đường thẳng vuông góc trong hình.
Medium: Đếm các cặp đường thẳng vuông góc.
Hard: Bài toán xếp hình tạo đường vuông góc.',
 '{"easy": "Nhận biết", "medium": "Đếm cặp", "hard": "Bài toán xếp hình"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P1', 'Số tự nhiên', 'CD4-P1-22', 'Hai đường thẳng song song', 'hinh_hoc', 8, 14,
 'Sinh bài tập về Hai đường thẳng song song, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết 2 đường thẳng song song.
Medium: Đếm các cặp song song trong hình.
Hard: Bài toán nhận biết song song trong hình phức tạp.',
 '{"easy": "Nhận biết", "medium": "Đếm cặp", "hard": "Hình phức tạp"}'::jsonb, 'co_ban'),

-- Phần II: Phép tính với số tự nhiên
('toan', 4, 'canh_dieu', 1, 'P2', 'Phép tính với số tự nhiên', 'CD4-P2-26', 'Phép cộng, phép trừ các số có nhiều chữ số', 'so_hoc', 9, 15,
 'Sinh bài tập về Cộng, trừ số có nhiều chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Cộng, trừ không nhớ trong phạm vi 1 000 000.
Medium: Có nhớ 1-2 lần. Tìm thành phần chưa biết.
Hard: Có nhớ nhiều lần. Bài toán có lời văn 2 bước.',
 '{"easy": "Không nhớ", "medium": "Có nhớ 1-2 lần, tìm x", "hard": "Có nhớ nhiều, 2 bước"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P2', 'Phép tính với số tự nhiên', 'CD4-P2-27', 'Tính chất giao hoán, kết hợp của phép cộng', 'so_hoc', 9, 16,
 'Sinh bài tập về Tính chất giao hoán, kết hợp của phép cộng, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Áp dụng giao hoán đơn giản (a + b = b + a).
Medium: Kết hợp 3 số sao cho thuận lợi (gom thành tròn chục/trăm).
Hard: Tính nhanh nhiều số bằng cách kết hợp khéo.',
 '{"easy": "Giao hoán", "medium": "Kết hợp 3 số", "hard": "Tính nhanh nhiều số"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P2', 'Phép tính với số tự nhiên', 'CD4-P2-28', 'Tìm số trung bình cộng', 'so_hoc', 10, 17,
 'Sinh bài tập về Tìm số trung bình cộng, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tìm trung bình cộng của 2-3 số nhỏ.
Medium: Tìm trung bình của 4-5 số. Tìm 1 số khi biết trung bình.
Hard: Bài toán có lời văn (điểm thi, năng suất, lương).',
 '{"easy": "Trung bình 2-3 số", "medium": "4-5 số, tìm số thiếu", "hard": "Bài toán điểm/lương"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P2', 'Phép tính với số tự nhiên', 'CD4-P2-29', 'Tìm hai số khi biết tổng và hiệu', 'so_hoc', 10, 18,
 'Sinh bài tập về Tìm hai số khi biết tổng và hiệu, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tổng và hiệu nhỏ. Áp dụng công thức (Tổng + Hiệu) : 2 = Số lớn.
Medium: Tổng-hiệu trong phạm vi 100 000.
Hard: Bài toán có lời văn (tuổi, tiền, sản phẩm).',
 '{"easy": "Tổng-hiệu nhỏ", "medium": "Phạm vi 100 000", "hard": "Bài toán lời văn"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P2', 'Phép tính với số tự nhiên', 'CD4-P2-31', 'Nhân với số có một chữ số', 'so_hoc', 11, 19,
 'Sinh bài tập về Nhân số có nhiều chữ số với số 1 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhân không nhớ.
Medium: Có nhớ 1-2 lần.
Hard: Có nhớ nhiều lần. Bài toán có lời văn.',
 '{"easy": "Không nhớ", "medium": "Nhớ 1-2 lần", "hard": "Nhớ nhiều, bài toán"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P2', 'Phép tính với số tự nhiên', 'CD4-P2-32', 'Nhân với số có hai chữ số', 'so_hoc', 11, 20,
 'Sinh bài tập về Nhân với số có 2 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhân số có 2 chữ số với 2 chữ số (không nhớ).
Medium: Có nhớ. Đặt tính dọc đúng vị trí.
Hard: Bài toán có lời văn 2 bước.',
 '{"easy": "Không nhớ", "medium": "Có nhớ, đặt tính", "hard": "Bài toán 2 bước"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P2', 'Phép tính với số tự nhiên', 'CD4-P2-34', 'Tính chất giao hoán, kết hợp của phép nhân', 'so_hoc', 12, 21,
 'Sinh bài tập về Tính chất giao hoán, kết hợp của phép nhân, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Giao hoán đơn giản.
Medium: Kết hợp 3 số. Tính nhanh.
Hard: Tính nhanh tích nhiều số bằng cách kết hợp khéo.',
 '{"easy": "Giao hoán", "medium": "Kết hợp, tính nhanh", "hard": "Tích nhiều số"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P2', 'Phép tính với số tự nhiên', 'CD4-P2-36', 'Nhân với 10, 100, 1 000, ...', 'so_hoc', 12, 22,
 'Sinh bài tập về Nhân với 10, 100, 1000..., độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhân số nhỏ với 10, 100, 1000.
Medium: Nhân số có nhiều chữ số với 10, 100, 1000, 10 000.
Hard: Bài toán nhân hàng loạt với 10ⁿ.',
 '{"easy": "Số nhỏ × 10/100/1000", "medium": "Nhiều chữ số × 10ⁿ", "hard": "Hàng loạt"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P2', 'Phép tính với số tự nhiên', 'CD4-P2-38', 'Chia cho số có một chữ số', 'so_hoc', 13, 23,
 'Sinh bài tập về Chia số có nhiều chữ số cho số 1 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Chia hết.
Medium: Chia có dư. Đặt tính dọc.
Hard: Thương có chữ số 0. Bài toán lời văn.',
 '{"easy": "Chia hết", "medium": "Có dư, đặt tính", "hard": "Thương có 0, bài toán"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P2', 'Phép tính với số tự nhiên', 'CD4-P2-39', 'Chia cho 10, 100, 1 000, ...', 'so_hoc', 13, 24,
 'Sinh bài tập về Chia cho 10, 100, 1000..., độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Chia tròn cho 10, 100, 1000.
Medium: Có dư. Bài toán đổi đơn vị.
Hard: Bài toán có lời văn về quy đổi đại lượng.',
 '{"easy": "Chia tròn", "medium": "Có dư, đổi đơn vị", "hard": "Quy đổi đại lượng"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P2', 'Phép tính với số tự nhiên', 'CD4-P2-40', 'Chia cho số có hai chữ số', 'so_hoc', 14, 25,
 'Sinh bài tập về Chia cho số có 2 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Chia 3 chữ số cho 2 chữ số (chia hết).
Medium: Chia có dư. Thương có 1-2 chữ số.
Hard: Số bị chia có 4-5 chữ số. Bài toán có lời văn.',
 '{"easy": "Chia hết 3:2 chữ số", "medium": "Có dư, thương 1-2 chữ số", "hard": "Số bị chia lớn"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P2', 'Phép tính với số tự nhiên', 'CD4-P2-44', 'Thương có chữ số 0', 'so_hoc', 15, 26,
 'Sinh bài tập về Phép chia có thương chứa chữ số 0, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Chia hết, thương có 1 chữ số 0.
Medium: Có dư, thương có chữ số 0 ở giữa hoặc cuối.
Hard: Bài toán có lời văn 2 bước.',
 '{"easy": "1 chữ số 0", "medium": "0 ở giữa/cuối", "hard": "Bài toán 2 bước"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P2', 'Phép tính với số tự nhiên', 'CD4-P2-47', 'Ước lượng tính', 'so_hoc', 16, 27,
 'Sinh bài tập về Ước lượng tính (làm tròn rồi tính), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Ước lượng kết quả phép cộng/trừ bằng cách làm tròn.
Medium: Ước lượng phép nhân/chia.
Hard: Bài toán thực tế (chi phí mua sắm, năng suất).',
 '{"easy": "Cộng trừ ước lượng", "medium": "Nhân chia ước lượng", "hard": "Bài toán chi phí"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 1, 'P2', 'Phép tính với số tự nhiên', 'CD4-P2-49', 'Biểu thức có chứa chữ', 'bieu_thuc', 16, 28,
 'Sinh bài tập về Biểu thức có chứa chữ (ví dụ: a + 5, m × 3 - 2), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính giá trị biểu thức khi cho biết giá trị chữ.
Medium: Biểu thức 2 chữ. Tính với nhiều giá trị khác nhau.
Hard: Lập biểu thức từ tình huống. Tìm giá trị chữ thỏa điều kiện.',
 '{"easy": "Tính giá trị 1 chữ", "medium": "Biểu thức 2 chữ", "hard": "Lập biểu thức"}'::jsonb, 'co_ban'),

-- Phần III: Phân số
('toan', 4, 'canh_dieu', 2, 'P3', 'Phân số', 'CD4-P3-53', 'Khái niệm phân số', 'so_hoc', 19, 29,
 'Sinh bài tập về Khái niệm phân số (tử số, mẫu số), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết phân số. Đọc, viết phân số.
Medium: Tử số, mẫu số. Phân số bằng 1, lớn hơn 1, bé hơn 1.
Hard: Tìm phân số thỏa điều kiện. Bài toán chia bánh, hình.',
 '{"easy": "Nhận biết, đọc viết", "medium": "Tử/mẫu, so với 1", "hard": "Tìm theo điều kiện"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P3', 'Phân số', 'CD4-P3-55', 'Phân số và phép chia số tự nhiên', 'so_hoc', 19, 30,
 'Sinh bài tập về Phân số và phép chia số tự nhiên, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Viết phép chia thành phân số. Viết phân số thành phép chia.
Medium: So sánh phép chia có dư với phân số tương ứng.
Hard: Bài toán chia phần (chia bánh cho người).',
 '{"easy": "Đổi giữa chia và phân số", "medium": "So sánh chia có dư", "hard": "Bài toán chia phần"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P3', 'Phân số', 'CD4-P3-57', 'Phân số bằng nhau', 'so_hoc', 20, 31,
 'Sinh bài tập về Phân số bằng nhau, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết 2 phân số có bằng nhau không (qua nhân chéo).
Medium: Tìm tử/mẫu để 2 phân số bằng nhau.
Hard: Tìm 2-3 phân số bằng phân số cho trước.',
 '{"easy": "Nhận biết bằng nhau", "medium": "Tìm tử/mẫu thiếu", "hard": "Tìm nhiều phân số"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P3', 'Phân số', 'CD4-P3-58', 'Tính chất cơ bản của phân số', 'so_hoc', 20, 32,
 'Sinh bài tập về Tính chất cơ bản của phân số (nhân/chia tử và mẫu cho cùng số), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Áp dụng tính chất nhân tử-mẫu cho 2 hoặc 3.
Medium: Phối hợp nhân và chia. Tìm phân số tương đương.
Hard: Áp dụng tính chất để giải bài toán.',
 '{"easy": "Nhân tử-mẫu cho 2/3", "medium": "Nhân chia phối hợp", "hard": "Áp dụng giải bài"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P3', 'Phân số', 'CD4-P3-59', 'Rút gọn phân số', 'so_hoc', 21, 33,
 'Sinh bài tập về Rút gọn phân số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Rút gọn 1 lần (chia tử và mẫu cho ƯCLN nhỏ).
Medium: Rút gọn nhiều lần đến khi tối giản.
Hard: Rút gọn rồi so sánh hoặc tính.',
 '{"easy": "Rút 1 lần", "medium": "Tối giản nhiều lần", "hard": "Rút rồi tính"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P3', 'Phân số', 'CD4-P3-60', 'Quy đồng mẫu số các phân số', 'so_hoc', 21, 34,
 'Sinh bài tập về Quy đồng mẫu số các phân số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Quy đồng 2 phân số có mẫu là bội của nhau.
Medium: Quy đồng 2 phân số có mẫu nguyên tố cùng nhau (mẫu chung = tích).
Hard: Quy đồng 3 phân số. Tìm mẫu chung nhỏ nhất.',
 '{"easy": "Mẫu là bội", "medium": "Mẫu nguyên tố cùng nhau", "hard": "3 phân số"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P3', 'Phân số', 'CD4-P3-61', 'So sánh hai phân số cùng mẫu số', 'so_hoc', 22, 35,
 'Sinh bài tập về So sánh phân số cùng mẫu số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: So sánh 2 phân số.
Medium: Sắp xếp 3-4 phân số cùng mẫu.
Hard: Bài toán có lời văn (so sánh phần thức ăn, phần việc).',
 '{"easy": "So sánh 2 phân số", "medium": "Sắp xếp 3-4 phân số", "hard": "Bài toán phần"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P3', 'Phân số', 'CD4-P3-62', 'So sánh hai phân số khác mẫu số', 'so_hoc', 22, 36,
 'Sinh bài tập về So sánh phân số khác mẫu số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Quy đồng rồi so sánh 2 phân số.
Medium: Sắp xếp 3 phân số khác mẫu.
Hard: So sánh nhanh bằng so với 1, 1/2.',
 '{"easy": "Quy đồng rồi so sánh", "medium": "Sắp xếp 3 phân số", "hard": "So sánh nhanh"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P3', 'Phân số', 'CD4-P3-65', 'Hình bình hành', 'hinh_hoc', 23, 37,
 'Sinh bài tập về Hình bình hành (đặc điểm, tính chu vi, diện tích = đáy × chiều cao), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết hình bình hành. Đếm cạnh, đỉnh.
Medium: Tính chu vi và diện tích khi biết đáy và chiều cao.
Hard: Bài toán có lời văn về diện tích đất, mảnh ruộng.',
 '{"easy": "Nhận biết, đếm cạnh", "medium": "Tính chu vi, diện tích", "hard": "Bài toán đất ruộng"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P3', 'Phân số', 'CD4-P3-66', 'Hình thoi', 'hinh_hoc', 23, 38,
 'Sinh bài tập về Hình thoi (đặc điểm, diện tích = (đường chéo 1 × đường chéo 2) / 2), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết hình thoi.
Medium: Tính diện tích khi biết 2 đường chéo.
Hard: Tìm đường chéo khi biết diện tích và đường chéo còn lại.',
 '{"easy": "Nhận biết", "medium": "Tính diện tích", "hard": "Tìm đường chéo"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P3', 'Phân số', 'CD4-P3-67', 'Mét vuông (m²)', 'do_luong', 24, 39,
 'Sinh bài tập về Đơn vị đo diện tích Mét vuông, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: 1 m² = 100 dm² = 10 000 cm². Đổi tròn.
Medium: Đổi đa bước. So sánh diện tích.
Hard: Bài toán diện tích phòng, sân.',
 '{"easy": "1 m² = 100 dm²", "medium": "Đổi đa bước", "hard": "Bài toán diện tích"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P3', 'Phân số', 'CD4-P3-68', 'Đề-xi-mét vuông (dm²)', 'do_luong', 24, 40,
 'Sinh bài tập về Đề-xi-mét vuông, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: 1 dm² = 100 cm². Đổi tròn.
Medium: Đổi đa bước.
Hard: Bài toán diện tích vật nhỏ.',
 '{"easy": "1 dm² = 100 cm²", "medium": "Đổi đa bước", "hard": "Bài toán vật nhỏ"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P3', 'Phân số', 'CD4-P3-69', 'Mi-li-mét vuông (mm²)', 'do_luong', 25, 41,
 'Sinh bài tập về Mi-li-mét vuông, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: 1 cm² = 100 mm². Đổi tròn.
Medium: Đổi đa bước qua nhiều đơn vị.
Hard: Bài toán diện tích vi mô (chip, tem).',
 '{"easy": "1 cm² = 100 mm²", "medium": "Đa bước", "hard": "Bài toán vi mô"}'::jsonb, 'co_ban'),

-- Phần IV: Phép tính phân số + thống kê
('toan', 4, 'canh_dieu', 2, 'P4', 'Phép tính với phân số', 'CD4-P4-73', 'Cộng phân số cùng mẫu số', 'so_hoc', 26, 42,
 'Sinh bài tập về Cộng phân số cùng mẫu, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Cộng 2 phân số cùng mẫu.
Medium: Cộng 3 phân số. Rút gọn kết quả.
Hard: Bài toán có lời văn (chia bánh, công việc).',
 '{"easy": "Cộng 2 phân số", "medium": "Cộng 3 phân số, rút gọn", "hard": "Bài toán phần"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P4', 'Phép tính với phân số', 'CD4-P4-74', 'Trừ phân số cùng mẫu số', 'so_hoc', 26, 43,
 'Sinh bài tập về Trừ phân số cùng mẫu, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Trừ 2 phân số cùng mẫu.
Medium: Tìm phân số chưa biết. Rút gọn kết quả.
Hard: Bài toán phần còn lại (làm xong bao nhiêu, còn bao nhiêu).',
 '{"easy": "Trừ 2 phân số", "medium": "Tìm chưa biết", "hard": "Phần còn lại"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P4', 'Phép tính với phân số', 'CD4-P4-76', 'Cộng phân số khác mẫu số', 'so_hoc', 27, 44,
 'Sinh bài tập về Cộng phân số khác mẫu, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Quy đồng rồi cộng (mẫu là bội của nhau).
Medium: Quy đồng 2 phân số khác mẫu thực sự.
Hard: Bài toán có lời văn 2 bước.',
 '{"easy": "Mẫu là bội", "medium": "Quy đồng thực sự", "hard": "Bài toán 2 bước"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P4', 'Phép tính với phân số', 'CD4-P4-77', 'Trừ phân số khác mẫu số', 'so_hoc', 27, 45,
 'Sinh bài tập về Trừ phân số khác mẫu, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Quy đồng rồi trừ.
Medium: Tìm phân số chưa biết.
Hard: Bài toán phần còn thiếu.',
 '{"easy": "Quy đồng rồi trừ", "medium": "Tìm chưa biết", "hard": "Phần còn thiếu"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P4', 'Phép tính với phân số', 'CD4-P4-80', 'Phép nhân phân số', 'so_hoc', 28, 46,
 'Sinh bài tập về Phép nhân phân số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhân 2 phân số đơn giản.
Medium: Rút gọn trước khi nhân. Nhân phân số với số tự nhiên.
Hard: Nhân chuỗi phân số. Bài toán có lời văn.',
 '{"easy": "Nhân 2 phân số", "medium": "Rút gọn, × STN", "hard": "Chuỗi nhân, bài toán"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P4', 'Phép tính với phân số', 'CD4-P4-82', 'Tìm phân số của một số', 'so_hoc', 28, 47,
 'Sinh bài tập về Tìm phân số của một số (a/b của N = N × a / b), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tìm 1/2, 1/3, 1/4 của số chia hết.
Medium: Tìm phân số bất kỳ của số.
Hard: Bài toán có lời văn (tiền, sản phẩm, đất đai).',
 '{"easy": "1/n của số chia hết", "medium": "Phân số bất kỳ", "hard": "Bài toán tiền/đất"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P4', 'Phép tính với phân số', 'CD4-P4-84', 'Phép chia phân số', 'so_hoc', 29, 48,
 'Sinh bài tập về Phép chia phân số (đảo ngược rồi nhân), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Chia 2 phân số đơn giản.
Medium: Chia phân số cho STN và ngược lại.
Hard: Bài toán có lời văn về chia phần.',
 '{"easy": "Chia 2 phân số", "medium": "Phân số ↔ STN", "hard": "Bài toán chia phần"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P4', 'Thống kê và xác suất', 'CD4-P4-87', 'Dãy số liệu thống kê', 'thong_ke', 30, 49,
 'Sinh bài tập về Dãy số liệu thống kê (đọc, sắp xếp, tìm max/min/trung bình), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc dãy số liệu. Tìm max, min.
Medium: Sắp xếp lại dãy. Tính tổng/trung bình.
Hard: Bài toán có lời văn (điểm thi, doanh thu tuần).',
 '{"easy": "Đọc, max/min", "medium": "Sắp xếp, trung bình", "hard": "Bài toán điểm/doanh thu"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P4', 'Thống kê và xác suất', 'CD4-P4-88', 'Biểu đồ cột', 'thong_ke', 30, 50,
 'Sinh bài tập về Biểu đồ cột (đọc, so sánh, tính tổng), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc số liệu trên biểu đồ cột. So sánh 2 cột.
Medium: Tính tổng nhiều cột. Tìm cột cao/thấp nhất.
Hard: Bài toán có lời văn dựa trên biểu đồ.',
 '{"easy": "Đọc, so sánh 2 cột", "medium": "Tổng, max/min", "hard": "Bài toán từ biểu đồ"}'::jsonb, 'co_ban'),

('toan', 4, 'canh_dieu', 2, 'P4', 'Thống kê và xác suất', 'CD4-P4-89', 'Kiểm đếm số lần xuất hiện của sự kiện', 'thong_ke', 31, 51,
 'Sinh bài tập về Kiểm đếm số lần xuất hiện của sự kiện, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đếm số lần xuất hiện trong dãy đơn giản.
Medium: Đếm theo điều kiện (ngày mưa trong tuần, học sinh đạt điểm A).
Hard: Bài toán so sánh tần suất xuất hiện.',
 '{"easy": "Đếm dãy đơn giản", "medium": "Đếm theo điều kiện", "hard": "So sánh tần suất"}'::jsonb, 'co_ban');

-- ============================================================
-- LỚP 4 — KẾT NỐI TRI THỨC
-- ============================================================
INSERT INTO curriculum_topics
    (subject, grade, series, semester, chapter_code, chapter_name, topic_code, topic_name, skill_type, week_suggestion, sort_order, ai_prompt_template, difficulty_levels, level_tag)
VALUES

-- Chủ đề 1: Ôn tập và bổ sung
('toan', 4, 'kntt', 1, 'C1', 'Ôn tập và bổ sung', 'KN4-C1-01', 'Ôn tập các số đến 100 000', 'so_hoc', 1, 1,
 'Sinh bài tập về Ôn tập các số đến 100 000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc, viết, phân tích số 5 chữ số.
Medium: So sánh, sắp xếp, liền trước/sau.
Hard: Tìm số thỏa điều kiện. Bài toán có lời văn.',
 '{"easy": "Đọc viết, phân tích", "medium": "So sánh, sắp xếp", "hard": "Tìm theo điều kiện"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C1', 'Ôn tập và bổ sung', 'KN4-C1-02', 'Ôn tập các phép tính trong phạm vi 100 000', 'so_hoc', 1, 2,
 'Sinh bài tập về Ôn tập 4 phép tính trong phạm vi 100 000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Cộng, trừ, nhân, chia đơn giản.
Medium: Tính có nhớ. Tìm thành phần chưa biết.
Hard: Biểu thức kết hợp. Bài toán 2 bước.',
 '{"easy": "4 phép tính đơn giản", "medium": "Có nhớ, tìm x", "hard": "Biểu thức, 2 bước"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C1', 'Ôn tập và bổ sung', 'KN4-C1-03', 'Số chẵn, số lẻ', 'so_hoc', 2, 3,
 'Sinh bài tập về Số chẵn, số lẻ, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Phân biệt chẵn/lẻ qua chữ số đơn vị.
Medium: Đếm số chẵn/lẻ trong khoảng. Tổng/hiệu chẵn-lẻ.
Hard: Tìm số chẵn/lẻ thỏa điều kiện.',
 '{"easy": "Phân biệt qua chữ số", "medium": "Đếm trong khoảng", "hard": "Tìm theo điều kiện"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C1', 'Ôn tập và bổ sung', 'KN4-C1-04', 'Biểu thức chữ', 'bieu_thuc', 2, 4,
 'Sinh bài tập về Biểu thức chữ (a + b, a × b - c...), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính giá trị biểu thức 1 chữ.
Medium: Biểu thức 2-3 chữ. Tính với nhiều giá trị.
Hard: Lập biểu thức từ tình huống.',
 '{"easy": "Giá trị 1 chữ", "medium": "2-3 chữ", "hard": "Lập biểu thức"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C1', 'Ôn tập và bổ sung', 'KN4-C1-05', 'Giải bài toán có ba bước tính', 'so_hoc', 3, 5,
 'Sinh bài tập về Bài toán giải bằng 3 bước tính, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: 3 bước số nhỏ (cộng-nhân-trừ).
Medium: Kết hợp 4 phép tính. Số liệu trong 1000.
Hard: Bài toán có ngữ cảnh (mua bán nhiều mặt hàng, tổng cộng).',
 '{"easy": "3 bước số nhỏ", "medium": "Kết hợp 4 phép", "hard": "Mua bán phức tạp"}'::jsonb, 'co_ban'),

-- Chủ đề 2: Góc và đo góc
('toan', 4, 'kntt', 1, 'C2', 'Góc và đơn vị đo góc', 'KN4-C2-07', 'Đo góc, đơn vị đo góc', 'hinh_hoc', 4, 6,
 'Sinh bài tập về Đo góc và đơn vị đo góc Độ (°), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc số đo góc trên thước đo.
Medium: Cộng/trừ các số đo góc.
Hard: Bài toán xác định góc.',
 '{"easy": "Đọc số đo", "medium": "Cộng trừ góc", "hard": "Xác định góc"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C2', 'Góc và đơn vị đo góc', 'KN4-C2-08', 'Góc nhọn, góc tù, góc bẹt', 'hinh_hoc', 4, 7,
 'Sinh bài tập về Góc nhọn (<90°), tù (>90°), bẹt (180°), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Phân loại qua hình.
Medium: Đếm số góc mỗi loại trong hình phức tạp.
Hard: Bài toán xếp hình theo góc.',
 '{"easy": "Phân loại qua hình", "medium": "Đếm trong hình phức tạp", "hard": "Xếp hình"}'::jsonb, 'co_ban'),

-- Chủ đề 3: Số có nhiều chữ số
('toan', 4, 'kntt', 1, 'C3', 'Số có nhiều chữ số', 'KN4-C3-10', 'Số có sáu chữ số. Số 1 000 000', 'so_hoc', 5, 8,
 'Sinh bài tập về Số 6 chữ số (đến 1 000 000), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc, viết.
Medium: Phân tích thành các hàng. Liền trước/sau.
Hard: Tìm số thỏa điều kiện.',
 '{"easy": "Đọc viết", "medium": "Phân tích, liền trước/sau", "hard": "Tìm theo điều kiện"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C3', 'Số có nhiều chữ số', 'KN4-C3-11', 'Hàng và lớp', 'so_hoc', 5, 9,
 'Sinh bài tập về Hàng và lớp (lớp đơn vị: đơn vị-chục-trăm; lớp nghìn: nghìn-chục nghìn-trăm nghìn; lớp triệu: triệu-chục triệu-trăm triệu), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Xác định hàng nào trong lớp nào.
Medium: Đọc số bằng cách phân lớp.
Hard: Bài toán phức tạp.',
 '{"easy": "Hàng nào trong lớp nào", "medium": "Đọc số phân lớp", "hard": "Phức tạp"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C3', 'Số có nhiều chữ số', 'KN4-C3-12', 'Các số trong phạm vi lớp triệu', 'so_hoc', 6, 10,
 'Sinh bài tập về Các số trong phạm vi lớp triệu (đến hàng trăm triệu), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc, viết số 7-9 chữ số.
Medium: Phân tích thành các hàng. So sánh.
Hard: Tìm số thỏa điều kiện. Bài toán dân số.',
 '{"easy": "Đọc viết", "medium": "Phân tích, so sánh", "hard": "Bài toán dân số"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C3', 'Số có nhiều chữ số', 'KN4-C3-13', 'Làm tròn số đến hàng trăm nghìn', 'so_hoc', 6, 11,
 'Sinh bài tập về Làm tròn số đến hàng trăm nghìn, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Làm tròn đến chục, trăm, nghìn.
Medium: Đến chục nghìn, trăm nghìn.
Hard: Bài toán ước lượng.',
 '{"easy": "Tròn nhỏ", "medium": "Tròn lớn", "hard": "Ước lượng"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C3', 'Số có nhiều chữ số', 'KN4-C3-14', 'So sánh các số có nhiều chữ số', 'so_hoc', 7, 12,
 'Sinh bài tập về So sánh số nhiều chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: So sánh 2 số.
Medium: Sắp xếp 4-5 số.
Hard: Tìm chữ số thiếu trong bất đẳng thức.',
 '{"easy": "So sánh 2 số", "medium": "Sắp xếp 4-5 số", "hard": "Chữ số thiếu"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C3', 'Số có nhiều chữ số', 'KN4-C3-15', 'Làm quen với dãy số tự nhiên', 'so_hoc', 7, 13,
 'Sinh bài tập về Dãy số tự nhiên (bắt đầu 0, vô tận), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Liền trước/sau.
Medium: Đếm số trong khoảng. Số chẵn/lẻ.
Hard: Tìm số thỏa nhiều điều kiện.',
 '{"easy": "Liền trước/sau", "medium": "Đếm khoảng, chẵn/lẻ", "hard": "Nhiều điều kiện"}'::jsonb, 'co_ban'),

-- Chủ đề 4: Đo đại lượng
('toan', 4, 'kntt', 1, 'C4', 'Đơn vị đo đại lượng', 'KN4-C4-17', 'Yến, tạ, tấn', 'do_luong', 8, 14,
 'Sinh bài tập về Yến, tạ, tấn (1 yến=10kg, 1 tạ=100kg, 1 tấn=1000kg), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đổi đơn giản.
Medium: Đa bước, so sánh.
Hard: Bài toán xe tải, gạo.',
 '{"easy": "Đổi đơn giản", "medium": "Đa bước, so sánh", "hard": "Bài toán xe tải"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C4', 'Đơn vị đo đại lượng', 'KN4-C4-18', 'Đề-xi-mét vuông, mét vuông, mi-li-mét vuông', 'do_luong', 8, 15,
 'Sinh bài tập về Đơn vị đo diện tích dm², m², mm² (1 m²=100 dm²=10 000 cm²; 1 cm²=100 mm²), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đổi đơn giản giữa các đơn vị liền kề.
Medium: Đổi đa bước. So sánh diện tích.
Hard: Bài toán diện tích phòng/sân/sàn.',
 '{"easy": "Đổi đơn vị liền kề", "medium": "Đa bước, so sánh", "hard": "Bài toán diện tích"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C4', 'Đơn vị đo đại lượng', 'KN4-C4-19', 'Giây, thế kỉ', 'do_luong', 9, 16,
 'Sinh bài tập về Giây và Thế kỉ (1 phút=60 giây; 1 thế kỉ=100 năm), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đổi đơn giản.
Medium: Đa bước. Năm thuộc thế kỉ.
Hard: Bài toán lịch sử và thời gian.',
 '{"easy": "Đổi đơn giản", "medium": "Năm thuộc thế kỉ", "hard": "Lịch sử"}'::jsonb, 'co_ban'),

-- Chủ đề 5: Cộng, trừ
('toan', 4, 'kntt', 1, 'C5', 'Phép cộng, phép trừ', 'KN4-C5-22', 'Phép cộng các số có nhiều chữ số', 'so_hoc', 10, 17,
 'Sinh bài tập về Phép cộng số nhiều chữ số (đến triệu), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Không nhớ.
Medium: Có nhớ 1-2 lần.
Hard: Có nhớ nhiều lần. Bài toán 2 bước.',
 '{"easy": "Không nhớ", "medium": "Nhớ 1-2 lần", "hard": "Nhớ nhiều, 2 bước"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C5', 'Phép cộng, phép trừ', 'KN4-C5-23', 'Phép trừ các số có nhiều chữ số', 'so_hoc', 10, 18,
 'Sinh bài tập về Phép trừ số nhiều chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Không nhớ.
Medium: Có nhớ 1-2 lần. Tìm thành phần.
Hard: Có nhớ nhiều. Bài toán lời văn.',
 '{"easy": "Không nhớ", "medium": "Nhớ 1-2 lần, tìm x", "hard": "Nhớ nhiều, bài toán"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C5', 'Phép cộng, phép trừ', 'KN4-C5-24', 'Tính chất giao hoán và kết hợp của phép cộng', 'so_hoc', 11, 19,
 'Sinh bài tập về Tính chất giao hoán, kết hợp, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Áp dụng giao hoán đơn giản.
Medium: Kết hợp 3 số tròn.
Hard: Tính nhanh nhiều số.',
 '{"easy": "Giao hoán", "medium": "Kết hợp 3 số", "hard": "Tính nhanh nhiều"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C5', 'Phép cộng, phép trừ', 'KN4-C5-25', 'Tìm hai số biết tổng và hiệu của hai số đó', 'so_hoc', 11, 20,
 'Sinh bài tập về Tìm 2 số khi biết tổng và hiệu, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tổng-hiệu nhỏ. Áp dụng (T+H)/2.
Medium: Phạm vi 100 000.
Hard: Bài toán có lời văn (tuổi, tiền, sản phẩm).',
 '{"easy": "Tổng-hiệu nhỏ", "medium": "100 000", "hard": "Bài toán lời văn"}'::jsonb, 'co_ban'),

-- Chủ đề 6: Vuông góc, song song
('toan', 4, 'kntt', 1, 'C6', 'Vuông góc, song song', 'KN4-C6-27', 'Hai đường thẳng vuông góc', 'hinh_hoc', 12, 21,
 'Sinh bài tập về Hai đường thẳng vuông góc, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết.
Medium: Đếm cặp vuông góc trong hình.
Hard: Bài toán xếp hình.',
 '{"easy": "Nhận biết", "medium": "Đếm cặp", "hard": "Xếp hình"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C6', 'Vuông góc, song song', 'KN4-C6-29', 'Hai đường thẳng song song', 'hinh_hoc', 12, 22,
 'Sinh bài tập về Hai đường thẳng song song, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết.
Medium: Đếm cặp song song trong hình.
Hard: Hình phức tạp với nhiều đường.',
 '{"easy": "Nhận biết", "medium": "Đếm cặp", "hard": "Hình phức tạp"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C6', 'Vuông góc, song song', 'KN4-C6-31', 'Hình bình hành, hình thoi', 'hinh_hoc', 13, 23,
 'Sinh bài tập về Hình bình hành (S = a × h) và Hình thoi (S = (d1×d2)/2), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết hình. Đếm cạnh, đỉnh.
Medium: Tính chu vi/diện tích khi biết kích thước.
Hard: Bài toán có lời văn về diện tích đất, mảnh ruộng.',
 '{"easy": "Nhận biết, đếm", "medium": "Tính chu vi/diện tích", "hard": "Bài toán đất"}'::jsonb, 'co_ban'),

-- Chủ đề 8: Phép nhân, chia
('toan', 4, 'kntt', 1, 'C8', 'Phép nhân, phép chia', 'KN4-C8-38', 'Nhân với số có một chữ số', 'so_hoc', 14, 24,
 'Sinh bài tập về Nhân số nhiều chữ số với số 1 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Không nhớ.
Medium: Nhớ 1-2 lần.
Hard: Nhớ nhiều, bài toán.',
 '{"easy": "Không nhớ", "medium": "Nhớ 1-2 lần", "hard": "Nhớ nhiều, bài toán"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C8', 'Phép nhân, phép chia', 'KN4-C8-39', 'Chia cho số có một chữ số', 'so_hoc', 14, 25,
 'Sinh bài tập về Chia số nhiều chữ số cho 1 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Chia hết.
Medium: Có dư.
Hard: Thương có 0, bài toán.',
 '{"easy": "Chia hết", "medium": "Có dư", "hard": "Thương có 0"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C8', 'Phép nhân, phép chia', 'KN4-C8-40', 'Tính chất giao hoán và kết hợp của phép nhân', 'so_hoc', 15, 26,
 'Sinh bài tập về Tính chất giao hoán, kết hợp của phép nhân, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Giao hoán đơn giản.
Medium: Kết hợp 3 số.
Hard: Tính nhanh tích nhiều số.',
 '{"easy": "Giao hoán", "medium": "Kết hợp 3 số", "hard": "Tích nhiều số"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C8', 'Phép nhân, phép chia', 'KN4-C8-41', 'Nhân, chia với 10, 100, 1 000, ...', 'so_hoc', 15, 27,
 'Sinh bài tập về Nhân, chia với 10, 100, 1 000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Số nhỏ × hoặc : 10/100/1000.
Medium: Nhiều chữ số. Đổi đơn vị.
Hard: Bài toán quy đổi đại lượng.',
 '{"easy": "Số nhỏ × ÷ 10ⁿ", "medium": "Nhiều chữ số, đổi đơn vị", "hard": "Quy đổi"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C8', 'Phép nhân, phép chia', 'KN4-C8-42', 'Tính chất phân phối của phép nhân với phép cộng', 'so_hoc', 16, 28,
 'Sinh bài tập về Tính chất phân phối a × (b+c) = a×b + a×c, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Áp dụng phân phối với số nhỏ.
Medium: Áp dụng để tính nhanh.
Hard: Bài toán phức tạp dùng phân phối.',
 '{"easy": "Phân phối số nhỏ", "medium": "Tính nhanh", "hard": "Bài toán phức tạp"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C8', 'Phép nhân, phép chia', 'KN4-C8-43', 'Nhân với số có hai chữ số', 'so_hoc', 16, 29,
 'Sinh bài tập về Nhân với số có 2 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Không nhớ.
Medium: Có nhớ. Đặt tính dọc.
Hard: Bài toán 2 bước.',
 '{"easy": "Không nhớ", "medium": "Có nhớ, đặt tính", "hard": "Bài toán 2 bước"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C8', 'Phép nhân, phép chia', 'KN4-C8-44', 'Chia cho số có hai chữ số', 'so_hoc', 17, 30,
 'Sinh bài tập về Chia cho số có 2 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Chia hết, thương 1 chữ số.
Medium: Có dư, thương 2 chữ số.
Hard: Số bị chia 4-5 chữ số.',
 '{"easy": "Chia hết", "medium": "Có dư", "hard": "Số bị chia lớn"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C8', 'Phép nhân, phép chia', 'KN4-C8-46', 'Tìm số trung bình cộng', 'so_hoc', 18, 31,
 'Sinh bài tập về Tìm số trung bình cộng, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Trung bình 2-3 số.
Medium: Trung bình 4-5 số. Tìm số thiếu.
Hard: Bài toán điểm thi, năng suất.',
 '{"easy": "2-3 số", "medium": "4-5 số, tìm thiếu", "hard": "Điểm/năng suất"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 1, 'C8', 'Phép nhân, phép chia', 'KN4-C8-47', 'Bài toán liên quan đến rút về đơn vị', 'so_hoc', 18, 32,
 'Sinh bài tập về Bài toán rút về đơn vị, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: 1 bước.
Medium: 2 bước.
Hard: Nhiều bước, kết hợp.',
 '{"easy": "1 bước", "medium": "2 bước", "hard": "Nhiều bước"}'::jsonb, 'co_ban'),

-- Chủ đề 9: Thống kê, xác suất
('toan', 4, 'kntt', 2, 'C9', 'Thống kê, xác suất', 'KN4-C9-49', 'Dãy số liệu thống kê', 'thong_ke', 20, 33,
 'Sinh bài tập về Dãy số liệu thống kê, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc, tìm max/min.
Medium: Sắp xếp, tính trung bình.
Hard: Bài toán điểm/doanh thu.',
 '{"easy": "Đọc, max/min", "medium": "Sắp xếp, trung bình", "hard": "Bài toán"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 2, 'C9', 'Thống kê, xác suất', 'KN4-C9-50', 'Biểu đồ cột', 'thong_ke', 20, 34,
 'Sinh bài tập về Biểu đồ cột, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc, so sánh 2 cột.
Medium: Tổng, max/min.
Hard: Bài toán từ biểu đồ.',
 '{"easy": "Đọc, so sánh", "medium": "Tổng, max/min", "hard": "Bài toán"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 2, 'C9', 'Thống kê, xác suất', 'KN4-C9-51', 'Số lần xuất hiện của một sự kiện', 'thong_ke', 21, 35,
 'Sinh bài tập về Đếm số lần xuất hiện của sự kiện, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đếm dãy đơn giản.
Medium: Đếm theo điều kiện.
Hard: So sánh tần suất.',
 '{"easy": "Đếm dãy", "medium": "Theo điều kiện", "hard": "So sánh tần suất"}'::jsonb, 'co_ban'),

-- Chủ đề 10-12: Phân số
('toan', 4, 'kntt', 2, 'C10', 'Phân số', 'KN4-C10-53', 'Khái niệm phân số', 'so_hoc', 22, 36,
 'Sinh bài tập về Khái niệm phân số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết, đọc viết.
Medium: Tử/mẫu, so với 1.
Hard: Tìm phân số theo điều kiện.',
 '{"easy": "Nhận biết", "medium": "Tử/mẫu, so 1", "hard": "Tìm theo điều kiện"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 2, 'C10', 'Phân số', 'KN4-C10-54', 'Phân số và phép chia số tự nhiên', 'so_hoc', 22, 37,
 'Sinh bài tập về Phân số và phép chia STN, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đổi giữa chia và phân số.
Medium: So sánh chia có dư.
Hard: Bài toán chia phần.',
 '{"easy": "Đổi qua lại", "medium": "Chia có dư", "hard": "Bài toán phần"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 2, 'C10', 'Phân số', 'KN4-C10-55', 'Tính chất cơ bản của phân số', 'so_hoc', 23, 38,
 'Sinh bài tập về Tính chất cơ bản của phân số (nhân/chia tử và mẫu cùng số), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Áp dụng nhân tử-mẫu.
Medium: Phân số tương đương.
Hard: Áp dụng giải bài toán.',
 '{"easy": "Nhân tử-mẫu", "medium": "Tương đương", "hard": "Áp dụng giải bài"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 2, 'C10', 'Phân số', 'KN4-C10-56', 'Rút gọn phân số', 'so_hoc', 23, 39,
 'Sinh bài tập về Rút gọn phân số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Rút 1 lần.
Medium: Tối giản.
Hard: Rút rồi tính.',
 '{"easy": "1 lần", "medium": "Tối giản", "hard": "Rút rồi tính"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 2, 'C10', 'Phân số', 'KN4-C10-57', 'Quy đồng mẫu số các phân số', 'so_hoc', 24, 40,
 'Sinh bài tập về Quy đồng mẫu số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Mẫu là bội.
Medium: Mẫu nguyên tố cùng nhau.
Hard: 3 phân số.',
 '{"easy": "Mẫu là bội", "medium": "NTCN", "hard": "3 phân số"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 2, 'C10', 'Phân số', 'KN4-C10-58', 'So sánh phân số', 'so_hoc', 24, 41,
 'Sinh bài tập về So sánh phân số (cùng mẫu, khác mẫu, so với 1, 1/2), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Cùng mẫu hoặc khác mẫu đơn giản.
Medium: Khác mẫu, so với 1, 1/2.
Hard: Sắp xếp 3-4 phân số khác mẫu.',
 '{"easy": "Cùng mẫu hoặc đơn giản", "medium": "Khác mẫu, so 1/2", "hard": "Sắp xếp 3-4"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 2, 'C11', 'Phép cộng, trừ phân số', 'KN4-C11-60', 'Phép cộng phân số', 'so_hoc', 25, 42,
 'Sinh bài tập về Phép cộng phân số (cùng mẫu, khác mẫu), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Cùng mẫu.
Medium: Khác mẫu (cần quy đồng).
Hard: Cộng nhiều phân số. Bài toán.',
 '{"easy": "Cùng mẫu", "medium": "Khác mẫu", "hard": "Nhiều phân số, bài toán"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 2, 'C11', 'Phép cộng, trừ phân số', 'KN4-C11-61', 'Phép trừ phân số', 'so_hoc', 25, 43,
 'Sinh bài tập về Phép trừ phân số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Cùng mẫu.
Medium: Khác mẫu. Tìm chưa biết.
Hard: Bài toán phần còn lại.',
 '{"easy": "Cùng mẫu", "medium": "Khác mẫu, tìm x", "hard": "Phần còn lại"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 2, 'C12', 'Phép nhân, chia phân số', 'KN4-C12-63', 'Phép nhân phân số', 'so_hoc', 26, 44,
 'Sinh bài tập về Phép nhân phân số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhân 2 phân số đơn giản.
Medium: Rút gọn trước. Nhân với STN.
Hard: Chuỗi nhân, bài toán.',
 '{"easy": "2 phân số", "medium": "Rút gọn, × STN", "hard": "Chuỗi, bài toán"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 2, 'C12', 'Phép nhân, chia phân số', 'KN4-C12-64', 'Phép chia phân số', 'so_hoc', 26, 45,
 'Sinh bài tập về Phép chia phân số (đảo ngược rồi nhân), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: 2 phân số đơn giản.
Medium: Phân số ↔ STN.
Hard: Bài toán chia phần.',
 '{"easy": "2 phân số", "medium": "Phân số ↔ STN", "hard": "Chia phần"}'::jsonb, 'co_ban'),

('toan', 4, 'kntt', 2, 'C12', 'Phép nhân, chia phân số', 'KN4-C12-65', 'Tìm phân số của một số', 'so_hoc', 27, 46,
 'Sinh bài tập về Tìm phân số của một số (a/b của N), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: 1/n của số chia hết.
Medium: Phân số bất kỳ.
Hard: Bài toán tiền/đất/sản phẩm.',
 '{"easy": "1/n chia hết", "medium": "Phân số bất kỳ", "hard": "Bài toán thực tế"}'::jsonb, 'co_ban');

-- ============================================================
-- Backfill: existing Lớp 3 Cánh Diều rows → level_tag = 'co_ban' (already default)
-- (No-op insert; default DEFAULT 'co_ban' applied via ALTER TABLE above.)
-- ============================================================
