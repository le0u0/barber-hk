// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { BRIEF_KEY } from "./prefs";
import {
  RECENT_BRIEF_LIMIT,
  RECENT_BRIEFS_KEY,
  invalidateRecentBriefs,
  loadRecentBriefs,
  persistGuestBrief,
  recentBriefCount,
  recordRecentBrief,
} from "./recent-briefs";

describe("recent briefs", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    invalidateRecentBriefs();
  });

  it("starts at zero when nothing is stored", () => {
    expect(recentBriefCount()).toBe(0);
    expect(loadRecentBriefs()).toEqual([]);
  });

  it("counts each recorded brief up to the last eight", () => {
    for (let index = 0; index < RECENT_BRIEF_LIMIT + 1; index += 1) {
      recordRecentBrief(`cut-${index}`, 1_000 + index);
    }

    expect(recentBriefCount()).toBe(RECENT_BRIEF_LIMIT);
    expect(loadRecentBriefs().map((brief) => brief.cutId)).toEqual([
      "cut-8",
      "cut-7",
      "cut-6",
      "cut-5",
      "cut-4",
      "cut-3",
      "cut-2",
      "cut-1",
    ]);
    expect(loadRecentBriefs()[0]?.at).toBe(1_008);
  });

  it("drops stored entries that are not a cut id and a time", () => {
    localStorage.setItem(
      RECENT_BRIEFS_KEY,
      JSON.stringify([
        { cutId: "curtain", at: 5 },
        { cutId: "", at: 4 },
        { cutId: "x".repeat(81), at: 3 },
        { at: 2 },
        { cutId: "crop-fade", at: "today" },
        "pompadour",
      ]),
    );
    invalidateRecentBriefs();

    expect(loadRecentBriefs()).toEqual([{ cutId: "curtain", at: 5 }]);
  });

  it("ignores a stored value that is not a list", () => {
    localStorage.setItem(RECENT_BRIEFS_KEY, "{");
    invalidateRecentBriefs();
    expect(loadRecentBriefs()).toEqual([]);

    localStorage.setItem(RECENT_BRIEFS_KEY, JSON.stringify({ count: 4 }));
    invalidateRecentBriefs();
    expect(recentBriefCount()).toBe(0);
  });

  it("stores the session brief and counts the cut", () => {
    persistGuestBrief({ cut: { id: "two-block" }, brief: { en: {}, yue: {} } });

    expect(sessionStorage.getItem(BRIEF_KEY)).toContain("two-block");
    expect(recentBriefCount()).toBe(1);
    expect(loadRecentBriefs()[0]?.cutId).toBe("two-block");
    const stored = localStorage.getItem(RECENT_BRIEFS_KEY) ?? "";
    expect(stored).not.toContain("eastAsian");
    expect(stored).not.toContain("imageBase64");
  });

  it("keeps the session brief when the count cannot be saved", () => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItemGuarded(key: string, value: string) {
      if (key === RECENT_BRIEFS_KEY) throw new Error("quota");
      setItem.call(this, key, value);
    };
    try {
      persistGuestBrief({ cut: { id: "induction" } });
    } finally {
      Storage.prototype.setItem = setItem;
    }

    expect(sessionStorage.getItem(BRIEF_KEY)).toContain("induction");
    expect(recentBriefCount()).toBe(0);
  });

  it("does not count a brief that has no cut id", () => {
    persistGuestBrief({ brief: { en: {}, yue: {} } });

    expect(sessionStorage.getItem(BRIEF_KEY)).toContain("brief");
    expect(recentBriefCount()).toBe(0);
  });
});
