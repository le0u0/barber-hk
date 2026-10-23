import { describe, expect, it } from "vitest";
import { staticBriefForCut } from "./brief-resume";
import { formatBriefText } from "./brief-text";

describe("formatBriefText", () => {
  const brief = staticBriefForCut("crop-fade");

  it("copies one language and both cut names, never the slug or source", () => {
    expect(brief).not.toBeNull();
    const withSource = { ...brief!, source: "gemini" as const, fallbackReason: "missing_key" as const };
    const english = formatBriefText(withSource, "en");
    const yue = formatBriefText(withSource, "yue");

    expect(english).toContain("Textured crop fade");
    expect(english).toContain("Say this.");
    expect(english).not.toContain("照住講");
    expect(english).not.toContain("crop-fade");
    expect(english).not.toContain("GEMINI");
    expect(english).not.toContain("missing_key");

    expect(yue).toContain("碎蓋漸變");
    expect(yue).toContain("照住講");
    expect(yue).not.toContain("Say this");
    expect(yue).not.toContain("crop-fade");
  });

  it("shares English and Cantonese together", () => {
    const both = formatBriefText(brief!, "both");
    expect(both).toContain("English");
    expect(both).toContain("粵語");
    expect(both).toMatch(/[\u3400-\u9fff]/);
    expect(both).not.toContain("crop-fade");
  });
});
