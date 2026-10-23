import { describe, expect, it } from "vitest";
import { ANGLE_ORDER, cutView, listCutViews, slideAnnouncement, stepAngle } from "./cut-views";

describe("cut views", () => {
  it("gives three cuts a real four-angle orbit and leaves the rest front-only", () => {
    const views = listCutViews();
    const orbits = views.filter((view) => view.orbit);
    const stills = views.filter((view) => !view.orbit);

    expect(orbits.map((view) => view.id)).toEqual(["crop-fade", "two-block", "curtain"]);
    expect(stills.map((view) => view.id)).toEqual([
      "french-crop",
      "side-part",
      "undercut",
      "pompadour",
      "induction",
    ]);

    for (const view of orbits) {
      expect(view.frames.map((frame) => frame.angle)).toEqual([...ANGLE_ORDER]);
      const images = view.frames.map((frame) => frame.image);
      expect(new Set(images).size).toBe(4);
      for (const image of images) {
        expect(image).not.toContain(view.id);
      }
    }

    for (const view of stills) {
      expect(view.frames).toEqual([{ angle: "front", image: expect.stringMatching(/\.jpg$/) }]);
      expect(view.frames[0].image).not.toContain(view.id);
    }
  });

  it("resolves an orbit and ignores an unknown id", () => {
    expect(cutView("curtain")?.frames).toHaveLength(4);
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
