import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CREAM,
  INK,
  STONE_300,
  STONE_600,
  WHITE,
  contrastRatio,
  luminance,
  luminanceRgb,
  oklchToRgb,
} from "./contrast";

const UI_FILES = ["app/page.tsx", "app/quiz/page.tsx", "app/brief/page.tsx", "app/selfie/page.tsx", "app/header.tsx", "app/layout.tsx"];

describe("contrast", () => {
  it("rates black on white at 21:1", () => {
    expect(contrastRatio(luminance("#000000"), luminance("#ffffff"))).toBeCloseTo(21, 0);
  });

  it("converts the Tailwind stone-600 token", () => {
    expect(oklchToRgb(STONE_600.l, STONE_600.c, STONE_600.h)).toEqual([87, 83, 77]);
  });

  it("fails the old stone-300 borders and passes stone-600", () => {
    const oldLine = luminanceRgb(oklchToRgb(STONE_300.l, STONE_300.c, STONE_300.h));
    const line = luminanceRgb(oklchToRgb(STONE_600.l, STONE_600.c, STONE_600.h));
    const cream = luminance(CREAM);
    const white = luminance(WHITE);

    expect(contrastRatio(oldLine, cream)).toBeLessThan(3);
    expect(contrastRatio(oldLine, white)).toBeLessThan(3);
    expect(contrastRatio(line, cream)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(line, white)).toBeGreaterThanOrEqual(3);
  });

  it("keeps body text and muted text above 4.5:1 on the cream page", () => {
    const cream = luminance(CREAM);
    const muted = luminanceRgb(oklchToRgb(STONE_600.l, STONE_600.c, STONE_600.h));
    expect(contrastRatio(luminance(INK), cream)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(muted, cream)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(muted, luminance(WHITE))).toBeGreaterThanOrEqual(4.5);
  });
});

describe("reduced motion and border classes", () => {
  it("stops animation when the guest prefers reduced motion", () => {
    const css = readFileSync("app/globals.css", "utf8");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain("animation-duration: 0.01ms");
    expect(css).toContain("transition-duration: 0.01ms");
    expect(css).toContain("scroll-behavior: auto");
  });

  it("does not use the low-contrast stone-300 border", () => {
    for (const file of UI_FILES) {
      expect(readFileSync(file, "utf8")).not.toContain("border-stone-300");
    }
    expect(readFileSync("app/page.tsx", "utf8")).toContain("border-stone-600");
    expect(readFileSync("app/quiz/page.tsx", "utf8")).toContain("border-stone-600");
    expect(readFileSync("app/brief/page.tsx", "utf8")).toContain("border-stone-600");
  });
});
