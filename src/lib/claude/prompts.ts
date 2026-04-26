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
BẮT BUỘC: các câu trong cùng một mảng phải KHÁC NHAU hoàn toàn về số và cách hỏi.`;
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
Khi bé trả lời sai, hãy giải thích bằng ngôn ngữ thật đơn giản, vui, và dùng ví dụ bằng đồ vật quen thuộc (kẹo, bút, đồ chơi).
Đừng chỉ nói đáp án — hãy dẫn dắt bé tự nghĩ ra.
Tối đa 3 câu ngắn gọn. Không dùng markdown.`;
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
