import { getCut } from "./catalog";
import type { BriefCopy, BriefResponse } from "./types";

const FIELDS = ["ask", "sides", "top", "fringe", "finish"] as const;

function isBriefCopy(value: unknown): value is BriefCopy {
  if (!value || typeof value !== "object") return false;
  const copy = value as Record<string, unknown>;
  return FIELDS.every((key) => typeof copy[key] === "string" && copy[key].trim().length > 0);
}

export function staticBriefForCut(id: string): BriefResponse | null {
  const cut = getCut(id);
  if (!cut) return null;
  return {
    source: "fallback",
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

export function parseBrief(raw: string | null): BriefResponse | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as BriefResponse;
    if (
      !data?.cut ||
      typeof data.cut.nameEn !== "string" ||
      typeof data.cut.nameYue !== "string" ||
      typeof data.cut.image !== "string" ||
      !isBriefCopy(data.brief?.en) ||
      !isBriefCopy(data.brief?.yue)
    ) {
      return null;
    }
    return {
      ...data,
      source: data.source === "gemini" ? "gemini" : "fallback",
    };
  } catch {
    return null;
  }
}

export function resolveStoredBrief(raw: string | null, lastCutId: string | null): BriefResponse | null {
  return parseBrief(raw) ?? (lastCutId ? staticBriefForCut(lastCutId) : null);
}
