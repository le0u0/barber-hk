export type Bilingual = { en: string; yue: string };

export const QUIZ_INCOMPLETE: Bilingual = { en: "Pick all four.", yue: "四題都要揀。" };
export const QUIZ_FAIL: Bilingual = { en: "Could not make a brief.", yue: "出唔到備忘。" };
export const SELFIE_NEED: Bilingual = { en: "Choose a photo first.", yue: "請先揀相。" };
export const SELFIE_FAIL: Bilingual = { en: "Could not read that photo.", yue: "讀唔到呢張相。" };
export const SELFIE_SAMPLE: Bilingual = { en: "Sample photo is unavailable.", yue: "示範相用唔到。" };
export const SELFIE_AGAIN: Bilingual = { en: "Try another photo.", yue: "換張相。" };
export const BRIEF_EMPTY = {
  title: { en: "No brief yet", yue: "未有備忘" },
  body: { en: "Take the quiz or send a selfie.", yue: "先做問卷或者自拍。" },
} as const;
export const COPY_OK: Bilingual = { en: "Copied.", yue: "已複製。" };
export const COPY_FAIL: Bilingual = { en: "Could not copy.", yue: "複製唔到。" };

/** Server `error` strings from `app/api/brief/route.ts`, paired for the alert. */
export const API_ERRORS: Record<string, Bilingual> = {
  "Send JSON.": { en: "Send JSON.", yue: "請送 JSON。" },
  "Quiz answers are incomplete.": { en: "Quiz answers are incomplete.", yue: "問卷未答完。" },
  "Use a JPEG, PNG, or WebP photo.": { en: "Use a JPEG, PNG, or WebP photo.", yue: "請用 JPEG、PNG 或者 WebP。" },
  "That image was empty.": { en: "That image was empty.", yue: "張相係空嘅。" },
  "That photo is too large. Try a smaller one.": { en: "That photo is too large. Try a smaller one.", yue: "張相太大。試細張啲。" },
  "Choose quiz or selfie.": { en: "Choose quiz or selfie.", yue: "請揀問卷或者自拍。" },
};

export function leadRest(copy: Bilingual, yue: boolean) {
  if (yue) return { lead: copy.yue, rest: copy.en, restLang: "en" as const };
  return { lead: copy.en, rest: copy.yue, restLang: "zh-HK" as const };
}

export function resolveAlert(message: string | undefined, fallback: Bilingual): Bilingual {
  const known = message ? API_ERRORS[message] : undefined;
  if (known) return known;
  if (message && message.trim()) return { en: message.trim(), yue: fallback.yue };
  return fallback;
}

export function withFollowUp(copy: Bilingual, follow: Bilingual): Bilingual {
  return { en: `${copy.en} ${follow.en}`, yue: `${copy.yue} ${follow.yue}` };
}
