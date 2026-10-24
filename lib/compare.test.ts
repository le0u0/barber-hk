import { describe, expect, it } from "vitest";
import { COMPARE_FIELDS, compareCuts, parseCompare } from "./compare";

describe("compareCuts", () => {
  it("pairs two different cuts and writes a bilingual line for the barber", () => {
    const pair = compareCuts("crop-fade", "french-crop");

    expect(pair?.left.id).toBe("crop-fade");
    expect(pair?.right.nameEn).toBe("French crop");
    expect(pair?.line.en).toMatch(/Textured crop fade/);
    expect(pair?.line.en).toMatch(/French crop/);
    expect(pair?.line.yue).toMatch(/碎蓋漸變/);
    expect(pair?.line.yue).toMatch(/法式碎蓋/);
    expect(pair?.line.yue).toMatch(/[\u3400-\u9fff]/);
  });

  it("refuses the same cut and unknown ids", () => {
    expect(compareCuts("curtain", "curtain")).toBeNull();
    expect(compareCuts("curtain", "not-a-cut")).toBeNull();
    expect(compareCuts("not-a-cut", "curtain")).toBeNull();
  });

  it("names the five brief lines in English and Cantonese", () => {
    expect(COMPARE_FIELDS.map((field) => field.key)).toEqual(["ask", "sides", "top", "fringe", "finish"]);
    for (const field of COMPARE_FIELDS) {
      expect(field.en.length).toBeGreaterThan(0);
      expect(field.yue).toMatch(/[\u3400-\u9fff]/);
    }
  });
});

describe("parseCompare", () => {
  it("keeps two different known cuts", () => {
    expect(parseCompare({ left: "side-part", right: "undercut" })).toEqual({
      left: "side-part",
      right: "undercut",
    });
  });

  it("drops a pair that is the same cut, unknown, or not an object", () => {
    expect(parseCompare({ left: "curtain", right: "curtain" })).toBeNull();
    expect(parseCompare({ left: "nope", right: "curtain" })).toBeNull();
    expect(parseCompare(null)).toBeNull();
    expect(parseCompare("crop-fade")).toBeNull();
  });
});
