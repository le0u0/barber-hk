import { BRIEF_KEY } from "./prefs";

export const RECENT_BRIEFS_KEY = "barber-hk:recent-briefs:v1";
export const RECENT_BRIEF_LIMIT = 8;
export const RECENT_BRIEFS_EVENT = "barber-hk-recent-briefs";

export type RecentBrief = {
  cutId: string;
  at: number;
};

let cachedRaw: string | null | undefined;
let cachedBriefs: RecentBrief[] = [];

function isRecentBrief(value: unknown): value is RecentBrief {
  if (!value || typeof value !== "object") return false;
  const brief = value as Record<string, unknown>;
  return (
    typeof brief.cutId === "string" &&
    brief.cutId.length > 0 &&
    brief.cutId.length <= 80 &&
    typeof brief.at === "number" &&
    Number.isFinite(brief.at)
  );
}

function parseRecentBriefs(raw: string | null): RecentBrief[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(isRecentBrief).slice(0, RECENT_BRIEF_LIMIT);
  } catch {
    return [];
  }
}

export function invalidateRecentBriefs() {
  cachedRaw = undefined;
}

export function loadRecentBriefs(): RecentBrief[] {
  if (typeof window === "undefined") return [];
  let raw: string | null;
  try {
    raw = localStorage.getItem(RECENT_BRIEFS_KEY);
  } catch {
    return [];
  }
  if (cachedRaw !== undefined && raw === cachedRaw) return cachedBriefs;
  cachedRaw = raw;
  cachedBriefs = parseRecentBriefs(raw);
  return cachedBriefs;
}

export function recentBriefCount(): number {
  return loadRecentBriefs().length;
}

export function recordRecentBrief(cutId: string, at = Date.now()): RecentBrief[] {
  if (!isRecentBrief({ cutId, at })) return loadRecentBriefs();
  const next = [{ cutId, at }, ...loadRecentBriefs()].slice(0, RECENT_BRIEF_LIMIT);
  try {
    const raw = JSON.stringify(next);
    localStorage.setItem(RECENT_BRIEFS_KEY, raw);
    cachedRaw = raw;
    cachedBriefs = next;
    window.dispatchEvent(new Event(RECENT_BRIEFS_EVENT));
  } catch {
    return loadRecentBriefs();
  }
  return next;
}

function cutIdOf(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const id = (data as { cut?: { id?: unknown } }).cut?.id;
  return typeof id === "string" && id.length > 0 && id.length <= 80 ? id : null;
}

export function persistGuestBrief(data: unknown) {
  sessionStorage.setItem(BRIEF_KEY, JSON.stringify(data));
  const cutId = cutIdOf(data);
  if (cutId) recordRecentBrief(cutId);
}
