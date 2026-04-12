import { DifficultyLevel, QuestionType } from "@/types/database";

export const SYSTEM_PROMPT = `Bạn là trợ lý sinh bài tập Toán lớp 3 Việt Nam, bộ sách Cánh Diều.
Nhiệm vụ: sinh đúng 1 câu hỏi theo yêu cầu.
Trả về JSON duy nhất, KHÔNG có text giải thích, KHÔNG có markdown backticks.
Schema: { "question": string, "answer": string, "question_type": "fill_blank"|"multiple_choice"|"drag_drop", "choices": array|null, "hint": string }
Với multiple_choice: choices là mảng 4 phần tử, answer là chính xác 1 trong 4 phần tử đó.
Với fill_blank: choices là null.
Đảm bảo answer luôn là chuỗi (string), kể cả khi là số.
QUAN TRỌNG: hint chỉ gợi ý cách giải (ví dụ: "Nhớ bảng nhân 9" hoặc "Cộng từ hàng đơn vị"), TUYỆT ĐỐI KHÔNG được chứa đáp án hoặc kết quả phép tính.
Mỗi lần sinh câu hỏi khác nhau, KHÔNG lặp lại câu trước.`;

export const EXPLANATION_SYSTEM_PROMPT = `Bạn là trợ lý giải thích Toán cho bé lớp 3 Việt Nam.
Khi bé trả lời sai, hãy giải thích bằng ngôn ngữ thật đơn giản, vui, và dùng ví dụ bằng đồ vật quen thuộc (kẹo, bút, đồ chơi).
Đừng chỉ nói đáp án — hãy dẫn dắt bé tự nghĩ ra.
Tối đa 3 câu ngắn gọn. Không dùng markdown.`;

export function buildExercisePrompt(
  template: string,
  difficulty: DifficultyLevel,
  questionType: QuestionType
): string {
  return template
    .replace(/\{difficulty\}/g, difficulty)
    .replace(/\{question_type\}/g, questionType);
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
