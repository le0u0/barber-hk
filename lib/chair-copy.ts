import type { QuizAnswers } from "./types";

export type Bilingual = { en: string; yue: string };

const CJK = /[\u3400-\u9fff]/;

export const quizCopy = {
  title: { en: "Quiz", yue: "問卷" },
  lede: { en: "Answer four questions.", yue: "答四題出備忘。" },
  incomplete: { en: "Answer every question.", yue: "請答完四條。" },
  fail: { en: "Could not make a brief.", yue: "出唔到備忘。" },
  pending: { en: "Making brief…", yue: "出緊備忘…" },
  submit: { en: "Show brief", yue: "出備忘" },
} as const satisfies Record<string, Bilingual>;

export const selfieCopy = {
  title: { en: "Selfie", yue: "自拍" },
  privacy: {
    en: "The photo is sent once to make a brief. It is not stored.",
    yue: "相片只送一次嚟出備忘，唔會保存。",
  },
  photo: { en: "Photo", yue: "相片" },
  needPhoto: { en: "Choose a photo first.", yue: "請先揀相。" },
  fail: { en: "Could not read that photo.", yue: "讀唔到呢張相。" },
  pending: { en: "Making brief…", yue: "出緊備忘…" },
  submit: { en: "Read photo", yue: "睇相" },
  sample: { en: "Use sample fixture", yue: "用示範相" },
  sampleMissing: { en: "Sample fixture missing.", yue: "示範相搵唔到。" },
} as const satisfies Record<string, Bilingual>;

export const quizQuestions: Array<{
  key: keyof QuizAnswers;
  legend: Bilingual;
  options: Array<{ value: string; label: Bilingual }>;
}> = [
  {
    key: "sides",
    legend: { en: "Sides", yue: "兩側" },
    options: [
      { value: "skin", label: { en: "Skin fade", yue: "皮膚漸變" } },
      { value: "taper", label: { en: "Taper", yue: "短漸變" } },
      { value: "scissor", label: { en: "Scissor", yue: "用剪" } },
    ],
  },
  {
    key: "top",
    legend: { en: "Top", yue: "頂" },
    options: [
      { value: "buzz", label: { en: "Buzz", yue: "全短" } },
      { value: "short", label: { en: "Short", yue: "短" } },
      { value: "medium", label: { en: "Medium", yue: "中" } },
      { value: "long", label: { en: "Long", yue: "長" } },
    ],
  },
  {
    key: "finish",
    legend: { en: "Finish", yue: "造型" },
    options: [
      { value: "textured", label: { en: "Textured", yue: "抓碎" } },
      { value: "sleek", label: { en: "Sleek", yue: "貼服" } },
      { value: "natural", label: { en: "Natural", yue: "自然" } },
    ],
  },
  {
    key: "part",
    legend: { en: "Part", yue: "分線" },
    options: [
      { value: "none", label: { en: "None", yue: "不分" } },
      { value: "side", label: { en: "Side", yue: "側分" } },
      { value: "middle", label: { en: "Middle", yue: "中分" } },
    ],
  },
];

export function lead(lang: "en" | "yue", copy: Bilingual) {
  if (lang === "yue") {
    return {
      primary: copy.yue,
      primaryLang: "zh-HK" as const,
      secondary: copy.en,
      secondaryLang: "en" as const,
    };
  }
  return {
    primary: copy.en,
    primaryLang: "en" as const,
    secondary: copy.yue,
    secondaryLang: "zh-HK" as const,
  };
}

export function joinCopy(copy: Bilingual): string {
  return `${copy.en} ${copy.yue}`;
}

export function chairError(caught: unknown, fallback: Bilingual): string {
  const message = caught instanceof Error ? caught.message.trim() : "";
  if (!message) return joinCopy(fallback);
  if (CJK.test(message)) return message;
  return `${message} ${fallback.yue}`;
}
