import { describe, expect, it } from "vitest";
import {
  API_ERRORS,
  BRIEF_EMPTY,
  QUIZ_FAIL,
  SELFIE_AGAIN,
  SELFIE_FAIL,
  leadRest,
  resolveAlert,
  withFollowUp,
} from "./alert-copy";

describe("alert copy", () => {
  it("leads with the active language and keeps the other language", () => {
    expect(leadRest(BRIEF_EMPTY.title, false)).toEqual({
      lead: "No brief yet",
      rest: "未有備忘",
      restLang: "zh-HK",
    });
    expect(leadRest(BRIEF_EMPTY.body, true).lead).toBe("先做問卷或者自拍。");
    expect(leadRest(BRIEF_EMPTY.body, true).rest).toBe("Take the quiz or send a selfie.");
  });

  it("maps known API errors into English and Cantonese", () => {
    expect(resolveAlert("Use a JPEG, PNG, or WebP photo.", SELFIE_FAIL)).toEqual(
      API_ERRORS["Use a JPEG, PNG, or WebP photo."],
    );
    expect(resolveAlert("That photo is too large. Try a smaller one.", QUIZ_FAIL).yue).toBe("張相太大。試細張啲。");
  });

  it("keeps an unknown message and still adds Cantonese", () => {
    expect(resolveAlert("socket hang up", QUIZ_FAIL)).toEqual({
      en: "socket hang up",
      yue: "出唔到備忘。",
    });
    expect(resolveAlert(undefined, QUIZ_FAIL)).toEqual(QUIZ_FAIL);
    expect(resolveAlert("  ", QUIZ_FAIL)).toEqual(QUIZ_FAIL);
  });

  it("adds the try-again line in both languages", () => {
    const alert = withFollowUp(resolveAlert("That image was empty.", SELFIE_FAIL), SELFIE_AGAIN);
    expect(alert.en).toBe("That image was empty. Try another photo.");
    expect(alert.yue).toBe("張相係空嘅。 換張相。");
  });
});
