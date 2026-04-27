// Fuzzy answer comparison for kid-typed Vietnamese text.
// Handles diacritics, punctuation, conjunction "và", spelled-out small numbers.

const VN_NUMBER_WORDS: Record<string, string> = {
  "khong": "0",
  "mot": "1", "hai": "2", "ba": "3", "bon": "4", "nam": "5",
  "sau": "6", "bay": "7", "tam": "8", "chin": "9", "muoi": "10",
};

function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

function canonicalize(s: string): string {
  let out = stripDiacritics(s.toLowerCase().trim());
  // Drop punctuation that doesn't change meaning, keep digits + decimal point + minus.
  out = out.replace(/[,;.!?…"'`()\[\]{}]/g, " ");
  // Normalize math signs.
  out = out.replace(/[×x]/g, "*").replace(/[÷]/g, "/");
  // Collapse whitespace.
  out = out.replace(/\s+/g, " ").trim();
  // Drop the connector "va" (and) — kids may omit it.
  out = out.replace(/\bva\b/g, " ").replace(/\s+/g, " ").trim();
  // Replace spelled-out small numbers with digits ("ba" → "3").
  out = out
    .split(" ")
    .map((tok) => VN_NUMBER_WORDS[tok] ?? tok)
    .join(" ");
  // Final whitespace squeeze.
  return out.replace(/\s+/g, " ").trim();
}

function tryNumeric(a: string, b: string): boolean | null {
  const na = Number(a.replace(/\s+/g, "").replace(",", "."));
  const nb = Number(b.replace(/\s+/g, "").replace(",", "."));
  if (Number.isFinite(na) && Number.isFinite(nb)) {
    return Math.abs(na - nb) < 1e-9;
  }
  return null;
}

export function isAnswerCorrect(studentAnswer: string, correctAnswer: string): boolean {
  if (!studentAnswer || !correctAnswer) return false;

  const sRaw = studentAnswer.trim();
  const cRaw = correctAnswer.trim();
  if (sRaw === cRaw) return true;
  if (sRaw.toLowerCase() === cRaw.toLowerCase()) return true;

  // Numeric path — handles "42" vs "42.0" vs " 42 ".
  const numeric = tryNumeric(sRaw, cRaw);
  if (numeric !== null) return numeric;

  // Canonical text comparison (lowercase, no diacritics, no punctuation,
  // "và" dropped, small Vietnamese number-words → digits).
  const sNorm = canonicalize(sRaw);
  const cNorm = canonicalize(cRaw);
  if (!sNorm || !cNorm) return false;
  if (sNorm === cNorm) return true;

  // Token-set match: same words in any order ("3 cạnh 3 góc" ↔ "3 góc 3 cạnh").
  const sTokens = sNorm.split(" ").filter(Boolean).sort().join(" ");
  const cTokens = cNorm.split(" ").filter(Boolean).sort().join(" ");
  if (sTokens === cTokens) return true;

  // Tight match: collapse all whitespace ("12cm" ↔ "12 cm", "3+5" ↔ "3 + 5").
  const sTight = sNorm.replace(/\s+/g, "");
  const cTight = cNorm.replace(/\s+/g, "");
  return sTight === cTight && sTight.length > 0;
}
