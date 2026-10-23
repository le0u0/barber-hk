import { describe, expect, it } from "vitest";
import { isQaMode, showSampleFixture } from "./qa";

describe("qa mode", () => {
  it("is only the qa=1 query", () => {
    expect(isQaMode("1")).toBe(true);
    expect(isQaMode("0")).toBe(false);
    expect(isQaMode("true")).toBe(false);
    expect(isQaMode(null)).toBe(false);
  });

  it("hides the sample photo on a production visit without qa=1", () => {
    expect(showSampleFixture("production", null)).toBe(false);
    expect(showSampleFixture("production", "1")).toBe(true);
    expect(showSampleFixture("development", null)).toBe(true);
  });
});
