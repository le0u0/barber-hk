import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { listCutCards } from "./catalog";
import { ANGLE_ORDER, cutView, listCutViews, slideAnnouncement, stepAngle } from "./cut-views";

const DEMO = ["crop-fade", "french-crop", "two-block"] as const;
const OFF_DEMO = ["side-part", "curtain", "undercut", "pompadour", "induction"] as const;

describe("cut views", () => {
  it("gives three cuts a real four-angle orbit and leaves the rest front-only", () => {
    const views = listCutViews();
    const orbits = views.filter((view) => view.orbit);
    const stills = views.filter((view) => !view.orbit);

    expect(orbits.map((view) => view.id)).toEqual([...DEMO]);
    expect(stills.map((view) => view.id)).toEqual([...OFF_DEMO]);

    for (const view of orbits) {
      expect(view.frames.map((frame) => frame.angle)).toEqual([...ANGLE_ORDER]);
      expect(view.frames.map((frame) => frame.image)).toEqual(
        ANGLE_ORDER.map((angle) => `/mtr-assets/angles/${view.id}/${angle}.jpg`),
      );
    }

    for (const view of stills) {
      expect(view.frames).toHaveLength(1);
      expect(view.frames[0].angle).toBe("front");
      expect(view.frames[0].image).toBe(`/mtr-assets/angles/${view.id}/front.jpg`);
      expect(view.frames.map((frame) => frame.angle)).not.toEqual([...ANGLE_ORDER]);
    }
  });

  it("ships the demo angle files and matches the pack manifest", () => {
    const manifest = JSON.parse(readFileSync(join(process.cwd(), "docs/angles/MANIFEST.json"), "utf8")) as {
      cutId: string;
      angle: string;
      status: string;
      source?: string | null;
      hash12?: string | null;
      path: string;
    }[];

    for (const id of DEMO) {
      for (const angle of ANGLE_ORDER) {
        const file = join(process.cwd(), "public/mtr-assets/angles", id, `${angle}.jpg`);
        expect(existsSync(file)).toBe(true);
        const hash12 = createHash("md5").update(readFileSync(file)).digest("hex").slice(0, 12);
        const row = manifest.find((entry) => entry.cutId === id && entry.angle === angle);
        expect(row?.status).toBe("generated");
        expect(row?.path).toBe(`mtr-assets/angles/${id}/${angle}.jpg`);
        expect(row?.hash12).toBe(hash12);
      }
      expect(existsSync(join(process.cwd(), "public/mtr-assets/angles", id, "strip-4.jpg"))).toBe(true);
    }

    const cards = new Map(listCutCards().map((card) => [card.id, card.image]));
    for (const id of OFF_DEMO) {
      const front = join(process.cwd(), "public/mtr-assets/angles", id, "front.jpg");
      expect(existsSync(front)).toBe(true);
      const hash12 = createHash("md5").update(readFileSync(front)).digest("hex").slice(0, 12);
      const rows = manifest.filter((entry) => entry.cutId === id);
      expect(rows.map((entry) => entry.angle)).toEqual([...ANGLE_ORDER]);
      const frontRow = rows.find((entry) => entry.angle === "front");
      expect(frontRow?.status).toBe("generated");
      expect(frontRow?.source).toBe("front-only synthetic");
      expect(frontRow?.path).toBe(`mtr-assets/angles/${id}/front.jpg`);
      expect(frontRow?.hash12).toBe(hash12);
      expect(cards.get(id)).toBe(`/mtr-assets/angles/${id}/front.jpg`);
      for (const angle of ANGLE_ORDER) {
        if (angle === "front") continue;
        const row = rows.find((entry) => entry.angle === angle);
        expect(row?.status).toBe("off-demo-path");
        expect(row?.status).not.toBe("generated");
        expect(existsSync(join(process.cwd(), "public/mtr-assets/angles", id, `${angle}.jpg`))).toBe(false);
      }
    }
  });

  it("resolves an orbit and ignores an unknown id", () => {
    expect(cutView("french-crop")?.frames).toHaveLength(4);
    expect(cutView("curtain")?.orbit).toBe(false);
    expect(cutView("induction")?.orbit).toBe(false);
    expect(cutView("not-a-cut")).toBeNull();
    expect(cutView(null)).toBeNull();
  });
});

describe("carousel steps", () => {
  it("moves with arrows and jumps with home and end", () => {
    expect(stepAngle(0, 4, "ArrowRight")).toBe(1);
    expect(stepAngle(3, 4, "ArrowRight")).toBe(3);
    expect(stepAngle(2, 4, "ArrowLeft")).toBe(1);
    expect(stepAngle(0, 4, "ArrowLeft")).toBe(0);
    expect(stepAngle(2, 4, "Home")).toBe(0);
    expect(stepAngle(1, 4, "End")).toBe(3);
    expect(stepAngle(1, 4, "Enter")).toBeNull();
  });

  it("announces the slide in English and Cantonese", () => {
    expect(slideAnnouncement(1, 4, "side")).toBe("2 of 4, Side 側面");
    expect(slideAnnouncement(0, 4, "front")).toBe("1 of 4, Front 正面");
  });
});
