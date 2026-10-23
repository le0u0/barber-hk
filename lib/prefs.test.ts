// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  BRIEF_KEY,
  EMPTY_PREFS,
  LAST_BRIEF_KEY,
  PREFS_KEY,
  invalidatePrefs,
  isQuiz,
  loadPrefs,
  readBriefRaw,
  saveBrief,
  savePrefs,
} from "./prefs";

const validQuiz = {
  sides: "skin",
  top: "short",
  finish: "textured",
  part: "none",
} as const;

describe("isQuiz", () => {
  it("accepts a quiz that names sides, top, finish, and part", () => {
    expect(isQuiz(validQuiz)).toBe(true);
  });

  it("rejects a quiz that omits the part", () => {
    expect(isQuiz({ sides: "skin", top: "short", finish: "textured" })).toBe(false);
  });

  it("rejects a quiz that uses an unknown side", () => {
    expect(isQuiz({ ...validQuiz, sides: "bald" })).toBe(false);
  });

  it("rejects a non-object", () => {
    expect(isQuiz(null)).toBe(false);
    expect(isQuiz("crop-fade")).toBe(false);
  });
});

describe("guest prefs", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    invalidatePrefs();
  });

  it("loads empty guest prefs when nothing is stored", () => {
    expect(loadPrefs()).toEqual(EMPTY_PREFS);
  });

  it("drops a stored quiz that is not a complete quiz and keeps the language", () => {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ lang: "yue", quiz: { sides: "skin" }, lastCutId: "curtain" }),
    );
    invalidatePrefs();

    expect(loadPrefs()).toEqual({ lang: "yue", quiz: null, lastCutId: "curtain" });
  });

  it("ignores stored prefs that are not json", () => {
    localStorage.setItem(PREFS_KEY, "{");
    invalidatePrefs();

    expect(loadPrefs()).toEqual(EMPTY_PREFS);
  });

  it("saves language, quiz, and last cut for the next load", () => {
    savePrefs({ lang: "yue", quiz: validQuiz, lastCutId: "crop-fade" });

    expect(loadPrefs()).toEqual({ lang: "yue", quiz: validQuiz, lastCutId: "crop-fade" });
    expect(localStorage.getItem(PREFS_KEY)).toContain("crop-fade");
  });

  it("keeps the last brief for this tab and the next visit", () => {
    saveBrief({ cut: { nameEn: "Two-block" } });

    expect(sessionStorage.getItem(BRIEF_KEY)).toContain("Two-block");
    expect(localStorage.getItem(LAST_BRIEF_KEY)).toContain("Two-block");

    sessionStorage.clear();
    expect(readBriefRaw()).toContain("Two-block");
  });
});
