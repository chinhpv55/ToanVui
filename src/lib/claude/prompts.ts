import { DifficultyLevel, QuestionType, SeriesType } from "@/types/database";

const SERIES_NAME: Record<SeriesType, string> = {
  canh_dieu: "Cánh Diều",
  kntt: "Kết nối tri thức",
  chan_troi: "Chân trời sáng tạo",
};

function seriesLabel(series: SeriesType): string {
  return SERIES_NAME[series] ?? "SGK";
}

// One-shot prompt (legacy, single exercise per call). Kept for the explain-error
// path which still uses single-shot generation.
export function buildSystemPrompt(grade: number, series: SeriesType): string {
  return `Bạn là trợ lý sinh bài tập Toán lớp ${grade} Việt Nam, bộ sách ${seriesLabel(series)}.
Nhiệm vụ: sinh đúng 1 câu hỏi theo yêu cầu.
Trả về JSON duy nhất, KHÔNG có text giải thích, KHÔNG có markdown backticks.
Schema: { "question": string, "answer": string, "question_type": "fill_blank"|"multiple_choice"|"drag_drop", "choices": array|null, "hint": string }
Với multiple_choice: choices là mảng 4 phần tử, answer là chính xác 1 trong 4 phần tử đó.
Với fill_blank: choices là null.
Đảm bảo answer luôn là chuỗi (string), kể cả khi là số.
QUAN TRỌNG: hint chỉ gợi ý cách giải (ví dụ: "Nhớ bảng nhân 9" hoặc "Cộng từ hàng đơn vị"), TUYỆT ĐỐI KHÔNG được chứa đáp án hoặc kết quả phép tính.
BẮT BUỘC: Mỗi câu hỏi phải dùng số và cách hỏi KHÁC HOÀN TOÀN với danh sách "Đã dùng" bên dưới.`;
}

// Batch prompt (current main flow): asks Claude for a JSON array of N exercises.
export function buildBatchSystemPrompt(grade: number, series: SeriesType): string {
  return `Bạn là trợ lý sinh bài tập Toán lớp ${grade} Việt Nam, bộ sách ${seriesLabel(series)}.
Nhiệm vụ: sinh ĐÚNG SỐ LƯỢNG câu hỏi được yêu cầu, mỗi câu một độ khó / cách hỏi khác nhau.
Trả về JSON ARRAY duy nhất (KHÔNG bọc object, KHÔNG markdown), mỗi phần tử có schema:
{ "question": string, "answer": string, "question_type": "fill_blank"|"multiple_choice"|"drag_drop", "choices": array|null, "hint": string }
Với multiple_choice: choices là mảng 4 phần tử, answer là chính xác 1 trong 4 phần tử đó.
Với fill_blank: choices là null.
answer luôn là chuỗi, kể cả khi là số.
hint chỉ gợi ý cách giải, TUYỆT ĐỐI KHÔNG chứa đáp án/kết quả phép tính.
BẮT BUỘC: các câu trong cùng một mảng phải KHÁC NHAU hoàn toàn về số và cách hỏi.

QUY TẮC ĐÁP ÁN (rất quan trọng — sai sẽ gây bé bị chấm sai oan):
- fill_blank CHỈ dùng khi đáp án là MỘT giá trị ngắn, duy nhất, không có cách viết khác:
  * số (ví dụ "42", "1500", "3,5")
  * số kèm đơn vị ngắn cố định ("12 cm", "5 kg")
  * MỘT từ tên hình hoặc khái niệm ("tam giác", "hình vuông", "chẵn", "lẻ")
- KHÔNG dùng fill_blank nếu đáp án có thể viết theo nhiều cách (có dấu phẩy, liên từ "và",
  liệt kê nhiều phần, hoặc câu mô tả). Khi đó BẮT BUỘC dùng multiple_choice với 4 phương án.
  Ví dụ câu hỏi "Tam giác có bao nhiêu cạnh và mấy góc?" → phải multiple_choice, KHÔNG fill_blank.
- Đáp án phải KHỚP CHÍNH XÁC với câu hỏi: nếu hỏi "bao nhiêu cạnh" thì đáp án là số ("3"),
  KHÔNG được "3 cạnh và 3 góc".`;
}

// Backwards-compat constants — defaults to grade 3 Cánh Diều. New code should
// call buildBatchSystemPrompt(grade, series) directly.
export const SYSTEM_PROMPT = buildSystemPrompt(3, "canh_dieu");
export const BATCH_SYSTEM_PROMPT = buildBatchSystemPrompt(3, "canh_dieu");

export const BATCH_SLOT_HINTS = [
  "Dùng số nhỏ (1–3) hoặc bài toán đơn giản nhất của chủ đề này.",
  "Dùng số vừa (4–6) hoặc độ khó trung bình của chủ đề này.",
  "Dùng số lớn (7–9) hoặc bài khó hơn của chủ đề này.",
  "Đổi cách hỏi: tìm số còn thiếu, điền vào ô trống, hoặc hỏi ngược.",
  "Dùng bài toán có lời văn thực tế (đồ vật, con vật, học sinh...) liên quan chủ đề.",
];

export function buildExplanationSystemPrompt(grade: number): string {
  return `Bạn là trợ lý giải thích Toán cho bé lớp ${grade} Việt Nam.
Bé đã trả lời SAI (hệ thống đã chấm). Nhiệm vụ của bạn là giải thích cách ra đáp án đúng.
TUYỆT ĐỐI KHÔNG được nói "Bé làm đúng rồi", "Bé đúng", "Đáp án của bé đúng" — vì hệ thống đã chấm là sai.
Nếu bé viết gần đúng (chỉ khác cách viết), hãy nói: "Ý của bé đúng, nhưng cách viết chưa khớp đáp án mẫu" rồi chỉ ra đáp án mẫu.
Dùng ngôn ngữ thật đơn giản, vui, ví dụ đồ vật quen thuộc (kẹo, bút, đồ chơi).
Đừng chỉ đọc đáp án — dẫn dắt bé tự nghĩ ra.
Tối đa 3 câu ngắn. Không dùng markdown.`;
}

export const EXPLANATION_SYSTEM_PROMPT = buildExplanationSystemPrompt(3);

export function buildExercisePrompt(
  template: string,
  difficulty: DifficultyLevel,
  questionType: QuestionType,
  slotHint: string = ""
): string {
  const base = template
    .replace(/\{difficulty\}/g, difficulty)
    .replace(/\{question_type\}/g, questionType);

  if (!slotHint) return base;

  return `${base}

YÊU CẦU ĐẶC BIỆT cho câu này: ${slotHint}`;
}

export function buildBatchExercisePrompt(
  template: string,
  difficulty: DifficultyLevel,
  questionType: QuestionType,
  count: number
): string {
  const base = template
    .replace(/\{difficulty\}/g, difficulty)
    .replace(/\{question_type\}/g, questionType);

  const hints = BATCH_SLOT_HINTS.slice(0, count)
    .map((h, i) => `  ${i + 1}. ${h}`)
    .join("\n");

  return `${base}

YÊU CẦU: Sinh đúng ${count} câu hỏi khác nhau, trả về JSON ARRAY ${count} phần tử.
Mỗi câu theo gợi ý sau:
${hints}

Loại câu hỏi mặc định: ${questionType}. Với mỗi câu, có thể dùng ${questionType} hoặc đổi sang multiple_choice/fill_blank cho đa dạng.`;
}

export function buildExplanationPrompt(
  question: string,
  studentAnswer: string,
  correctAnswer: string,
  topicName: string
): string {
  return `Bé đang học "${topicName}".
Câu hỏi: ${question}
Bé trả lời: ${studentAnswer}
Đáp án đúng: ${correctAnswer}
Hãy giải thích cho bé hiểu tại sao sai và cách tìm đáp án đúng.`;
}
