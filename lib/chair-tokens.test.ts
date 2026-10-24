import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { chairError, joinCopy, lead, quizCopy, quizQuestions, selfieCopy } from "./chair-copy";
import { chairLineStyle, chairOptionStyle, chairPrimaryStyle, chairTokens } from "./chair-tokens";

const CJK = /[\u3400-\u9fff]/;
const YELLOW = /#ffd300|mtr-yellow/i;

describe("chair tokens", () => {
  it("uses Leo canvas and ink, with vermillion as the only accent", () => {
    expect(chairTokens).toEqual({
      canvas: "#F7F4EB",
      ink: "#0A0A0A",
      vermillion: "#C8102E",
      onVermillion: "#FFFFFF",
    });

    const paint = [
      readFileSync("app/quiz/page.tsx", "utf8"),
      readFileSync("app/selfie/page.tsx", "utf8"),
      readFileSync("lib/chair-tokens.ts", "utf8"),
      readFileSync("lib/use-chair-paint.ts", "utf8"),
    ].join("\n");

    expect(paint.toLowerCase()).toContain(chairTokens.canvas.toLowerCase());
    expect(paint.toLowerCase()).toContain(chairTokens.ink.toLowerCase());
    expect(paint.toLowerCase()).toContain(chairTokens.vermillion.toLowerCase());
    expect(paint).not.toMatch(YELLOW);
    expect(chairPrimaryStyle()).toMatchObject({
      background: chairTokens.vermillion,
      color: chairTokens.onVermillion,
      minHeight: 44,
      borderRadius: 2,
    });
    expect(chairLineStyle().borderColor).toBe(chairTokens.ink);
    expect(chairOptionStyle(true).borderColor).toBe(chairTokens.vermillion);
    expect(chairOptionStyle(false).borderColor).not.toBe(chairTokens.vermillion);
    expect(JSON.stringify(chairOptionStyle(true))).not.toMatch(YELLOW);
  });
});

describe("chair copy", () => {
  it("keeps English and Cantonese on every quiz and selfie line", () => {
    const lines = [
      ...Object.values(quizCopy),
      ...Object.values(selfieCopy),
      ...quizQuestions.flatMap((question) => [question.legend, ...question.options.map((option) => option.label)]),
    ];

    expect(quizQuestions.map((question) => question.key)).toEqual(["sides", "top", "finish", "part"]);
    for (const line of lines) {
      expect(line.en.trim().length).toBeGreaterThan(0);
      expect(line.yue).toMatch(CJK);
    }
  });

  it("leads with the guest language and still shows the other", () => {
    expect(lead("yue", quizCopy.title)).toEqual({
      primary: "問卷",
      primaryLang: "zh-HK",
      secondary: "Quiz",
      secondaryLang: "en",
    });
    expect(lead("en", quizCopy.submit)).toEqual({
      primary: "Show brief",
      primaryLang: "en",
      secondary: "出備忘",
      secondaryLang: "zh-HK",
    });
  });

  it("joins both languages and appends Cantonese when an API error is English only", () => {
    expect(joinCopy(quizCopy.incomplete)).toBe("Answer every question. 請答完四條。");
    expect(chairError(new Error("Quiz answers are incomplete."), quizCopy.fail)).toBe(
      "Quiz answers are incomplete. 出唔到備忘。",
    );
    expect(chairError(new Error("請先揀相。"), selfieCopy.needPhoto)).toBe("請先揀相。");
    expect(chairError("nope", selfieCopy.fail)).toBe("Could not read that photo. 讀唔到呢張相。");
  });
});

describe("guest storage on the painted screens", () => {
  it("still saves prefs and the tab brief", () => {
    for (const file of ["app/quiz/page.tsx", "app/selfie/page.tsx"]) {
      const source = readFileSync(file, "utf8");
      expect(source).toContain("savePrefs");
      expect(source).toContain("BRIEF_KEY");
      expect(source).toContain("useChairPaint");
      expect(source).toContain("chairStyle");
    }
  });
});
