import { describe, expect, it } from "vitest";
import { resolveStoredBrief, staticBriefForCut } from "./brief-resume";

describe("resolveStoredBrief", () => {
  it("keeps a stored brief ahead of the last cut id", () => {
    const raw = JSON.stringify(staticBriefForCut("curtain"));
    expect(resolveStoredBrief(raw, "induction")?.cut.nameEn).toBe("Curtain middle part");
  });

  it("rebuilds the catalog brief when the device only remembers the cut", () => {
    expect(resolveStoredBrief(null, "induction")?.cut.nameYue).toBe("陸軍裝");
  });

  it("ignores corrupt storage and unknown ids", () => {
    expect(resolveStoredBrief("{", "nope")).toBeNull();
    expect(resolveStoredBrief(null, null)).toBeNull();
    expect(resolveStoredBrief(JSON.stringify({ brief: { en: { ask: "x" } } }), "induction")?.cut.nameYue).toBe(
      "陸軍裝",
    );
  });
});
