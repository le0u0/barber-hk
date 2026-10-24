import { getCut, isCutId, type Cut } from "./catalog";
import type { BriefCopy } from "./types";

export const COMPARE_FIELDS: ReadonlyArray<{ key: keyof BriefCopy; en: string; yue: string }> = [
  { key: "ask", en: "Say this", yue: "照住講" },
  { key: "sides", en: "Sides", yue: "兩側" },
  { key: "top", en: "Top", yue: "頂" },
  { key: "fringe", en: "Fringe", yue: "劉海" },
  { key: "finish", en: "Finish", yue: "造型" },
];

export type ComparePair = {
  left: Cut;
  right: Cut;
  line: { en: string; yue: string };
};

export function compareLine(left: Cut, right: Cut): { en: string; yue: string } {
  return {
    en: `I am choosing between ${left.nameEn} and ${right.nameEn}. Please talk me through the sides, the top, and the fringe.`,
    yue: `我想喺${left.nameYue}同${right.nameYue}之間揀。請你講下兩側、頂同劉海有咩分別。`,
  };
}

export function compareCuts(leftId: string, rightId: string): ComparePair | null {
  if (leftId === rightId) return null;
  const left = getCut(leftId);
  const right = getCut(rightId);
  if (!left || !right) return null;
  return { left, right, line: compareLine(left, right) };
}

export function parseCompare(value: unknown): { left: string; right: string } | null {
  if (!value || typeof value !== "object") return null;
  const pair = value as { left?: unknown; right?: unknown };
  if (!isCutId(pair.left) || !isCutId(pair.right) || pair.left === pair.right) return null;
  return { left: pair.left, right: pair.right };
}
