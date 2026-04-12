-- ============================================================
-- VuiToan3 Curriculum Seed Data
-- Migration 002: Seed all 53 topics from Cánh Diều Grade 3
-- ============================================================

INSERT INTO curriculum_topics
    (id, subject, grade, series, semester, chapter_code, chapter_name, topic_code, topic_name, skill_type, week_suggestion, sort_order, ai_prompt_template, difficulty_levels)
VALUES

-- ============================================================
-- SEMESTER 1 (HK1)
-- Chapter 1: Bảng nhân, bảng chia (Tuần 1-18)
-- ============================================================

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-01',
 'Ôn tập số trong phạm vi 1000', 'so_hoc', 1, 1,
 'Sinh bài tập về Ôn tập số trong phạm vi 1000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc, viết các số tròn chục, tròn trăm trong phạm vi 1000. So sánh hai số đơn giản.
Medium: So sánh và sắp xếp 3-4 số. Tìm số liền trước, liền sau. Phân tích số thành hàng trăm, chục, đơn vị.
Hard: Tìm số thỏa mãn điều kiện cho trước (lớn hơn X, nhỏ hơn Y, có chữ số hàng chục là Z). Bài toán có lời văn về so sánh số.',
 '{"easy": "Đọc, viết, so sánh số đơn giản trong phạm vi 1000", "medium": "Sắp xếp số, phân tích số thành các hàng", "hard": "Tìm số theo điều kiện, bài toán có lời văn"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-02',
 'Ôn tập cộng, trừ phạm vi 1000', 'so_hoc', 1, 2,
 'Sinh bài tập về Ôn tập cộng, trừ trong phạm vi 1000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Phép cộng, trừ không nhớ trong phạm vi 1000.
Medium: Phép cộng, trừ có nhớ 1 lần. Tìm thành phần chưa biết của phép tính.
Hard: Phép cộng, trừ có nhớ 2 lần. Bài toán có lời văn 2 bước tính.',
 '{"easy": "Cộng trừ không nhớ", "medium": "Cộng trừ có nhớ 1 lần, tìm x", "hard": "Cộng trừ có nhớ 2 lần, bài toán 2 bước"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-03',
 'Ôn tập hình học và đo lường', 'hinh_hoc', 1, 3,
 'Sinh bài tập về Ôn tập hình học và đo lường, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết các hình đã học (hình vuông, hình chữ nhật, hình tam giác). Đo độ dài đoạn thẳng bằng cm.
Medium: Tính độ dài đường gấp khúc. Đổi đơn vị cm và dm.
Hard: Vẽ hình theo yêu cầu. Bài toán thực tế về đo lường.',
 '{"easy": "Nhận biết hình, đo đoạn thẳng", "medium": "Tính đường gấp khúc, đổi đơn vị", "hard": "Vẽ hình, bài toán thực tế"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-04',
 'Mi-li-mét (mm)', 'do_luong', 2, 4,
 'Sinh bài tập về Mi-li-mét (mm), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đổi cm sang mm và ngược lại với số tròn (1cm = 10mm, 2cm = ?mm).
Medium: Đổi đơn vị có kèm phép tính (15mm + 25mm = ?cm ?mm). So sánh độ dài với đơn vị khác nhau.
Hard: Bài toán có lời văn về đo lường sử dụng mm trong thực tế (bề dày sách, chiều dài con kiến).',
 '{"easy": "Đổi đơn vị cm-mm đơn giản", "medium": "Đổi đơn vị kèm phép tính, so sánh", "hard": "Bài toán thực tế về mm"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-05',
 'Bảng nhân 2, bảng nhân 5', 'so_hoc', 2, 5,
 'Sinh bài tập về Bảng nhân 2 và bảng nhân 5, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính trực tiếp phép nhân (2 x 6 = ?, 5 x 4 = ?).
Medium: Tìm thừa số chưa biết (2 x ? = 14, ? x 5 = 35). So sánh hai tích.
Hard: Bài toán có lời văn sử dụng phép nhân 2 hoặc 5 (mỗi bàn có 2 bạn, có 7 bàn, hỏi có bao nhiêu bạn).',
 '{"easy": "Tính nhân trực tiếp", "medium": "Tìm thừa số, so sánh tích", "hard": "Bài toán có lời văn"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-06',
 'Bảng nhân 3', 'so_hoc', 3, 6,
 'Sinh bài tập về Bảng nhân 3, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính trực tiếp phép nhân 3 (3 x 5 = ?, 3 x 9 = ?).
Medium: Tìm thừa số chưa biết (3 x ? = 21). So sánh các tích trong bảng nhân 3.
Hard: Bài toán có lời văn: mỗi hộp có 3 cái bánh, có 8 hộp, hỏi có bao nhiêu cái bánh.',
 '{"easy": "Tính nhân 3 trực tiếp", "medium": "Tìm thừa số, so sánh", "hard": "Bài toán có lời văn với nhân 3"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-07',
 'Bảng nhân 4', 'so_hoc', 4, 7,
 'Sinh bài tập về Bảng nhân 4, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính trực tiếp phép nhân 4 (4 x 3 = ?, 4 x 7 = ?).
Medium: Tìm thừa số chưa biết (4 x ? = 28). Điền số thích hợp vào ô trống.
Hard: Bài toán có lời văn: mỗi xe có 4 bánh, có 6 xe, hỏi có bao nhiêu bánh xe.',
 '{"easy": "Tính nhân 4 trực tiếp", "medium": "Tìm thừa số, điền ô trống", "hard": "Bài toán có lời văn với nhân 4"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-08',
 'Bảng nhân 6', 'so_hoc', 5, 8,
 'Sinh bài tập về Bảng nhân 6, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính trực tiếp phép nhân 6 (6 x 4 = ?, 6 x 8 = ?).
Medium: Tìm thừa số chưa biết (6 x ? = 42). So sánh tích nhân 6 với nhân 3.
Hard: Bài toán có lời văn kết hợp nhân 6 với phép tính khác.',
 '{"easy": "Tính nhân 6 trực tiếp", "medium": "Tìm thừa số, so sánh với bảng nhân khác", "hard": "Bài toán có lời văn phức hợp"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-09',
 'Gấp một số lên một số lần', 'toan_do', 6, 9,
 'Sinh bài tập về Gấp một số lên một số lần, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Gấp số đã cho lên 2, 3, 4 lần (gấp 5 lên 3 lần được bao nhiêu?).
Medium: Tìm số ban đầu khi biết kết quả gấp. Bài tập so sánh gấp lên với cộng thêm.
Hard: Bài toán có lời văn 2 bước: gấp lên rồi cộng hoặc trừ thêm.',
 '{"easy": "Gấp số đơn giản", "medium": "Tìm số ban đầu, phân biệt gấp và cộng", "hard": "Bài toán 2 bước có gấp"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-10',
 'Bảng nhân 7', 'so_hoc', 7, 10,
 'Sinh bài tập về Bảng nhân 7, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính trực tiếp phép nhân 7 (7 x 3 = ?, 7 x 6 = ?).
Medium: Tìm thừa số chưa biết (7 x ? = 49). Sắp xếp các tích theo thứ tự.
Hard: Bài toán có lời văn: mỗi tuần có 7 ngày, hỏi 5 tuần có bao nhiêu ngày.',
 '{"easy": "Tính nhân 7 trực tiếp", "medium": "Tìm thừa số, sắp xếp tích", "hard": "Bài toán có lời văn với nhân 7"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-11',
 'Bảng nhân 8', 'so_hoc', 8, 11,
 'Sinh bài tập về Bảng nhân 8, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính trực tiếp phép nhân 8 (8 x 4 = ?, 8 x 7 = ?).
Medium: Tìm thừa số chưa biết (8 x ? = 56). Mối liên hệ nhân 8 và nhân 4.
Hard: Bài toán có lời văn: mỗi con bạch tuộc có 8 xúc tu, 6 con có bao nhiêu xúc tu.',
 '{"easy": "Tính nhân 8 trực tiếp", "medium": "Tìm thừa số, liên hệ bảng nhân 4", "hard": "Bài toán có lời văn với nhân 8"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-12',
 'Bảng nhân 9', 'so_hoc', 9, 12,
 'Sinh bài tập về Bảng nhân 9, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính trực tiếp phép nhân 9 (9 x 3 = ?, 9 x 8 = ?).
Medium: Tìm thừa số chưa biết (9 x ? = 63). Quy luật tổng các chữ số trong tích nhân 9.
Hard: Bài toán có lời văn: mỗi đội có 9 người, 4 đội có bao nhiêu người. Tìm quy luật.',
 '{"easy": "Tính nhân 9 trực tiếp", "medium": "Tìm thừa số, khám phá quy luật nhân 9", "hard": "Bài toán có lời văn, tìm quy luật"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-13',
 'Gam (g) — đơn vị đo khối lượng', 'do_luong', 10, 13,
 'Sinh bài tập về đơn vị đo khối lượng Gam (g), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đổi kg sang g và ngược lại (1kg = 1000g, 2kg = ?g).
Medium: So sánh khối lượng với đơn vị khác nhau (500g ... 1kg). Phép tính với gam.
Hard: Bài toán thực tế: quả cam nặng 200g, mua 5 quả, tổng nặng bao nhiêu kg bao nhiêu g.',
 '{"easy": "Đổi kg-g đơn giản", "medium": "So sánh khối lượng, tính toán với g", "hard": "Bài toán thực tế về cân nặng"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-14',
 'Bảng chia 2, bảng chia 5', 'so_hoc', 11, 14,
 'Sinh bài tập về Bảng chia 2 và bảng chia 5, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính trực tiếp phép chia (12 : 2 = ?, 30 : 5 = ?).
Medium: Tìm số bị chia hoặc số chia (? : 2 = 7, 45 : ? = 9). Mối liên hệ nhân-chia.
Hard: Bài toán có lời văn: chia đều 18 viên kẹo cho 2 bạn, mỗi bạn được mấy viên.',
 '{"easy": "Tính chia trực tiếp", "medium": "Tìm thành phần, liên hệ nhân-chia", "hard": "Bài toán chia đều có lời văn"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-15',
 'Bảng chia 3', 'so_hoc', 11, 15,
 'Sinh bài tập về Bảng chia 3, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính trực tiếp phép chia 3 (15 : 3 = ?, 27 : 3 = ?).
Medium: Tìm số bị chia (? : 3 = 8). Liên hệ bảng nhân 3 và bảng chia 3.
Hard: Bài toán có lời văn: chia 24 quả táo đều vào 3 rổ, mỗi rổ có mấy quả.',
 '{"easy": "Tính chia 3 trực tiếp", "medium": "Tìm thành phần, liên hệ nhân 3", "hard": "Bài toán chia đều có lời văn"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-16',
 'Bảng chia 4', 'so_hoc', 12, 16,
 'Sinh bài tập về Bảng chia 4, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính trực tiếp phép chia 4 (20 : 4 = ?, 36 : 4 = ?).
Medium: Tìm thành phần chưa biết. So sánh chia 4 và chia 2 (chia 4 = chia 2 hai lần).
Hard: Bài toán có lời văn: có 32 học sinh xếp thành 4 hàng, mỗi hàng có mấy học sinh.',
 '{"easy": "Tính chia 4 trực tiếp", "medium": "Tìm thành phần, liên hệ chia 2", "hard": "Bài toán xếp hàng, chia nhóm"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-17',
 'Bảng chia 6', 'so_hoc', 13, 17,
 'Sinh bài tập về Bảng chia 6, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính trực tiếp phép chia 6 (24 : 6 = ?, 48 : 6 = ?).
Medium: Tìm thành phần chưa biết. So sánh chia 6 với chia 2 và chia 3.
Hard: Bài toán có lời văn phức hợp sử dụng phép chia 6.',
 '{"easy": "Tính chia 6 trực tiếp", "medium": "Tìm thành phần, liên hệ chia 2 và chia 3", "hard": "Bài toán có lời văn phức hợp"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-18',
 'Giảm một số đi một số lần', 'toan_do', 13, 18,
 'Sinh bài tập về Giảm một số đi một số lần, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Giảm số đã cho đi 2, 3, 4 lần (giảm 24 đi 3 lần được bao nhiêu?).
Medium: Phân biệt giảm đi một số lần và bớt đi một số. Tìm số ban đầu.
Hard: Bài toán có lời văn 2 bước: giảm đi rồi cộng thêm hoặc so sánh.',
 '{"easy": "Giảm số đơn giản", "medium": "Phân biệt giảm lần và bớt, tìm số ban đầu", "hard": "Bài toán 2 bước có giảm"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-19',
 'Bảng chia 7', 'so_hoc', 14, 19,
 'Sinh bài tập về Bảng chia 7, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính trực tiếp phép chia 7 (21 : 7 = ?, 56 : 7 = ?).
Medium: Tìm thành phần chưa biết. Chuỗi tính nhân chia liên hoàn.
Hard: Bài toán có lời văn: chia 49 quyển vở đều cho 7 bạn.',
 '{"easy": "Tính chia 7 trực tiếp", "medium": "Tìm thành phần, tính liên hoàn", "hard": "Bài toán chia đều có lời văn"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-20',
 'Bảng chia 8', 'so_hoc', 15, 20,
 'Sinh bài tập về Bảng chia 8, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính trực tiếp phép chia 8 (32 : 8 = ?, 64 : 8 = ?).
Medium: Tìm thành phần chưa biết. Liên hệ chia 8 với chia 4 và chia 2.
Hard: Bài toán có lời văn về chia nhóm, xếp hàng với số 8.',
 '{"easy": "Tính chia 8 trực tiếp", "medium": "Tìm thành phần, liên hệ chia 4", "hard": "Bài toán chia nhóm có lời văn"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-21',
 'Bảng chia 9', 'so_hoc', 16, 21,
 'Sinh bài tập về Bảng chia 9, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính trực tiếp phép chia 9 (36 : 9 = ?, 72 : 9 = ?).
Medium: Tìm thành phần chưa biết. Chuỗi phép tính nhân chia hỗn hợp.
Hard: Bài toán có lời văn: chia đều, so sánh kết quả chia 9 với bảng chia khác.',
 '{"easy": "Tính chia 9 trực tiếp", "medium": "Tìm thành phần, tính hỗn hợp", "hard": "Bài toán so sánh, chia đều"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-22',
 'Một phần hai, một phần tư', 'so_hoc', 17, 22,
 'Sinh bài tập về Một phần hai (1/2) và một phần tư (1/4), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết 1/2, 1/4 qua hình ảnh (tô màu phần đã chia).
Medium: Tính 1/2 và 1/4 của một số (1/2 của 12 = ?, 1/4 của 20 = ?).
Hard: Bài toán có lời văn: chia bánh, chia kẹo thành phần bằng nhau.',
 '{"easy": "Nhận biết 1/2, 1/4 qua hình", "medium": "Tính 1/2, 1/4 của một số", "hard": "Bài toán chia phần bằng nhau"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C1', 'Bảng nhân, bảng chia', 'CD3-C1-23',
 'Một phần ba, năm, sáu, bảy, tám, chín', 'so_hoc', 18, 23,
 'Sinh bài tập về các phân số 1/3, 1/5, 1/6, 1/7, 1/8, 1/9, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết các phân số qua hình ảnh tô màu.
Medium: Tính 1/3, 1/5, 1/6... của một số cho trước.
Hard: Bài toán có lời văn: chia nhóm đồ vật thành các phần bằng nhau, so sánh các phân số.',
 '{"easy": "Nhận biết phân số qua hình", "medium": "Tính phân số của một số", "hard": "Bài toán chia nhóm, so sánh phân số"}'::jsonb),

-- ============================================================
-- SEMESTER 1 (HK1)
-- Chapter 2: Nhân, chia trong phạm vi 1000 (Tuần 19-27)
-- ============================================================

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C2', 'Nhân, chia trong phạm vi 1000', 'CD3-C2-01',
 'Nhân số tròn chục với số có 1 chữ số', 'so_hoc', 19, 24,
 'Sinh bài tập về Nhân số tròn chục với số có 1 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính trực tiếp (20 x 3 = ?, 40 x 2 = ?).
Medium: Tìm thừa số chưa biết (? x 4 = 120). So sánh các tích.
Hard: Bài toán có lời văn: mỗi túi có 30 viên bi, 5 túi có bao nhiêu viên bi.',
 '{"easy": "Nhân số tròn chục trực tiếp", "medium": "Tìm thừa số, so sánh", "hard": "Bài toán có lời văn"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C2', 'Nhân, chia trong phạm vi 1000', 'CD3-C2-02',
 'Nhân với số có 1 chữ số (không nhớ)', 'so_hoc', 20, 25,
 'Sinh bài tập về Nhân với số có 1 chữ số không nhớ, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đặt tính và tính (123 x 3 = ?, 211 x 4 = ?).
Medium: Tìm thừa số chưa biết. Sắp xếp các tích tăng dần.
Hard: Bài toán có lời văn 2 bước sử dụng phép nhân không nhớ.',
 '{"easy": "Đặt tính nhân không nhớ", "medium": "Tìm thừa số, sắp xếp", "hard": "Bài toán 2 bước"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C2', 'Nhân, chia trong phạm vi 1000', 'CD3-C2-03',
 'Phép chia hết, phép chia có dư', 'so_hoc', 21, 26,
 'Sinh bài tập về Phép chia hết và phép chia có dư, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Phân biệt chia hết và chia có dư (17 : 3 = 5 dư 2). Tính phép chia đơn giản.
Medium: Tìm số dư. Nhận biết khi nào chia hết. Điều kiện số dư < số chia.
Hard: Bài toán có lời văn: chia 25 kẹo cho 4 bạn, mỗi bạn được mấy viên, còn dư mấy viên.',
 '{"easy": "Tính chia hết và chia có dư đơn giản", "medium": "Tìm số dư, điều kiện chia hết", "hard": "Bài toán chia có dư thực tế"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C2', 'Nhân, chia trong phạm vi 1000', 'CD3-C2-04',
 'Chia số tròn chục, tròn trăm cho số có 1 chữ số', 'so_hoc', 22, 27,
 'Sinh bài tập về Chia số tròn chục, tròn trăm cho số có 1 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính trực tiếp (60 : 3 = ?, 400 : 2 = ?).
Medium: Tìm số bị chia (? : 4 = 50). Chia có dư với số tròn.
Hard: Bài toán có lời văn về chia đều số lượng lớn.',
 '{"easy": "Chia số tròn trực tiếp", "medium": "Tìm số bị chia, chia có dư", "hard": "Bài toán chia đều số lượng lớn"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C2', 'Nhân, chia trong phạm vi 1000', 'CD3-C2-05',
 'Chia cho số có 1 chữ số', 'so_hoc', 23, 28,
 'Sinh bài tập về Chia cho số có 1 chữ số trong phạm vi 1000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đặt tính và tính (396 : 3 = ?, 248 : 2 = ?).
Medium: Chia có dư. Tìm thành phần chưa biết trong phép chia.
Hard: Bài toán có lời văn 2 bước: chia rồi cộng hoặc so sánh.',
 '{"easy": "Đặt tính chia đơn giản", "medium": "Chia có dư, tìm thành phần", "hard": "Bài toán 2 bước"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C2', 'Nhân, chia trong phạm vi 1000', 'CD3-C2-06',
 'Nhân với số có 1 chữ số (có nhớ)', 'so_hoc', 24, 29,
 'Sinh bài tập về Nhân với số có 1 chữ số có nhớ, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đặt tính nhân có nhớ 1 lần (125 x 4 = ?, 216 x 3 = ?).
Medium: Nhân có nhớ 2 lần. Tìm thừa số chưa biết.
Hard: Bài toán có lời văn phức hợp: mỗi ngày đọc 125 trang, 4 ngày đọc bao nhiêu trang.',
 '{"easy": "Nhân có nhớ 1 lần", "medium": "Nhân có nhớ 2 lần, tìm thừa số", "hard": "Bài toán có lời văn phức hợp"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C2', 'Nhân, chia trong phạm vi 1000', 'CD3-C2-07',
 'Góc vuông, góc không vuông', 'hinh_hoc', 24, 30,
 'Sinh bài tập về Góc vuông và góc không vuông, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết góc vuông, góc không vuông trong hình vẽ.
Medium: Đếm số góc vuông trong một hình. Dùng ê-ke kiểm tra góc vuông.
Hard: Tìm góc vuông trong các hình thực tế (cửa sổ, bảng, sách). Vẽ hình có góc vuông theo yêu cầu.',
 '{"easy": "Nhận biết góc vuông qua hình", "medium": "Đếm góc vuông, dùng ê-ke", "hard": "Tìm góc vuông thực tế, vẽ hình"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C2', 'Nhân, chia trong phạm vi 1000', 'CD3-C2-08',
 'Hình tam giác, hình tứ giác', 'hinh_hoc', 25, 31,
 'Sinh bài tập về Hình tam giác và hình tứ giác, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết hình tam giác, hình tứ giác. Đếm số cạnh, số góc.
Medium: Phân loại các hình tứ giác. Vẽ hình tam giác, tứ giác trên lưới ô vuông.
Hard: Đếm số hình tam giác, tứ giác trong hình phức hợp. Ghép hình.',
 '{"easy": "Nhận biết hình, đếm cạnh góc", "medium": "Phân loại, vẽ trên lưới ô vuông", "hard": "Đếm hình phức hợp, ghép hình"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C2', 'Nhân, chia trong phạm vi 1000', 'CD3-C2-09',
 'Chu vi hình tam giác, hình tứ giác', 'hinh_hoc', 25, 32,
 'Sinh bài tập về Chu vi hình tam giác và hình tứ giác, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính chu vi khi biết độ dài các cạnh (tam giác 3 cạnh, tứ giác 4 cạnh).
Medium: Tìm độ dài cạnh khi biết chu vi và các cạnh còn lại.
Hard: Bài toán thực tế: tính chu vi mảnh đất, viền khung tranh. So sánh chu vi hai hình.',
 '{"easy": "Tính chu vi khi biết các cạnh", "medium": "Tìm cạnh khi biết chu vi", "hard": "Bài toán thực tế về chu vi"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C2', 'Nhân, chia trong phạm vi 1000', 'CD3-C2-10',
 'Điểm ở giữa, trung điểm đoạn thẳng', 'hinh_hoc', 26, 33,
 'Sinh bài tập về Điểm ở giữa và trung điểm đoạn thẳng, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết điểm ở giữa hai điểm trên đoạn thẳng.
Medium: Xác định trung điểm đoạn thẳng. Đo và tìm trung điểm.
Hard: Bài tập kết hợp: tìm trung điểm rồi tính độ dài các đoạn. Ứng dụng thực tế.',
 '{"easy": "Nhận biết điểm ở giữa", "medium": "Xác định trung điểm, đo đạc", "hard": "Bài tập kết hợp trung điểm và tính toán"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C2', 'Nhân, chia trong phạm vi 1000', 'CD3-C2-11',
 'Chu vi hình chữ nhật, hình vuông', 'hinh_hoc', 26, 34,
 'Sinh bài tập về Chu vi hình chữ nhật và hình vuông, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính chu vi HCN (dài + rộng) x 2, chu vi HV = cạnh x 4 với số đơn giản.
Medium: Tìm cạnh khi biết chu vi. So sánh chu vi HCN và HV.
Hard: Bài toán thực tế: rào vườn, viền bảng. Bài toán 2 bước về chu vi.',
 '{"easy": "Tính chu vi với công thức", "medium": "Tìm cạnh từ chu vi, so sánh", "hard": "Bài toán thực tế 2 bước"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 1, 'C2', 'Nhân, chia trong phạm vi 1000', 'CD3-C2-12',
 'Khối hộp chữ nhật, khối lập phương', 'hinh_hoc', 27, 35,
 'Sinh bài tập về Khối hộp chữ nhật và khối lập phương, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết khối hộp CN và khối lập phương. Đếm số mặt, số cạnh, số đỉnh.
Medium: Phân biệt hình phẳng và hình khối. Nhận ra các mặt của khối hộp là hình gì.
Hard: Đếm số khối lập phương trong hình ghép. Liên hệ vật thực tế (hộp sữa, viên xúc xắc).',
 '{"easy": "Nhận biết hình khối, đếm mặt-cạnh-đỉnh", "medium": "Phân biệt phẳng-khối, nhận mặt", "hard": "Đếm khối trong hình ghép, liên hệ thực tế"}'::jsonb),

-- ============================================================
-- SEMESTER 2 (HK2)
-- Chapter 3: Các số trong phạm vi 10.000 (Tuần 20-28)
-- ============================================================

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 2, 'C3', 'Các số trong phạm vi 10.000', 'CD3-C3-01',
 'Các số có 4 chữ số — số 10.000', 'so_hoc', 20, 36,
 'Sinh bài tập về Các số có 4 chữ số và số 10.000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc, viết số có 4 chữ số. Phân tích số thành nghìn, trăm, chục, đơn vị.
Medium: So sánh, sắp xếp các số có 4 chữ số. Tìm số liền trước, liền sau.
Hard: Tìm số thỏa mãn nhiều điều kiện. Bài toán về dãy số có quy luật.',
 '{"easy": "Đọc, viết, phân tích số 4 chữ số", "medium": "So sánh, sắp xếp số 4 chữ số", "hard": "Tìm số theo điều kiện, dãy số quy luật"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 2, 'C3', 'Các số trong phạm vi 10.000', 'CD3-C3-02',
 'Cộng trong phạm vi 10.000', 'so_hoc', 21, 37,
 'Sinh bài tập về Cộng trong phạm vi 10.000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Cộng hai số có 4 chữ số không nhớ (1234 + 2345 = ?).
Medium: Cộng có nhớ 1-2 lần. Tìm số hạng chưa biết.
Hard: Bài toán có lời văn 2 bước dùng phép cộng trong phạm vi 10.000.',
 '{"easy": "Cộng không nhớ 4 chữ số", "medium": "Cộng có nhớ, tìm số hạng", "hard": "Bài toán 2 bước phạm vi 10.000"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 2, 'C3', 'Các số trong phạm vi 10.000', 'CD3-C3-03',
 'Trừ trong phạm vi 10.000', 'so_hoc', 22, 38,
 'Sinh bài tập về Trừ trong phạm vi 10.000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Trừ hai số có 4 chữ số không nhớ (5678 - 1234 = ?).
Medium: Trừ có nhớ 1-2 lần. Tìm số bị trừ hoặc số trừ.
Hard: Bài toán có lời văn 2 bước dùng phép trừ. Kết hợp cộng và trừ.',
 '{"easy": "Trừ không nhớ 4 chữ số", "medium": "Trừ có nhớ, tìm thành phần", "hard": "Bài toán 2 bước cộng trừ"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 2, 'C3', 'Các số trong phạm vi 10.000', 'CD3-C3-04',
 'Cộng, trừ, nhân, chia trong phạm vi 10.000', 'so_hoc', 23, 39,
 'Sinh bài tập về Bốn phép tính trong phạm vi 10.000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính giá trị biểu thức đơn giản có 1 phép tính.
Medium: Biểu thức có 2 phép tính, áp dụng thứ tự thực hiện (nhân chia trước, cộng trừ sau).
Hard: Biểu thức có ngoặc. Bài toán có lời văn cần dùng 2-3 phép tính.',
 '{"easy": "Biểu thức 1 phép tính", "medium": "Biểu thức 2 phép tính, thứ tự tính", "hard": "Biểu thức có ngoặc, bài toán nhiều bước"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 2, 'C3', 'Các số trong phạm vi 10.000', 'CD3-C3-05',
 'Đơn vị đo diện tích — cm²', 'do_luong', 24, 40,
 'Sinh bài tập về Đơn vị đo diện tích cm², độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đếm số ô vuông để tính diện tích (mỗi ô vuông = 1cm²).
Medium: So sánh diện tích hai hình. Phép tính với cm².
Hard: Bài toán thực tế: tính diện tích mặt bàn, trang giấy bằng cm².',
 '{"easy": "Đếm ô vuông tính diện tích", "medium": "So sánh diện tích, phép tính cm²", "hard": "Bài toán thực tế về diện tích"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 2, 'C3', 'Các số trong phạm vi 10.000', 'CD3-C3-06',
 'Diện tích hình chữ nhật, hình vuông', 'hinh_hoc', 25, 41,
 'Sinh bài tập về Diện tích hình chữ nhật và hình vuông, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Tính diện tích HCN = dài x rộng, HV = cạnh x cạnh với số đơn giản.
Medium: Tìm cạnh khi biết diện tích. So sánh diện tích HCN và HV.
Hard: Bài toán thực tế: lát gạch sân, trải thảm phòng. Bài toán kết hợp chu vi và diện tích.',
 '{"easy": "Tính diện tích với công thức", "medium": "Tìm cạnh từ diện tích, so sánh", "hard": "Bài toán thực tế lát gạch, kết hợp chu vi"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 2, 'C3', 'Các số trong phạm vi 10.000', 'CD3-C3-07',
 'Nhân số có 4 chữ số với số có 1 chữ số', 'so_hoc', 26, 42,
 'Sinh bài tập về Nhân số có 4 chữ số với số có 1 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đặt tính nhân không nhớ hoặc nhớ 1 lần (1234 x 2 = ?).
Medium: Nhân có nhớ nhiều lần. Tìm thừa số chưa biết.
Hard: Bài toán có lời văn: mỗi tháng tiết kiệm 1250 đồng, 4 tháng tiết kiệm bao nhiêu.',
 '{"easy": "Nhân 4 chữ số không nhớ hoặc nhớ 1 lần", "medium": "Nhân có nhớ nhiều lần, tìm thừa số", "hard": "Bài toán tiết kiệm, tính tổng"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 2, 'C3', 'Các số trong phạm vi 10.000', 'CD3-C3-08',
 'Chia số có 4 chữ số cho số có 1 chữ số', 'so_hoc', 27, 43,
 'Sinh bài tập về Chia số có 4 chữ số cho số có 1 chữ số, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đặt tính chia hết đơn giản (2468 : 2 = ?).
Medium: Chia có dư. Tìm số bị chia hoặc số chia.
Hard: Bài toán có lời văn: chia đều 3600 viên gạch xây 4 bức tường.',
 '{"easy": "Chia hết 4 chữ số đơn giản", "medium": "Chia có dư, tìm thành phần", "hard": "Bài toán chia đều có lời văn"}'::jsonb),

-- ============================================================
-- SEMESTER 2 (HK2)
-- Chapter 4: Các số trong phạm vi 100.000 (Tuần 28-33)
-- ============================================================

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 2, 'C4', 'Các số trong phạm vi 100.000', 'CD3-C4-01',
 'Các số có 5 chữ số — số 100.000', 'so_hoc', 28, 44,
 'Sinh bài tập về Các số có 5 chữ số và số 100.000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc, viết số có 5 chữ số. Xác định giá trị theo hàng (chục nghìn, nghìn, trăm, chục, đơn vị).
Medium: So sánh và sắp xếp các số có 5 chữ số. Làm tròn số.
Hard: Tìm số theo nhiều điều kiện. Bài toán về dãy số quy luật trong phạm vi 100.000.',
 '{"easy": "Đọc, viết, phân tích số 5 chữ số", "medium": "So sánh, sắp xếp, làm tròn", "hard": "Tìm số theo điều kiện, dãy số"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 2, 'C4', 'Các số trong phạm vi 100.000', 'CD3-C4-02',
 'Cộng trong phạm vi 100.000', 'so_hoc', 29, 45,
 'Sinh bài tập về Cộng trong phạm vi 100.000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Cộng hai số có 5 chữ số không nhớ (12345 + 23451 = ?).
Medium: Cộng có nhớ. Tìm số hạng chưa biết. Ước lượng kết quả.
Hard: Bài toán có lời văn 2 bước: tổng dân số, tổng sản lượng.',
 '{"easy": "Cộng không nhớ 5 chữ số", "medium": "Cộng có nhớ, tìm số hạng, ước lượng", "hard": "Bài toán 2 bước phạm vi 100.000"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 2, 'C4', 'Các số trong phạm vi 100.000', 'CD3-C4-03',
 'Trừ trong phạm vi 100.000', 'so_hoc', 29, 46,
 'Sinh bài tập về Trừ trong phạm vi 100.000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Trừ hai số có 5 chữ số không nhớ (56789 - 12345 = ?).
Medium: Trừ có nhớ. Tìm số bị trừ hoặc số trừ. Thử lại phép trừ bằng phép cộng.
Hard: Bài toán có lời văn: so sánh hiệu, chênh lệch dân số, sản lượng.',
 '{"easy": "Trừ không nhớ 5 chữ số", "medium": "Trừ có nhớ, tìm thành phần, thử lại", "hard": "Bài toán chênh lệch, so sánh"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 2, 'C4', 'Các số trong phạm vi 100.000', 'CD3-C4-04',
 'Nhân với số có 1 chữ số (có nhớ) — phạm vi 100.000', 'so_hoc', 30, 47,
 'Sinh bài tập về Nhân với số có 1 chữ số có nhớ trong phạm vi 100.000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhân số có 5 chữ số với số có 1 chữ số, nhớ 1 lần (11234 x 3 = ?).
Medium: Nhân có nhớ nhiều lần. Ước lượng kết quả trước khi tính.
Hard: Bài toán có lời văn: tính quãng đường, tổng tiền mua sắm.',
 '{"easy": "Nhân 5 chữ số nhớ 1 lần", "medium": "Nhân nhớ nhiều lần, ước lượng", "hard": "Bài toán quãng đường, tiền bạc"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 2, 'C4', 'Các số trong phạm vi 100.000', 'CD3-C4-05',
 'Chia cho số có 1 chữ số — phạm vi 100.000', 'so_hoc', 31, 48,
 'Sinh bài tập về Chia cho số có 1 chữ số trong phạm vi 100.000, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Chia hết số có 5 chữ số cho số 1 chữ số (24684 : 2 = ?).
Medium: Chia có dư. Tìm thành phần chưa biết. Thử lại phép chia.
Hard: Bài toán có lời văn: chia đều tiền, chia đều sản phẩm.',
 '{"easy": "Chia hết 5 chữ số", "medium": "Chia có dư, tìm thành phần, thử lại", "hard": "Bài toán chia đều tiền, sản phẩm"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 2, 'C4', 'Các số trong phạm vi 100.000', 'CD3-C4-06',
 'Chia cho số có 1 chữ số (tiếp theo)', 'so_hoc', 32, 49,
 'Sinh bài tập về Chia cho số có 1 chữ số (các trường hợp đặc biệt), độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Chia khi thương có chữ số 0 (30624 : 3 = ?). Chia số có 5 chữ số đơn giản.
Medium: Trường hợp thương có nhiều chữ số 0. Kiểm tra kết quả bằng phép nhân.
Hard: Bài toán có lời văn phức hợp kết hợp chia với các phép tính khác.',
 '{"easy": "Chia có chữ số 0 ở thương", "medium": "Thương nhiều chữ số 0, kiểm tra", "hard": "Bài toán phức hợp nhiều phép tính"}'::jsonb),

-- ============================================================
-- SEMESTER 2 (HK2)
-- Chapter 5: Thời gian, Tiền, Thống kê (Tuần 33-35)
-- ============================================================

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 2, 'C5', 'Thời gian, Tiền, Thống kê', 'CD3-C5-01',
 'Xem đồng hồ — giờ, phút', 'do_luong', 33, 50,
 'Sinh bài tập về Xem đồng hồ — giờ và phút, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc giờ đúng và giờ 15 phút, 30 phút, 45 phút trên đồng hồ.
Medium: Đọc giờ bất kỳ (8 giờ 23 phút). Tính khoảng thời gian đơn giản.
Hard: Bài toán thực tế: bắt đầu lúc 7 giờ 30 phút, học 45 phút, hỏi kết thúc lúc mấy giờ.',
 '{"easy": "Đọc giờ đúng, giờ rưỡi", "medium": "Đọc giờ bất kỳ, tính khoảng thời gian", "hard": "Bài toán thời gian thực tế"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 2, 'C5', 'Thời gian, Tiền, Thống kê', 'CD3-C5-02',
 'Tiền Việt Nam', 'toan_do', 33, 51,
 'Sinh bài tập về Tiền Việt Nam, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Nhận biết các tờ tiền (1000đ, 2000đ, 5000đ, 10000đ...). Đếm tổng tiền đơn giản.
Medium: Đổi tiền (5 tờ 2000đ = ? đồng). Tính tiền thối lại.
Hard: Bài toán mua bán: mua 3 quyển vở giá 5000đ, đưa 20000đ, hỏi tiền thừa.',
 '{"easy": "Nhận biết tờ tiền, đếm tiền", "medium": "Đổi tiền, tính tiền thối", "hard": "Bài toán mua bán có lời văn"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 2, 'C5', 'Thời gian, Tiền, Thống kê', 'CD3-C5-03',
 'Bảng số liệu — thu thập, ghi chép', 'thong_ke', 34, 52,
 'Sinh bài tập về Bảng số liệu — thu thập và ghi chép, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc thông tin từ bảng số liệu đơn giản (bảng điểm, bảng số học sinh).
Medium: Tìm giá trị lớn nhất, nhỏ nhất, tính tổng từ bảng. Hoàn thành bảng còn thiếu.
Hard: Thu thập dữ liệu và lập bảng. Trả lời câu hỏi phân tích từ bảng số liệu.',
 '{"easy": "Đọc bảng số liệu đơn giản", "medium": "Tìm GTLN, GTNN, tính tổng từ bảng", "hard": "Lập bảng và phân tích dữ liệu"}'::jsonb),

(gen_random_uuid(), 'toan', 3, 'canh_dieu', 2, 'C5', 'Thời gian, Tiền, Thống kê', 'CD3-C5-04',
 'Biểu đồ cột đơn giản', 'thong_ke', 34, 53,
 'Sinh bài tập về Biểu đồ cột đơn giản, độ khó {difficulty}. Dạng câu hỏi: {question_type}.
Easy: Đọc biểu đồ cột: xác định giá trị của mỗi cột.
Medium: So sánh các cột. Tính tổng, hiệu từ biểu đồ. Hoàn thành biểu đồ còn thiếu.
Hard: Vẽ biểu đồ cột từ bảng số liệu. Phân tích xu hướng và trả lời câu hỏi nâng cao.',
 '{"easy": "Đọc giá trị từ biểu đồ cột", "medium": "So sánh, tính toán từ biểu đồ", "hard": "Vẽ biểu đồ, phân tích xu hướng"}'::jsonb);
