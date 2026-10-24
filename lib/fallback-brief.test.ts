import { describe, expect, it, vi } from "vitest";
import {
  EMPTY_BRIEF,
  MISSING_KEY_NOTICE,
  OFFLINE_NOTICE,
  QuizRequestError,
  SELFIE_OFFLINE,
  fallbackPanel,
  localQuizBrief,
  requestQuizBrief,
} from "./fallback-brief";
import type { QuizAnswers } from "./types";

const crop: QuizAnswers = { sides: "skin", top: "short", finish: "textured", part: "none" };
const french: QuizAnswers = { sides: "taper", top: "short", finish: "textured", part: "none" };

describe("localQuizBrief", () => {
  it("builds the matched cut offline in English and Cantonese", () => {
    const brief = localQuizBrief(french);

    expect(brief.source).toBe("fallback");
    expect(brief.fallbackReason).toBe("offline");
    expect(brief.cut.id).toBe("french-crop");
    expect(brief.notice).toEqual(OFFLINE_NOTICE);
    expect(brief.notice?.yue).toMatch(/[\u3400-\u9fff]/);
    expect(brief.brief.yue.ask).toMatch(/[\u3400-\u9fff]/);
  });
});

describe("requestQuizBrief", () => {
  it("does not call the network when the browser is offline", async () => {
    const fetchImpl = vi.fn();
    const brief = await requestQuizBrief(crop, { onLine: false, fetchImpl });

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(brief.cut.id).toBe("crop-fade");
    expect(brief.fallbackReason).toBe("offline");
  });

  it("uses the saved cut when the request fails to connect", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    const brief = await requestQuizBrief(french, { onLine: true, fetchImpl });

    expect(brief.cut.id).toBe("french-crop");
    expect(brief.fallbackReason).toBe("offline");
  });

  it("keeps an API fallback response instead of replacing it", async () => {
    const payload = {
      source: "fallback",
      fallbackReason: "missing_key",
      cut: { id: "crop-fade", nameEn: "Textured crop fade", nameYue: "碎蓋漸變", image: "/cuts/crop-fade.svg", eastAsianNote: "note" },
      brief: { en: { ask: "a", sides: "b", top: "c", fringe: "d", finish: "e" }, yue: { ask: "甲", sides: "乙", top: "丙", fringe: "丁", finish: "戊" } },
    };
    const fetchImpl = vi.fn().mockResolvedValue(Response.json(payload));
    const brief = await requestQuizBrief(crop, { onLine: true, fetchImpl });

    expect(brief.fallbackReason).toBe("missing_key");
    expect(brief.cut.id).toBe("crop-fade");
  });

  it("throws the server error when the quiz is rejected", async () => {
    const fetchImpl = vi.fn().mockImplementation(() =>
      Promise.resolve(Response.json({ error: "Quiz answers are incomplete." }, { status: 400 })),
    );

    await expect(requestQuizBrief(crop, { onLine: true, fetchImpl })).rejects.toBeInstanceOf(QuizRequestError);
    await expect(requestQuizBrief(crop, { onLine: true, fetchImpl })).rejects.toThrow(/incomplete/);
  });
});

describe("fallbackPanel", () => {
  it("hides the panel when Gemini answered", () => {
    expect(fallbackPanel({ source: "gemini" })).toBeNull();
  });

  it("explains a missing key in English and Cantonese", () => {
    expect(fallbackPanel({ source: "fallback", fallbackReason: "missing_key" })).toEqual({
      title: { en: "Saved cut", yue: "已儲髮型" },
      body: MISSING_KEY_NOTICE,
    });
    expect(MISSING_KEY_NOTICE.yue).toMatch(/[\u3400-\u9fff]/);
  });

  it("uses the API notice when one was sent", () => {
    const notice = { en: "The photo was not read.", yue: "相片未讀到。" };
    expect(fallbackPanel({ source: "fallback", fallbackReason: "gemini_error", notice })).toEqual({
      title: { en: "Saved cut", yue: "已儲髮型" },
      body: notice,
    });
  });

  it("explains an empty brief in both languages, including offline", () => {
    expect(EMPTY_BRIEF.title.yue).toBe("未有備忘");
    expect(EMPTY_BRIEF.body.en).toMatch(/quiz/i);
    expect(EMPTY_BRIEF.offline.yue).toMatch(/離線/);
    expect(SELFIE_OFFLINE.en).toMatch(/offline/i);
    expect(SELFIE_OFFLINE.yue).toMatch(/離線/);
  });
});
