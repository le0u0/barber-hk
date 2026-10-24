import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "../docs/angles/MANIFEST.json";
import {
  ANGLE_ORDER,
  FRONT_ONLY_LABEL,
  SYNTHETIC_BADGE,
  listCutCards,
  orbitFor,
  stepAngle,
} from "./cut-views";

const ROOT = path.resolve(import.meta.dirname, "..");
const DEMO = ["crop-fade", "french-crop", "two-block"];
const HOLD = ["side-part", "curtain", "undercut", "pompadour", "induction"];

type Row = {
  cutId: string;
  angle?: string;
  path?: string;
  status: string;
  md5?: string;
};

const rows = manifest as Row[];

describe("six-angle carousel", () => {
  it("orbits clockwise from the front through both sides", () => {
    expect(ANGLE_ORDER).toEqual([
      "front",
      "three-quarter-left",
      "side-left",
      "back",
      "side-right",
      "three-quarter-right",
    ]);
  });

  it("opens a six-frame carousel only for the three demo cuts", () => {
    const cards = listCutCards();
    expect(cards.map((card) => card.id)).toEqual([
      "crop-fade",
      "french-crop",
      "two-block",
      "side-part",
      "curtain",
      "undercut",
      "pompadour",
      "induction",
    ]);
    for (const id of DEMO) {
      const frames = orbitFor(id);
      expect(frames?.map((frame) => frame.angle)).toEqual([...ANGLE_ORDER]);
      expect(frames?.every((frame) => frame.image === `/mtr-assets/angles/${id}/${frame.angle}.jpg`)).toBe(
        true,
      );
    }
    for (const id of HOLD) {
      const card = cards.find((entry) => entry.id === id);
      expect(orbitFor(id)).toBeNull();
      expect(card?.orbit).toBe(false);
      expect(card?.image).toBe(`/cuts/${id}.svg`);
      expect(card?.frames).toHaveLength(1);
    }
  });

  it("matches manifest hashes and does not stub the held cuts", () => {
    const generated = rows.filter((row) => row.status === "generated");
    expect(generated).toHaveLength(DEMO.length * ANGLE_ORDER.length);
    for (const row of generated) {
      expect(row.path && row.md5).toBeTruthy();
      const file = path.join(ROOT, "public", row.path as string);
      const md5 = createHash("md5").update(readFileSync(file)).digest("hex").slice(0, 12);
      expect(md5).toBe(row.md5);
      expect(row.path).not.toContain("strip-6");
    }
    for (const id of HOLD) {
      expect(rows.filter((row) => row.cutId === id && row.status === "generated")).toEqual([]);
      expect(existsSync(path.join(ROOT, "public/mtr-assets/angles", id))).toBe(false);
    }
    const packed = readdirSync(path.join(ROOT, "public/mtr-assets/angles")).sort();
    expect(packed).toEqual([...DEMO].sort());
  });

  it("keeps the synthetic badge as one locale and cycles the index", () => {
    expect(SYNTHETIC_BADGE.en).toBe("Synthetic ref");
    expect(SYNTHETIC_BADGE.yue).not.toMatch(/Synthetic/);
    expect(FRONT_ONLY_LABEL.en).toBe("Front only");
    expect(stepAngle(0, -1, 6)).toBe(5);
    expect(stepAngle(5, 1, 6)).toBe(0);
    expect(stepAngle(2, 1, 6)).toBe(3);
  });
});
