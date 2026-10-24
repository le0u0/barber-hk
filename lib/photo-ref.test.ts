import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getCut, listCuts } from "./catalog";
import { PHOTO_REFS, SYNTHETIC_BADGE, SYNTHETIC_CAPTION, displayImage } from "./photo-ref";

const ROOT = path.resolve(import.meta.dirname, "..");

describe("photo quality swap", () => {
  it("replaces only the French crop diagram with the pack front frame", () => {
    expect(Object.keys(PHOTO_REFS)).toEqual(["french-crop"]);
    const french = getCut("french-crop");
    expect(french?.image).toBe("/cuts/french-crop.svg");
    if (!french) throw new Error("french-crop missing");
    expect(displayImage(french).src).toBe("/mtr-assets/angles/french-crop/front.jpg");
    expect(displayImage(french).synthetic).toBe(true);

    for (const cut of listCuts()) {
      if (cut.id === "french-crop") continue;
      expect(displayImage(cut)).toEqual({ src: cut.image, synthetic: false });
      expect(cut.image).toBe(`/cuts/${cut.id}.svg`);
    }
  });

  it("matches the amend-pack file and does not stub the other cuts", () => {
    const file = path.join(ROOT, "public/mtr-assets/angles/french-crop/front.jpg");
    const md5 = createHash("md5").update(readFileSync(file)).digest("hex").slice(0, 12);
    expect(md5).toBe(PHOTO_REFS["french-crop"].md5);
    expect(readdirSync(path.join(ROOT, "public/mtr-assets/angles"))).toEqual(["french-crop"]);
    for (const id of ["crop-fade", "two-block", "side-part", "curtain", "undercut", "pompadour", "induction"]) {
      expect(existsSync(path.join(ROOT, "public/mtr-assets/angles", id))).toBe(false);
    }
  });

  it("keeps the synthetic badge on the swapped frame", () => {
    expect(SYNTHETIC_BADGE.en).toBe("Synthetic ref");
    expect(SYNTHETIC_BADGE.yue).toBe("合成參考");
    expect(SYNTHETIC_CAPTION.en).toBe("Not a customer photo");
    expect(SYNTHETIC_CAPTION.yue).toBe("唔係客人相");
  });
});
