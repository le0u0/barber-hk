import { parseCompare } from "./compare";
import type { QuizAnswers } from "./types";

export const PREFS_KEY = "barber-hk:v1";
export const BRIEF_KEY = "barber-hk:brief";
export const PREFS_EVENT = "barber-hk-prefs";

export type Prefs = {
  lang: "en" | "yue";
  quiz: QuizAnswers | null;
  lastCutId: string | null;
  compare: { left: string; right: string } | null;
};

export const EMPTY_PREFS: Prefs = { lang: "en", quiz: null, lastCutId: null, compare: null };

const SIDES = ["skin", "taper", "scissor"] as const;
const TOPS = ["buzz", "short", "medium", "long"] as const;
const FINISHES = ["textured", "sleek", "natural"] as const;
const PARTS = ["none", "side", "middle"] as const;

let cachedRaw: string | null | undefined;
let cachedPrefs: Prefs = EMPTY_PREFS;

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

export function isQuiz(value: unknown): value is QuizAnswers {
  if (!value || typeof value !== "object") return false;
  const quiz = value as Record<string, unknown>;
  return (
    oneOf(quiz.sides, SIDES) &&
    oneOf(quiz.top, TOPS) &&
    oneOf(quiz.finish, FINISHES) &&
    oneOf(quiz.part, PARTS)
  );
}

function parsePrefs(raw: string | null): Prefs {
  if (!raw) return EMPTY_PREFS;
  try {
    const data = JSON.parse(raw) as Partial<Prefs>;
    return {
      lang: data.lang === "yue" ? "yue" : "en",
      quiz: isQuiz(data.quiz) ? data.quiz : null,
      lastCutId: typeof data.lastCutId === "string" ? data.lastCutId : null,
      compare: parseCompare(data.compare),
    };
  } catch {
    return EMPTY_PREFS;
  }
}

export function invalidatePrefs() {
  cachedRaw = undefined;
}

export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return EMPTY_PREFS;
  const raw = localStorage.getItem(PREFS_KEY);
  if (cachedRaw !== undefined && raw === cachedRaw) return cachedPrefs;
  cachedRaw = raw;
  cachedPrefs = parsePrefs(raw);
  return cachedPrefs;
}

export function savePrefs(prefs: Prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  invalidatePrefs();
  window.dispatchEvent(new Event(PREFS_EVENT));
}
