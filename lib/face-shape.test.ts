import { describe, expect, it } from "vitest";
import { getCut } from "./catalog";
import {
  FACE_CHART_COPY,
  FACE_OUTLINES,
  FACE_SHAPES,
  faceGuide,
  faceShapeById,
  isFaceShape,
} from "./face-shape";

describe("face shape chart", () => {
  it("lists six outlines with English and Cantonese notes", () => {
    expect(FACE_SHAPES.map((shape) => shape.id)).toEqual([
      "oval",
      "round",
      "square",
      "oblong",
      "heart",
      "diamond",
    ]);

    for (const shape of FACE_SHAPES) {
      expect(shape.nameEn.length).toBeGreaterThan(0);
      expect(shape.nameYue).toMatch(/[\u3400-\u9fff]/);
      expect(shape.noteEn.length).toBeGreaterThan(0);
      expect(shape.noteYue).toMatch(/[\u3400-\u9fff]/);
      expect(FACE_OUTLINES[shape.id].length).toBeGreaterThan(10);
      expect(shape.suits.length).toBeGreaterThan(0);
      for (const id of shape.suits) {
        expect(getCut(id)?.id).toBe(id);
      }
    }
  });

  it("describes a paper chart and refuses a try-on", () => {
    expect(FACE_CHART_COPY.disclaimerEn).toMatch(/paper chart/i);
    expect(FACE_CHART_COPY.disclaimerEn).toMatch(/no face morph/i);
    expect(FACE_CHART_COPY.disclaimerYue).toMatch(/圖表/);
    expect(FACE_CHART_COPY.disclaimerYue).toMatch(/唔會變面/);
  });

  it("accepts a known shape and rejects anything else", () => {
    expect(isFaceShape("round")).toBe(true);
    expect(isFaceShape("triangle")).toBe(false);
    expect(isFaceShape(null)).toBe(false);
    expect(faceShapeById("heart")?.nameYue).toBe("心形面");
    expect(faceGuide("round")).toEqual({
      id: "round",
      nameEn: "Round",
      nameYue: "圓面",
      noteEn: expect.stringContaining("height on top"),
      noteYue: expect.stringMatching(/[\u3400-\u9fff]/),
    });
    expect(faceGuide("triangle")).toBeNull();
    expect(faceGuide(undefined)).toBeNull();
  });
});
