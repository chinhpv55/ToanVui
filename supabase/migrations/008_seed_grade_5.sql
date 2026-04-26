-- ============================================================
-- Migration 008: Seed curriculum cho Lớp 5 (Cánh Diều + KNTT)
-- ============================================================
-- Yêu cầu chạy SAU migration 007 (đã thêm cột level_tag).
-- ============================================================

DELETE FROM curriculum_topics
 WHERE topic_code LIKE ANY (ARRAY['CD5-%', 'KN5-%']);

-- ============================================================
-- LỚP 5 — CÁNH DIỀU
-- ============================================================
INSERT INTO curriculum_topics
    (subject, grade, series, semester, chapter_code, chapter_name, topic_code, topic_name, skill_type, week_suggestion, sort_order, ai_prompt_template, difficulty_levels, level_tag)
VALUES

-- Chương 1: Ôn tập, tỉ số, hỗn số, số thập phân, đơn vị diện tích
('toan', 5, 'canh_dieu', 1, 'C1', 'Ôn tập, tỉ số, số thập phân', 'CD5-C1-01', 'Ôn tập số tự nhiên và phép tính', 'so_hoc', 1, 1,
 'Sinh bài tập về Ôn tập STN và 4 phép tính, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Cộng/trừ/nhân/chia STN trong phạm vi triệu.
Medium: Tìm thành phần, biểu thức kết hợp.
Hard: Bài toán có lời văn 2-3 bước.',
 '{"easy": "4 phép tính cơ bản", "medium": "Tìm x, biểu thức", "hard": "Bài toán 2-3 bước"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C1', 'Ôn tập, tỉ số, số thập phân', 'CD5-C1-04', 'Ôn tập phân số và phép tính phân số', 'so_hoc', 2, 2,
 'Sinh bài tập về Ôn tập phân số (cộng/trừ/nhân/chia, rút gọn, quy đồng), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: 4 phép tính cùng/khác mẫu đơn giản.
Medium: Rút gọn, quy đồng, so sánh.
Hard: Biểu thức phân số phức tạp, bài toán.',
 '{"easy": "4 phép tính phân số", "medium": "Rút gọn, quy đồng", "hard": "Biểu thức phức tạp"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C1', 'Ôn tập, tỉ số, số thập phân', 'CD5-C1-06', 'Tỉ số', 'so_hoc', 3, 3,
 'Sinh bài tập về Tỉ số (a:b = a/b), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Viết tỉ số của 2 số. Đọc tỉ số.
Medium: Rút gọn tỉ số. Tỉ số có đơn vị (3 m : 50 cm).
Hard: Bài toán có lời văn về tỉ số (chiều cao, tuổi).',
 '{"easy": "Viết, đọc tỉ số", "medium": "Rút gọn, đơn vị", "hard": "Bài toán tỉ số"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C1', 'Ôn tập, tỉ số, số thập phân', 'CD5-C1-07', 'Tìm hai số khi biết tổng và tỉ số', 'so_hoc', 3, 4,
 'Sinh bài tập về Tìm 2 số khi biết tổng và tỉ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tổng và tỉ đơn giản (1:2, 1:3).
Medium: Tỉ phức tạp hơn (3:5, 2:7). Vẽ sơ đồ.
Hard: Bài toán có lời văn (tuổi, tiền, chiều cao).',
 '{"easy": "Tỉ 1:2, 1:3", "medium": "Tỉ 3:5, 2:7", "hard": "Bài toán tuổi/tiền"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C1', 'Ôn tập, tỉ số, số thập phân', 'CD5-C1-08', 'Tìm hai số khi biết hiệu và tỉ số', 'so_hoc', 4, 5,
 'Sinh bài tập về Tìm 2 số khi biết hiệu và tỉ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Hiệu và tỉ đơn giản.
Medium: Tỉ phức tạp. Vẽ sơ đồ.
Hard: Bài toán lời văn.',
 '{"easy": "Tỉ đơn giản", "medium": "Tỉ phức tạp", "hard": "Bài toán lời văn"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C1', 'Ôn tập, tỉ số, số thập phân', 'CD5-C1-09', 'Bài toán quan hệ tỉ lệ thuận, tỉ lệ nghịch', 'so_hoc', 4, 6,
 'Sinh bài tập về Quan hệ tỉ lệ thuận, tỉ lệ nghịch, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết loại quan hệ.
Medium: Tính giá trị thiếu trong bảng tỉ lệ.
Hard: Bài toán lời văn (số người-thời gian, số máy-năng suất).',
 '{"easy": "Nhận biết loại", "medium": "Tính giá trị thiếu", "hard": "Bài toán lao động"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C1', 'Ôn tập, tỉ số, số thập phân', 'CD5-C1-11', 'Hỗn số', 'so_hoc', 5, 7,
 'Sinh bài tập về Hỗn số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc, viết hỗn số. Đổi phân số → hỗn số.
Medium: Đổi hỗn số → phân số. So sánh.
Hard: Cộng/trừ hỗn số. Bài toán có lời văn.',
 '{"easy": "Đọc viết, đổi từ phân số", "medium": "Đổi sang phân số, so sánh", "hard": "Cộng trừ, bài toán"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C1', 'Ôn tập, tỉ số, số thập phân', 'CD5-C1-12', 'Phân số thập phân', 'so_hoc', 5, 8,
 'Sinh bài tập về Phân số thập phân (mẫu là 10, 100, 1000...), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết phân số thập phân.
Medium: Đổi phân số thường ↔ phân số thập phân.
Hard: Áp dụng để chuyển sang số thập phân.',
 '{"easy": "Nhận biết", "medium": "Đổi phân số ↔", "hard": "Sang số thập phân"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C1', 'Ôn tập, tỉ số, số thập phân', 'CD5-C1-13', 'Số thập phân. Đọc, viết số thập phân', 'so_hoc', 6, 9,
 'Sinh bài tập về Số thập phân (đọc, viết, hàng), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc, viết số thập phân đơn giản.
Medium: Phân tích thành phần nguyên + thập phân. Hàng phần mười, phần trăm, phần nghìn.
Hard: Viết số khi biết các hàng. Bài toán.',
 '{"easy": "Đọc viết đơn giản", "medium": "Phân tích hàng", "hard": "Viết từ hàng"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C1', 'Ôn tập, tỉ số, số thập phân', 'CD5-C1-14', 'So sánh số thập phân', 'so_hoc', 6, 10,
 'Sinh bài tập về So sánh số thập phân, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: So sánh 2 số (cùng/khác phần nguyên).
Medium: Sắp xếp 4-5 số.
Hard: Tìm chữ số thiếu trong bất đẳng thức.',
 '{"easy": "So sánh 2 số", "medium": "Sắp xếp", "hard": "Chữ số thiếu"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C1', 'Ôn tập, tỉ số, số thập phân', 'CD5-C1-15', 'Làm tròn số thập phân', 'so_hoc', 7, 11,
 'Sinh bài tập về Làm tròn số thập phân, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tròn đến phần mười.
Medium: Tròn đến phần trăm, phần nghìn.
Hard: Bài toán ước lượng. So sánh sau làm tròn.',
 '{"easy": "Tròn đến phần mười", "medium": "Trăm, nghìn", "hard": "Ước lượng"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C1', 'Ôn tập, tỉ số, số thập phân', 'CD5-C1-20', 'Héc-ta (ha)', 'do_luong', 8, 12,
 'Sinh bài tập về Héc-ta (1 ha = 10 000 m² = 1 hm²), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đổi tròn ha ↔ m².
Medium: Đổi đa bước.
Hard: Bài toán diện tích đất ruộng, rừng.',
 '{"easy": "Đổi tròn", "medium": "Đa bước", "hard": "Diện tích đất ruộng"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C1', 'Ôn tập, tỉ số, số thập phân', 'CD5-C1-21', 'Ki-lô-mét vuông (km²)', 'do_luong', 8, 13,
 'Sinh bài tập về Ki-lô-mét vuông (1 km² = 1 000 000 m² = 100 ha), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đổi tròn.
Medium: Đa bước qua nhiều đơn vị.
Hard: Bài toán diện tích thành phố, quốc gia.',
 '{"easy": "Đổi tròn", "medium": "Đa bước", "hard": "Diện tích đất nước"}'::jsonb, 'co_ban'),

-- Chương 2: Phép tính số thập phân, tỉ số phần trăm
('toan', 5, 'canh_dieu', 1, 'C2', 'Phép tính số thập phân, tỉ số phần trăm', 'CD5-C2-25', 'Cộng số thập phân', 'so_hoc', 10, 14,
 'Sinh bài tập về Cộng số thập phân, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Cộng 2 số có cùng phần thập phân.
Medium: Khác phần thập phân (cần thẳng dấu phẩy).
Hard: Cộng nhiều số, bài toán có lời văn.',
 '{"easy": "Cùng phần thập phân", "medium": "Khác phần thập phân", "hard": "Nhiều số, bài toán"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C2', 'Phép tính số thập phân, tỉ số phần trăm', 'CD5-C2-26', 'Trừ số thập phân', 'so_hoc', 10, 15,
 'Sinh bài tập về Trừ số thập phân, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Trừ đơn giản.
Medium: Trừ có nhớ. Tìm số chưa biết.
Hard: Bài toán lời văn.',
 '{"easy": "Trừ đơn giản", "medium": "Có nhớ, tìm x", "hard": "Bài toán"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C2', 'Phép tính số thập phân, tỉ số phần trăm', 'CD5-C2-28', 'Nhân số thập phân với 10, 100, 1 000', 'so_hoc', 11, 16,
 'Sinh bài tập về Nhân số thập phân với 10, 100, 1000 (dịch dấu phẩy sang phải), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhân với 10, 100.
Medium: Nhân với 1000, 10000.
Hard: Bài toán đổi đơn vị.',
 '{"easy": "× 10, 100", "medium": "× 1000, 10 000", "hard": "Đổi đơn vị"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C2', 'Phép tính số thập phân, tỉ số phần trăm', 'CD5-C2-29', 'Nhân số thập phân với số tự nhiên', 'so_hoc', 11, 17,
 'Sinh bài tập về Nhân số thập phân với STN, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhân không nhớ.
Medium: Có nhớ. Đặt tính dọc đúng.
Hard: Bài toán có lời văn.',
 '{"easy": "Không nhớ", "medium": "Có nhớ, đặt tính", "hard": "Bài toán"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C2', 'Phép tính số thập phân, tỉ số phần trăm', 'CD5-C2-30', 'Nhân số thập phân với số thập phân', 'so_hoc', 12, 18,
 'Sinh bài tập về Nhân số thập phân với số thập phân, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhân 2 số đơn giản.
Medium: Đặt dấu phẩy đúng vị trí.
Hard: Bài toán có lời văn về diện tích, giá tiền.',
 '{"easy": "Nhân đơn giản", "medium": "Đặt dấu phẩy", "hard": "Bài toán giá/diện tích"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C2', 'Phép tính số thập phân, tỉ số phần trăm', 'CD5-C2-32', 'Chia số thập phân cho 10, 100, 1 000', 'so_hoc', 13, 19,
 'Sinh bài tập về Chia STP cho 10, 100, 1 000 (dịch dấu phẩy sang trái), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Chia cho 10, 100.
Medium: Chia cho 1000.
Hard: Bài toán đổi đơn vị nhỏ.',
 '{"easy": "÷ 10, 100", "medium": "÷ 1000", "hard": "Đổi đơn vị"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C2', 'Phép tính số thập phân, tỉ số phần trăm', 'CD5-C2-33', 'Chia số thập phân cho số tự nhiên', 'so_hoc', 13, 20,
 'Sinh bài tập về Chia STP cho STN, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Chia hết.
Medium: Cần thêm số 0 để chia tiếp.
Hard: Bài toán lời văn.',
 '{"easy": "Chia hết", "medium": "Thêm 0", "hard": "Bài toán"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C2', 'Phép tính số thập phân, tỉ số phần trăm', 'CD5-C2-34', 'Chia số thập phân cho số thập phân', 'so_hoc', 14, 21,
 'Sinh bài tập về Chia số thập phân cho số thập phân (nhân cả 2 với 10/100... để đưa về chia cho STN), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Chia đơn giản.
Medium: Cần dịch dấu phẩy.
Hard: Bài toán có lời văn.',
 '{"easy": "Chia đơn giản", "medium": "Dịch dấu phẩy", "hard": "Bài toán"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C2', 'Phép tính số thập phân, tỉ số phần trăm', 'CD5-C2-40', 'Tỉ số phần trăm', 'so_hoc', 16, 22,
 'Sinh bài tập về Tỉ số phần trăm (a/b × 100%), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đổi phân số → tỉ số phần trăm và ngược lại.
Medium: Đổi STP → %.
Hard: Bài toán so sánh tỉ số phần trăm.',
 '{"easy": "Đổi phân số ↔ %", "medium": "STP ↔ %", "hard": "So sánh %"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C2', 'Phép tính số thập phân, tỉ số phần trăm', 'CD5-C2-41', 'Tìm tỉ số phần trăm của hai số', 'so_hoc', 16, 23,
 'Sinh bài tập về Tìm tỉ số phần trăm của 2 số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: a/b × 100% với số đơn giản.
Medium: Số nhỏ chia số lớn (kết quả có dấu phẩy).
Hard: Bài toán điểm thi, xếp loại học sinh.',
 '{"easy": "Đơn giản", "medium": "Có dấu phẩy", "hard": "Bài toán xếp loại"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C2', 'Phép tính số thập phân, tỉ số phần trăm', 'CD5-C2-42', 'Tìm giá trị phần trăm của một số', 'so_hoc', 17, 24,
 'Sinh bài tập về Tìm giá trị phần trăm của một số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tìm 50%, 25%, 10% của số tròn.
Medium: Tỉ số bất kỳ.
Hard: Bài toán giảm giá, lãi suất.',
 '{"easy": "50, 25, 10% tròn", "medium": "Tỉ bất kỳ", "hard": "Giảm giá, lãi"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 1, 'C2', 'Phép tính số thập phân, tỉ số phần trăm', 'CD5-C2-45', 'Tỉ lệ bản đồ', 'so_hoc', 17, 25,
 'Sinh bài tập về Tỉ lệ bản đồ (1:1000, 1:1 000 000...), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc tỉ lệ. Tính khoảng cách thực khi biết bản đồ.
Medium: Tính khoảng cách bản đồ khi biết thực.
Hard: Bài toán địa lý có lời văn.',
 '{"easy": "Đọc tỉ lệ, tính thực", "medium": "Tính bản đồ", "hard": "Địa lý"}'::jsonb, 'co_ban'),

-- Chương 3: Hình học, đo lường, thời gian, vận tốc
('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-50', 'Hình tam giác', 'hinh_hoc', 19, 26,
 'Sinh bài tập về Hình tam giác (đặc điểm, các loại tam giác), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết các loại tam giác (đều, cân, vuông).
Medium: Đếm tam giác trong hình phức tạp. Cộng góc tam giác = 180°.
Hard: Bài toán xếp hình.',
 '{"easy": "Nhận biết loại", "medium": "Đếm, tổng góc", "hard": "Xếp hình"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-51', 'Diện tích hình tam giác', 'hinh_hoc', 19, 27,
 'Sinh bài tập về Diện tích hình tam giác (S = (đáy × chiều cao) / 2), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính diện tích khi biết đáy và chiều cao.
Medium: Tìm đáy hoặc chiều cao khi biết diện tích.
Hard: Bài toán có lời văn về tam giác đất.',
 '{"easy": "Tính diện tích", "medium": "Tìm đáy/cao", "hard": "Bài toán đất"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-52', 'Hình thang', 'hinh_hoc', 20, 28,
 'Sinh bài tập về Hình thang (đặc điểm, các loại), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết hình thang. Tên các cạnh (đáy lớn, đáy bé, cạnh bên).
Medium: Phân biệt thang vuông, thang cân.
Hard: Bài toán xác định loại thang.',
 '{"easy": "Nhận biết, tên cạnh", "medium": "Phân biệt loại", "hard": "Xác định loại"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-53', 'Diện tích hình thang', 'hinh_hoc', 20, 29,
 'Sinh bài tập về Diện tích hình thang (S = (a + b) × h / 2), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính diện tích khi biết 2 đáy và chiều cao.
Medium: Tìm 1 đáy khi biết diện tích, đáy còn lại và chiều cao.
Hard: Bài toán có lời văn về mảnh đất hình thang.',
 '{"easy": "Tính diện tích", "medium": "Tìm đáy thiếu", "hard": "Bài toán đất"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-55', 'Chu vi hình tròn', 'hinh_hoc', 21, 30,
 'Sinh bài tập về Chu vi hình tròn (C = d × π = 2 × r × π, π ≈ 3.14), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính chu vi khi biết bán kính/đường kính.
Medium: Tìm bán kính khi biết chu vi.
Hard: Bài toán bánh xe, đường biên.',
 '{"easy": "Tính chu vi", "medium": "Tìm bán kính", "hard": "Bánh xe, đường biên"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-56', 'Diện tích hình tròn', 'hinh_hoc', 21, 31,
 'Sinh bài tập về Diện tích hình tròn (S = r × r × π), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính diện tích khi biết bán kính.
Medium: Tính diện tích khi biết đường kính. So sánh diện tích 2 hình tròn.
Hard: Bài toán hình quạt, hình vành khăn.',
 '{"easy": "Tính từ bán kính", "medium": "Từ đường kính", "hard": "Quạt, vành khăn"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-58', 'Hình hộp chữ nhật', 'hinh_hoc', 22, 32,
 'Sinh bài tập về Hình hộp chữ nhật (đếm mặt, cạnh, đỉnh; xác định kích thước), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đếm 6 mặt, 12 cạnh, 8 đỉnh.
Medium: Xác định 3 kích thước (dài, rộng, cao).
Hard: Bài toán xác định trong tình huống thực.',
 '{"easy": "Đếm mặt/cạnh/đỉnh", "medium": "Kích thước", "hard": "Tình huống thực"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-59', 'Hình lập phương', 'hinh_hoc', 22, 33,
 'Sinh bài tập về Hình lập phương (đếm mặt, cạnh, đỉnh; cạnh bằng nhau), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đặc điểm hình lập phương.
Medium: Tính các đại lượng khi biết cạnh.
Hard: Bài toán xếp khối.',
 '{"easy": "Đặc điểm", "medium": "Tính từ cạnh", "hard": "Xếp khối"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-61', 'Diện tích xung quanh và toàn phần', 'hinh_hoc', 23, 34,
 'Sinh bài tập về Diện tích xung quanh và toàn phần hình hộp chữ nhật và lập phương, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính Sxq, Stp khi biết kích thước.
Medium: Tìm 1 kích thước khi biết Sxq.
Hard: Bài toán sơn nhà, dán giấy.',
 '{"easy": "Tính Sxq, Stp", "medium": "Tìm kích thước", "hard": "Sơn, dán giấy"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-62', 'Thể tích. Xăng-ti-mét khối', 'do_luong', 23, 35,
 'Sinh bài tập về Thể tích và đơn vị xăng-ti-mét khối (cm³), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đếm số khối cm³ trong hình.
Medium: So sánh thể tích các hình.
Hard: Bài toán đổ nước.',
 '{"easy": "Đếm khối", "medium": "So sánh", "hard": "Đổ nước"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-65', 'Đơn vị đo thể tích: dm³, m³', 'do_luong', 24, 36,
 'Sinh bài tập về Đơn vị đo thể tích dm³, m³ (1 dm³ = 1000 cm³ = 1 lít; 1 m³ = 1000 dm³), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đổi tròn.
Medium: Đa bước.
Hard: Bài toán bể nước, xe tải.',
 '{"easy": "Đổi tròn", "medium": "Đa bước", "hard": "Bể nước"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-66', 'Thể tích hình hộp chữ nhật', 'hinh_hoc', 24, 37,
 'Sinh bài tập về Thể tích hình hộp chữ nhật (V = a × b × c), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính V khi biết 3 kích thước.
Medium: Tìm 1 kích thước khi biết V và 2 kích thước.
Hard: Bài toán bể nước, container.',
 '{"easy": "Tính V", "medium": "Tìm kích thước", "hard": "Bể nước"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-67', 'Thể tích hình lập phương', 'hinh_hoc', 25, 38,
 'Sinh bài tập về Thể tích hình lập phương (V = a × a × a = a³), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính V khi biết cạnh.
Medium: Tìm cạnh khi biết V.
Hard: Bài toán xếp khối lập phương trong hộp lớn.',
 '{"easy": "Tính V", "medium": "Tìm cạnh", "hard": "Xếp khối"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-68', 'Bảng đơn vị đo thời gian', 'do_luong', 25, 39,
 'Sinh bài tập về Đơn vị đo thời gian (giờ-phút-giây, ngày-giờ, tuần-ngày, năm-tháng-ngày), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đổi đơn vị tròn.
Medium: Đổi đa bước.
Hard: Bài toán thời gian biểu, lịch.',
 '{"easy": "Đổi tròn", "medium": "Đa bước", "hard": "Lịch, thời gian biểu"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-69', 'Cộng, trừ số đo thời gian', 'do_luong', 26, 40,
 'Sinh bài tập về Cộng, trừ số đo thời gian, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Cộng/trừ giờ-phút đơn giản (không nhớ).
Medium: Có nhớ (60 phút = 1 giờ).
Hard: Bài toán đi từ nơi A tới nơi B.',
 '{"easy": "Không nhớ", "medium": "Có nhớ qua 60", "hard": "Bài toán đi A→B"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-70', 'Nhân, chia số đo thời gian', 'do_luong', 26, 41,
 'Sinh bài tập về Nhân, chia số đo thời gian với STN, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhân/chia đơn giản.
Medium: Cần đổi đơn vị qua 60.
Hard: Bài toán năng suất.',
 '{"easy": "Đơn giản", "medium": "Đổi đơn vị 60", "hard": "Năng suất"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-72', 'Vận tốc', 'so_hoc', 27, 42,
 'Sinh bài tập về Vận tốc (v = s : t), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính vận tốc khi biết quãng đường và thời gian.
Medium: Đổi đơn vị (km/giờ ↔ m/giây).
Hard: Bài toán so sánh vận tốc nhiều phương tiện.',
 '{"easy": "Tính v", "medium": "Đổi đơn vị", "hard": "So sánh phương tiện"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-73', 'Quãng đường', 'so_hoc', 27, 43,
 'Sinh bài tập về Quãng đường (s = v × t), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính s khi biết v và t.
Medium: Đổi đơn vị thời gian.
Hard: Bài toán nhiều đoạn đường.',
 '{"easy": "Tính s", "medium": "Đổi đơn vị", "hard": "Nhiều đoạn"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-74', 'Thời gian', 'so_hoc', 28, 44,
 'Sinh bài tập về Tính Thời gian (t = s : v), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính t khi biết s và v.
Medium: Đổi đơn vị.
Hard: Bài toán có thời gian nghỉ.',
 '{"easy": "Tính t", "medium": "Đổi đơn vị", "hard": "Có nghỉ"}'::jsonb, 'co_ban'),

('toan', 5, 'canh_dieu', 2, 'C3', 'Hình học, đo lường, vận tốc', 'CD5-C3-75', 'Bài toán chuyển động đều', 'so_hoc', 28, 45,
 'Sinh bài tập về Bài toán chuyển động đều (cùng chiều, ngược chiều, đuổi nhau, gặp nhau), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: 1 vật chuyển động.
Medium: 2 vật ngược chiều gặp nhau.
Hard: 2 vật cùng chiều đuổi nhau.',
 '{"easy": "1 vật", "medium": "Ngược chiều gặp", "hard": "Cùng chiều đuổi"}'::jsonb, 'co_ban'),

-- Chương 4: Thống kê
('toan', 5, 'canh_dieu', 2, 'C4', 'Thống kê và xác suất', 'CD5-C4-79', 'Biểu đồ hình quạt tròn', 'thong_ke', 30, 46,
 'Sinh bài tập về Biểu đồ hình quạt tròn (đọc tỉ lệ phần trăm các thành phần), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc tỉ lệ phần trăm các phần.
Medium: Tính số lượng từ tỉ lệ.
Hard: Bài toán có lời văn dựa trên biểu đồ.',
 '{"easy": "Đọc %", "medium": "Tính số lượng", "hard": "Bài toán"}'::jsonb, 'co_ban'),

-- ============================================================
-- LỚP 5 — KẾT NỐI TRI THỨC
-- ============================================================

('toan', 5, 'kntt', 1, 'C1', 'Ôn tập và bổ sung', 'KN5-C1-01', 'Ôn tập số tự nhiên', 'so_hoc', 1, 1,
 'Sinh bài tập về Ôn tập STN (đọc, viết, so sánh, làm tròn), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc, viết.
Medium: So sánh, sắp xếp.
Hard: Tìm theo điều kiện.',
 '{"easy": "Đọc viết", "medium": "So sánh", "hard": "Theo điều kiện"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 1, 'C1', 'Ôn tập và bổ sung', 'KN5-C1-02', 'Ôn tập các phép tính với số tự nhiên', 'so_hoc', 1, 2,
 'Sinh bài tập về 4 phép tính với STN (đến triệu), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: 4 phép tính cơ bản.
Medium: Có nhớ, biểu thức.
Hard: Bài toán 2-3 bước.',
 '{"easy": "4 phép tính", "medium": "Có nhớ, biểu thức", "hard": "Bài toán"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 1, 'C1', 'Ôn tập và bổ sung', 'KN5-C1-03', 'Ôn tập phân số', 'so_hoc', 2, 3,
 'Sinh bài tập về Ôn tập phân số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Rút gọn, quy đồng.
Medium: So sánh, 4 phép tính.
Hard: Biểu thức phân số.',
 '{"easy": "Rút gọn, quy đồng", "medium": "So sánh, phép tính", "hard": "Biểu thức"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 1, 'C1', 'Ôn tập và bổ sung', 'KN5-C1-04', 'Phân số thập phân', 'so_hoc', 2, 4,
 'Sinh bài tập về Phân số thập phân (mẫu là 10ⁿ), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết.
Medium: Đổi phân số ↔ thập phân.
Hard: Áp dụng vào số thập phân.',
 '{"easy": "Nhận biết", "medium": "Đổi qua lại", "hard": "Vào STP"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 1, 'C1', 'Ôn tập và bổ sung', 'KN5-C1-07', 'Hỗn số', 'so_hoc', 3, 5,
 'Sinh bài tập về Hỗn số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc, viết, đổi từ phân số.
Medium: Đổi sang phân số. So sánh.
Hard: Cộng trừ, bài toán.',
 '{"easy": "Đọc viết, đổi", "medium": "Sang phân số, so sánh", "hard": "Cộng trừ, bài toán"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 1, 'C2', 'Số thập phân', 'KN5-C2-10', 'Khái niệm số thập phân', 'so_hoc', 4, 6,
 'Sinh bài tập về Khái niệm số thập phân, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc, viết STP.
Medium: Phân tích phần nguyên + thập phân.
Hard: Viết STP từ điều kiện.',
 '{"easy": "Đọc viết", "medium": "Phân tích", "hard": "Từ điều kiện"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 1, 'C2', 'Số thập phân', 'KN5-C2-11', 'So sánh số thập phân', 'so_hoc', 5, 7,
 'Sinh bài tập về So sánh số thập phân, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: So sánh 2 số.
Medium: Sắp xếp 4-5 số.
Hard: Tìm chữ số thiếu.',
 '{"easy": "So sánh 2 số", "medium": "Sắp xếp", "hard": "Chữ số thiếu"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 1, 'C2', 'Số thập phân', 'KN5-C2-12', 'Viết số đo dưới dạng số thập phân', 'so_hoc', 5, 8,
 'Sinh bài tập về Viết số đo dưới dạng STP (vd: 3 m 5 cm = 3.05 m), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đổi đơn vị độ dài.
Medium: Đổi đơn vị khối lượng, diện tích.
Hard: Bài toán có lời văn.',
 '{"easy": "Độ dài", "medium": "Khối lượng/diện tích", "hard": "Bài toán"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 1, 'C2', 'Số thập phân', 'KN5-C2-13', 'Làm tròn số thập phân', 'so_hoc', 6, 9,
 'Sinh bài tập về Làm tròn số thập phân, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tròn đến phần mười.
Medium: Trăm, nghìn.
Hard: Ước lượng.',
 '{"easy": "Phần mười", "medium": "Trăm, nghìn", "hard": "Ước lượng"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 1, 'C3', 'Đơn vị diện tích', 'KN5-C3-15', 'Ki-lô-mét vuông. Héc-ta', 'do_luong', 7, 10,
 'Sinh bài tập về km² và ha, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đổi tròn.
Medium: Đa bước.
Hard: Diện tích đất đai.',
 '{"easy": "Đổi tròn", "medium": "Đa bước", "hard": "Đất đai"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 1, 'C4', 'Phép tính số thập phân', 'KN5-C4-19', 'Cộng số thập phân', 'so_hoc', 9, 11,
 'Sinh bài tập về Cộng STP, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Cùng phần thập phân.
Medium: Khác phần.
Hard: Nhiều số, bài toán.',
 '{"easy": "Cùng phần", "medium": "Khác phần", "hard": "Nhiều số"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 1, 'C4', 'Phép tính số thập phân', 'KN5-C4-20', 'Trừ số thập phân', 'so_hoc', 9, 12,
 'Sinh bài tập về Trừ STP, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đơn giản.
Medium: Có nhớ, tìm x.
Hard: Bài toán.',
 '{"easy": "Đơn giản", "medium": "Có nhớ", "hard": "Bài toán"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 1, 'C4', 'Phép tính số thập phân', 'KN5-C4-21', 'Nhân số thập phân với số tự nhiên', 'so_hoc', 10, 13,
 'Sinh bài tập về Nhân STP với STN, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Không nhớ.
Medium: Có nhớ.
Hard: Bài toán.',
 '{"easy": "Không nhớ", "medium": "Có nhớ", "hard": "Bài toán"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 1, 'C4', 'Phép tính số thập phân', 'KN5-C4-22', 'Nhân số thập phân với số thập phân', 'so_hoc', 10, 14,
 'Sinh bài tập về Nhân STP × STP, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đơn giản.
Medium: Đặt dấu phẩy.
Hard: Bài toán giá/diện tích.',
 '{"easy": "Đơn giản", "medium": "Đặt dấu phẩy", "hard": "Giá/diện tích"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 1, 'C4', 'Phép tính số thập phân', 'KN5-C4-23', 'Nhân, chia số thập phân với 10, 100, 1 000', 'so_hoc', 11, 15,
 'Sinh bài tập về Nhân/chia STP với 10, 100, 1000 (dịch dấu phẩy), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: × và : 10.
Medium: × và : 100, 1000.
Hard: Đổi đơn vị.',
 '{"easy": "× ÷ 10", "medium": "× ÷ 100, 1000", "hard": "Đổi đơn vị"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 1, 'C4', 'Phép tính số thập phân', 'KN5-C4-24', 'Chia số thập phân', 'so_hoc', 11, 16,
 'Sinh bài tập về Chia STP cho STN và STP, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Chia hết STN.
Medium: Cần thêm 0; chia STP.
Hard: Bài toán có lời văn.',
 '{"easy": "Chia hết STN", "medium": "Thêm 0, chia STP", "hard": "Bài toán"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 1, 'C5', 'Hình phẳng', 'KN5-C5-25', 'Hình tam giác. Diện tích hình tam giác', 'hinh_hoc', 12, 17,
 'Sinh bài tập về Hình tam giác và diện tích (S = a×h/2), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết. Tính S khi biết đáy, cao.
Medium: Tìm đáy/cao khi biết S.
Hard: Bài toán đất.',
 '{"easy": "Nhận biết, tính S", "medium": "Tìm đáy/cao", "hard": "Bài toán đất"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 1, 'C5', 'Hình phẳng', 'KN5-C5-26', 'Hình thang. Diện tích hình thang', 'hinh_hoc', 12, 18,
 'Sinh bài tập về Hình thang và diện tích S = (a+b)×h/2, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết. Tính S.
Medium: Tìm 1 đáy.
Hard: Bài toán mảnh đất hình thang.',
 '{"easy": "Tính S", "medium": "Tìm đáy", "hard": "Bài toán đất"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 1, 'C5', 'Hình phẳng', 'KN5-C5-27', 'Đường tròn. Chu vi và diện tích hình tròn', 'hinh_hoc', 13, 19,
 'Sinh bài tập về Hình tròn (C = 2πr, S = πr², π ≈ 3.14), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính C, S khi biết bán kính.
Medium: Đường kính → bán kính → C, S.
Hard: Bài toán bánh xe, hình quạt.',
 '{"easy": "Từ bán kính", "medium": "Từ đường kính", "hard": "Bánh xe, quạt"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C7', 'Tỉ số và bài toán liên quan', 'KN5-C7-36', 'Tỉ số. Tỉ số phần trăm', 'so_hoc', 19, 20,
 'Sinh bài tập về Tỉ số và Tỉ số phần trăm, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Viết tỉ số. Đổi phân số ↔ %.
Medium: Đổi STP ↔ %. Rút gọn tỉ số.
Hard: Bài toán so sánh.',
 '{"easy": "Viết tỉ số, %", "medium": "Đổi STP, rút gọn", "hard": "So sánh"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C7', 'Tỉ số và bài toán liên quan', 'KN5-C7-37', 'Tỉ lệ bản đồ và ứng dụng', 'so_hoc', 19, 21,
 'Sinh bài tập về Tỉ lệ bản đồ, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc tỉ lệ. Tính khoảng cách thực.
Medium: Tính khoảng cách bản đồ.
Hard: Bài toán địa lý.',
 '{"easy": "Đọc, tính thực", "medium": "Tính bản đồ", "hard": "Địa lý"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C7', 'Tỉ số và bài toán liên quan', 'KN5-C7-38', 'Tìm hai số khi biết tổng và tỉ số', 'so_hoc', 20, 22,
 'Sinh bài tập về Tìm 2 số biết tổng và tỉ, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tỉ đơn giản.
Medium: Tỉ phức tạp.
Hard: Bài toán lời văn.',
 '{"easy": "Tỉ đơn giản", "medium": "Tỉ phức tạp", "hard": "Bài toán"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C7', 'Tỉ số và bài toán liên quan', 'KN5-C7-39', 'Tìm hai số khi biết hiệu và tỉ số', 'so_hoc', 20, 23,
 'Sinh bài tập về Tìm 2 số biết hiệu và tỉ, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tỉ đơn giản.
Medium: Tỉ phức tạp.
Hard: Bài toán lời văn.',
 '{"easy": "Tỉ đơn giản", "medium": "Tỉ phức tạp", "hard": "Bài toán"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C7', 'Tỉ số và bài toán liên quan', 'KN5-C7-40', 'Tìm tỉ số phần trăm của hai số', 'so_hoc', 21, 24,
 'Sinh bài tập về Tìm tỉ số phần trăm của 2 số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: a/b × 100% đơn giản.
Medium: Có dấu phẩy.
Hard: Bài toán xếp loại.',
 '{"easy": "Đơn giản", "medium": "Có dấu phẩy", "hard": "Xếp loại"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C7', 'Tỉ số và bài toán liên quan', 'KN5-C7-41', 'Tìm giá trị phần trăm của một số', 'so_hoc', 21, 25,
 'Sinh bài tập về Tìm giá trị phần trăm của 1 số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: 50, 25, 10% tròn.
Medium: Tỉ bất kỳ.
Hard: Giảm giá, lãi suất.',
 '{"easy": "50, 25, 10%", "medium": "Tỉ bất kỳ", "hard": "Giảm giá, lãi"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C8', 'Hình khối, thể tích', 'KN5-C8-44', 'Hình hộp chữ nhật và hình lập phương', 'hinh_hoc', 23, 26,
 'Sinh bài tập về Đặc điểm hình hộp chữ nhật và lập phương, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đếm mặt, cạnh, đỉnh.
Medium: Diện tích xq, tp.
Hard: Bài toán sơn nhà.',
 '{"easy": "Đếm", "medium": "Sxq, Stp", "hard": "Sơn nhà"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C8', 'Hình khối, thể tích', 'KN5-C8-46', 'Xăng-ti-mét khối. Đề-xi-mét khối', 'do_luong', 24, 27,
 'Sinh bài tập về Đơn vị thể tích cm³, dm³ (1 dm³ = 1000 cm³ = 1 lít), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đổi tròn.
Medium: Đa bước.
Hard: Bài toán bể nước.',
 '{"easy": "Tròn", "medium": "Đa bước", "hard": "Bể nước"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C8', 'Hình khối, thể tích', 'KN5-C8-47', 'Mét khối', 'do_luong', 24, 28,
 'Sinh bài tập về Mét khối (1 m³ = 1000 dm³), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đổi tròn.
Medium: Đa bước.
Hard: Bể nước, container.',
 '{"easy": "Tròn", "medium": "Đa bước", "hard": "Bể nước"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C8', 'Hình khối, thể tích', 'KN5-C8-48', 'Thể tích hình hộp chữ nhật', 'hinh_hoc', 25, 29,
 'Sinh bài tập về V = a × b × c, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính V.
Medium: Tìm 1 kích thước.
Hard: Bài toán bể, hộp.',
 '{"easy": "Tính V", "medium": "Tìm kích thước", "hard": "Bể, hộp"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C8', 'Hình khối, thể tích', 'KN5-C8-49', 'Thể tích hình lập phương', 'hinh_hoc', 25, 30,
 'Sinh bài tập về V = a³, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính V.
Medium: Tìm cạnh.
Hard: Xếp khối.',
 '{"easy": "Tính V", "medium": "Tìm cạnh", "hard": "Xếp khối"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C9', 'Thời gian, vận tốc', 'KN5-C9-52', 'Bảng đơn vị đo thời gian', 'do_luong', 27, 31,
 'Sinh bài tập về Đơn vị thời gian, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đổi tròn.
Medium: Đa bước.
Hard: Lịch, biểu thời gian.',
 '{"easy": "Tròn", "medium": "Đa bước", "hard": "Lịch"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C9', 'Thời gian, vận tốc', 'KN5-C9-53', 'Cộng, trừ số đo thời gian', 'do_luong', 27, 32,
 'Sinh bài tập về Cộng trừ thời gian, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Không nhớ.
Medium: Có nhớ qua 60.
Hard: Bài toán A→B.',
 '{"easy": "Không nhớ", "medium": "Có nhớ", "hard": "A→B"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C9', 'Thời gian, vận tốc', 'KN5-C9-54', 'Nhân, chia số đo thời gian', 'do_luong', 28, 33,
 'Sinh bài tập về Nhân, chia thời gian với STN, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đơn giản.
Medium: Đổi đơn vị.
Hard: Năng suất.',
 '{"easy": "Đơn giản", "medium": "Đổi đơn vị", "hard": "Năng suất"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C9', 'Thời gian, vận tốc', 'KN5-C9-55', 'Vận tốc', 'so_hoc', 28, 34,
 'Sinh bài tập về v = s : t, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính v.
Medium: Đổi đơn vị.
Hard: So sánh phương tiện.',
 '{"easy": "Tính v", "medium": "Đổi đơn vị", "hard": "So sánh"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C9', 'Thời gian, vận tốc', 'KN5-C9-56', 'Quãng đường', 'so_hoc', 29, 35,
 'Sinh bài tập về s = v × t, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính s.
Medium: Đổi đơn vị.
Hard: Nhiều đoạn.',
 '{"easy": "Tính s", "medium": "Đổi đơn vị", "hard": "Nhiều đoạn"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C9', 'Thời gian, vận tốc', 'KN5-C9-57', 'Thời gian', 'so_hoc', 29, 36,
 'Sinh bài tập về t = s : v, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính t.
Medium: Đổi đơn vị.
Hard: Có nghỉ.',
 '{"easy": "Tính t", "medium": "Đổi đơn vị", "hard": "Có nghỉ"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C9', 'Thời gian, vận tốc', 'KN5-C9-58', 'Bài toán chuyển động đều', 'so_hoc', 30, 37,
 'Sinh bài tập về Chuyển động đều (cùng/ngược chiều, đuổi nhau, gặp nhau), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: 1 vật.
Medium: Ngược chiều gặp.
Hard: Cùng chiều đuổi.',
 '{"easy": "1 vật", "medium": "Ngược chiều", "hard": "Cùng chiều đuổi"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C10', 'Thống kê', 'KN5-C10-62', 'Biểu đồ hình quạt tròn', 'thong_ke', 31, 38,
 'Sinh bài tập về Biểu đồ hình quạt tròn, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc %.
Medium: Tính số lượng.
Hard: Bài toán.',
 '{"easy": "Đọc %", "medium": "Tính số lượng", "hard": "Bài toán"}'::jsonb, 'co_ban'),

('toan', 5, 'kntt', 2, 'C10', 'Thống kê', 'KN5-C10-65', 'Tỉ số của số lần lặp lại sự kiện', 'thong_ke', 32, 39,
 'Sinh bài tập về Tỉ số của số lần lặp lại sự kiện trên tổng số lần thực hiện, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đếm và tính tỉ số đơn giản.
Medium: So sánh tỉ số 2 sự kiện.
Hard: Bài toán xác suất sơ cấp.',
 '{"easy": "Đếm tỉ số đơn giản", "medium": "So sánh 2 sự kiện", "hard": "Xác suất sơ cấp"}'::jsonb, 'co_ban');
