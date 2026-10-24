import type { QuizAnswers } from "./types";

export type Locale = "en" | "yue";

const chrome = {
  language: { en: "Language", yue: "語言" },
  quiz: { en: "Quiz", yue: "問卷" },
  selfie: { en: "Selfie", yue: "自拍" },
  homeTitle: { en: "A brief for your barber", yue: "畀師傅睇嘅備忘" },
  homeLead: { en: "One screen to show your barber.", yue: "一版畀師傅睇。" },
  lastPick: { en: "Last pick", yue: "上次" },
  showBrief: { en: "Show brief", yue: "出備忘" },
  makingBrief: { en: "Making brief…", yue: "準備緊備忘…" },
  quizIncomplete: { en: "Answer every question.", yue: "請答完四條。" },
  couldNotMake: { en: "Could not make a brief.", yue: "做唔到備忘。" },
  selfieLead: {
    en: "The photo is sent once to make a brief. It is not stored.",
    yue: "張相只會送一次嚟做備忘，唔會儲低。",
  },
  photo: { en: "Photo", yue: "相片" },
  choosePhoto: { en: "Choose a photo first.", yue: "請先揀相。" },
  readPhoto: { en: "Read photo", yue: "睇相" },
  useSample: { en: "Use sample fixture", yue: "用樣本相" },
  sampleMissing: { en: "Sample fixture missing.", yue: "搵唔到樣本相。" },
  couldNotRead: { en: "Could not read that photo.", yue: "讀唔到張相。" },
  couldNotSample: { en: "Could not use the sample.", yue: "用唔到樣本相。" },
  noBrief: { en: "No brief yet", yue: "未有備忘" },
  noBriefLead: { en: "Take the quiz or send a selfie first.", yue: "先做問卷或者自拍。" },
  staticFallback: { en: "Static fallback", yue: "預設備忘" },
  briefLanguage: { en: "Brief language", yue: "備忘語言" },
  sayThis: { en: "Say this", yue: "照住講" },
  sides: { en: "Sides", yue: "兩側" },
  top: { en: "Top", yue: "頂" },
  fringe: { en: "Fringe", yue: "劉海" },
  finish: { en: "Finish", yue: "造型" },
  eastAsian: { en: "East Asian hair note", yue: "東亞頭髮注意" },
  skin: { en: "Skin fade", yue: "皮膚漸變" },
  taper: { en: "Taper", yue: "短漸變" },
  scissor: { en: "Scissor", yue: "用剪" },
  buzz: { en: "Buzz", yue: "全短" },
  short: { en: "Short", yue: "短" },
  medium: { en: "Medium", yue: "中" },
  long: { en: "Long", yue: "長" },
  textured: { en: "Textured", yue: "抓碎" },
  sleek: { en: "Sleek", yue: "貼服" },
  natural: { en: "Natural", yue: "自然" },
  none: { en: "None", yue: "不分" },
  side: { en: "Side", yue: "側分" },
  middle: { en: "Middle", yue: "中分" },
} as const;

export type ChromeKey = keyof typeof chrome;

export function t(lang: Locale, key: ChromeKey): string {
  return chrome[key][lang];
}

export function cutsHeading(lang: Locale, count: number): string {
  return lang === "yue" ? `${count} 款` : `${count} cuts`;
}

export function cutLabel(cut: { nameEn: string; nameYue: string }, lang: Locale): string {
  return lang === "yue" ? cut.nameYue : cut.nameEn;
}

export function sourceLabel(lang: Locale, source: "gemini" | "fallback"): string {
  return source === "gemini" ? "Gemini" : t(lang, "staticFallback");
}

/** Brief copy can follow the header, or a choice made on the brief screen. */
export function briefOutputLang(ui: Locale, override: Locale | null): Locale {
  return override ?? ui;
}

export const BRIEF_FIELDS = ["ask", "sides", "top", "fringe", "finish"] as const;

export function briefFieldLabel(lang: Locale, field: (typeof BRIEF_FIELDS)[number]): string {
  if (field === "ask") return t(lang, "sayThis");
  return t(lang, field);
}

type QuizQuestion = {
  key: keyof QuizAnswers;
  legend: ChromeKey;
  options: Array<[QuizAnswers[keyof QuizAnswers], ChromeKey]>;
};

export const QUIZ: QuizQuestion[] = [
  {
    key: "sides",
    legend: "sides",
    options: [
      ["skin", "skin"],
      ["taper", "taper"],
      ["scissor", "scissor"],
    ],
  },
  {
    key: "top",
    legend: "top",
    options: [
      ["buzz", "buzz"],
      ["short", "short"],
      ["medium", "medium"],
      ["long", "long"],
    ],
  },
  {
    key: "finish",
    legend: "finish",
    options: [
      ["textured", "textured"],
      ["sleek", "sleek"],
      ["natural", "natural"],
    ],
  },
  {
    key: "part",
    legend: "part",
    options: [
      ["none", "none"],
      ["side", "side"],
      ["middle", "middle"],
    ],
  },
];
