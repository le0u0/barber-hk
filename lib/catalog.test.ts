import { describe, expect, it } from "vitest";
import { cutCard, listCutCards, matchCut } from "./catalog";
import { cutDisplayName } from "./cut-name";
import type { QuizAnswers } from "./types";

function quiz(answers: QuizAnswers): QuizAnswers {
  return answers;
}

describe("cut cards", () => {
  it("names every cut in English and Cantonese instead of the slug", () => {
    const cards = listCutCards();
    expect(cards).toHaveLength(8);
    for (const card of cards) {
      expect(cutDisplayName(card, "en")).toBe(card.nameEn);
      expect(cutDisplayName(card, "yue")).toBe(card.nameYue);
      expect(card.nameEn).not.toBe(card.id);
      expect(card.nameYue).not.toBe(card.id);
      expect(card.nameEn).not.toMatch(/^[a-z0-9-]+$/);
      expect(card.image.endsWith(".jpg")).toBe(true);
    }
  });

  it("resolves a known last pick and hides unknown ids", () => {
    expect(cutCard("two-block")).toMatchObject({ nameEn: "Two-block", nameYue: "兩節頭" });
    expect(cutCard("not-a-cut")).toBeNull();
    expect(cutCard(null)).toBeNull();
  });
});

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

  it("maps a natural medium taper with no part to two-block", () => {
    expect(
      matchCut(quiz({ sides: "taper", top: "medium", finish: "natural", part: "none" })).id,
    ).toBe("two-block");
  });
});
