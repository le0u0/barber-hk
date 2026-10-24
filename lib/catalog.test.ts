import { describe, expect, it } from "vitest";
import { isCutId, matchCut } from "./catalog";
import type { QuizAnswers } from "./types";

function quiz(answers: QuizAnswers): QuizAnswers {
  return answers;
}

describe("matchCut", () => {
  it("maps a buzz cut to induction", () => {
    expect(matchCut(quiz({ sides: "skin", top: "buzz", finish: "natural", part: "none" })).id).toBe(
      "induction",
    );
  });

  it("maps a middle part to curtain", () => {
    expect(
      matchCut(quiz({ sides: "taper", top: "medium", finish: "textured", part: "middle" })).id,
    ).toBe("curtain");
  });

  it("maps a long sleek side part to pompadour", () => {
    expect(matchCut(quiz({ sides: "taper", top: "long", finish: "sleek", part: "side" })).id).toBe(
      "pompadour",
    );
  });

  it("maps a sleek skin fade with a side part to undercut", () => {
    expect(matchCut(quiz({ sides: "skin", top: "medium", finish: "sleek", part: "side" })).id).toBe(
      "undercut",
    );
  });

  it("maps a sleek scissor side part to side-part", () => {
    expect(
      matchCut(quiz({ sides: "scissor", top: "short", finish: "sleek", part: "side" })).id,
    ).toBe("side-part");
  });

  it("maps a short textured skin fade to crop-fade", () => {
    expect(
      matchCut(quiz({ sides: "skin", top: "short", finish: "textured", part: "none" })).id,
    ).toBe("crop-fade");
  });

  it("maps a short textured scissor cut with no part to french-crop", () => {
    expect(
      matchCut(quiz({ sides: "taper", top: "short", finish: "textured", part: "none" })).id,
    ).toBe("french-crop");
  });

  it("recognises the eight cut ids and rejects anything else", () => {
    expect(isCutId("induction")).toBe(true);
    expect(isCutId("not-a-cut")).toBe(false);
    expect(isCutId(null)).toBe(false);
  });

  it("maps a natural medium taper with no part to two-block", () => {
    expect(
      matchCut(quiz({ sides: "taper", top: "medium", finish: "natural", part: "none" })).id,
    ).toBe("two-block");
  });
});
