import { matchCut } from "./catalog";
import type { BriefResponse, QuizAnswers } from "./types";

export type Bilingual = { en: string; yue: string };

export const OFFLINE_BANNER: Bilingual = {
  en: "You are offline. Saved cuts still work in the quiz.",
  yue: "你而家離線。問卷仍然用到已儲嘅髮型。",
};

export const OFFLINE_NOTICE: Bilingual = {
  en: "You are offline. This brief is from the saved cuts on this phone.",
  yue: "你而家離線。呢份備忘係用呢部手機已儲嘅髮型出嘅。",
};

export const MISSING_KEY_NOTICE: Bilingual = {
  en: "No Gemini key. This is the saved brief for your answers.",
  yue: "未有 Gemini 匙。以下係按你問卷配好嘅備忘。",
};

export const GEMINI_NOTICE: Bilingual = {
  en: "Gemini did not answer. This is the saved brief.",
  yue: "Gemini 未答到。以下係已儲嘅備忘。",
};

export const SAVED_CUT_TITLE: Bilingual = { en: "Saved cut", yue: "已儲髮型" };

export const EMPTY_BRIEF = {
  title: { en: "No brief yet", yue: "未有備忘" } as Bilingual,
  body: { en: "Take the quiz or send a selfie.", yue: "先做問卷或者自拍。" } as Bilingual,
  offline: {
    en: "You are offline. The quiz can still make a brief from the saved cuts. A selfie cannot be read until you are back online.",
    yue: "你而家離線。問卷仍然可以用已儲嘅髮型出備忘。自拍要返到線先讀到。",
  } as Bilingual,
};

export const QUIZ_INCOMPLETE: Bilingual = { en: "Answer every question.", yue: "請答完四條。" };
export const QUIZ_FAIL: Bilingual = { en: "Could not make a brief.", yue: "出唔到備忘。" };

export const SELFIE_NEED: Bilingual = { en: "Choose a photo first.", yue: "請先揀相。" };
export const SELFIE_OFFLINE: Bilingual = {
  en: "You are offline, so this photo cannot be read. The quiz still uses the saved cuts.",
  yue: "你而家離線，張相讀唔到。問卷仍然可以用已儲嘅髮型。",
};
export const SELFIE_NETWORK: Bilingual = {
  en: "The brief service did not answer. This photo was not read. The quiz can still use the saved cuts.",
  yue: "備忘服務未答到。張相未讀到。問卷仍然可以用已儲嘅髮型。",
};
export const SELFIE_FAIL: Bilingual = { en: "Could not read that photo.", yue: "讀唔到呢張相。" };
export const SAMPLE_FAIL: Bilingual = { en: "Sample photo is unavailable.", yue: "示範相用唔到。" };

export function localQuizBrief(answers: QuizAnswers): BriefResponse {
  const cut = matchCut(answers);
  return {
    source: "fallback",
    fallbackReason: "offline",
    notice: OFFLINE_NOTICE,
    cut: {
      id: cut.id,
      nameEn: cut.nameEn,
      nameYue: cut.nameYue,
      image: cut.image,
      eastAsianNote: cut.eastAsianNote,
    },
    brief: cut.brief,
  };
}

export class QuizRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuizRequestError";
  }
}

export async function requestQuizBrief(
  answers: QuizAnswers,
  options: { onLine: boolean; fetchImpl?: (input: string, init?: RequestInit) => Promise<Response> },
): Promise<BriefResponse> {
  if (!options.onLine) return localQuizBrief(answers);
  const fetchImpl = options.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetchImpl("/api/brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "quiz", answers }),
    });
  } catch {
    return localQuizBrief(answers);
  }

  let data: (BriefResponse & { error?: string }) | null = null;
  try {
    data = (await response.json()) as BriefResponse & { error?: string };
  } catch {
    throw new QuizRequestError(QUIZ_FAIL.en);
  }
  if (!response.ok || !data?.brief) {
    throw new QuizRequestError(data?.error || QUIZ_FAIL.en);
  }
  return data;
}

export function fallbackPanel(brief: Pick<BriefResponse, "source" | "fallbackReason" | "notice">): {
  title: Bilingual;
  body: Bilingual;
} | null {
  if (brief.source !== "fallback") return null;
  if (brief.notice?.en && brief.notice.yue) return { title: SAVED_CUT_TITLE, body: brief.notice };
  if (brief.fallbackReason === "offline") return { title: SAVED_CUT_TITLE, body: OFFLINE_NOTICE };
  if (brief.fallbackReason === "gemini_error") return { title: SAVED_CUT_TITLE, body: GEMINI_NOTICE };
  return { title: SAVED_CUT_TITLE, body: MISSING_KEY_NOTICE };
}

export function apiErrorCopy(message: string | undefined, fallback: Bilingual): Bilingual {
  const en = message?.trim() || fallback.en;
  return { en, yue: fallback.yue };
}

export function isTransportError(error: unknown): boolean {
  return error instanceof TypeError;
}
