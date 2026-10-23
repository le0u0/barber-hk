import { describe, expect, it } from "vitest";
import { deploySha } from "./deploy";

describe("deploySha", () => {
  it("prefers the Vercel commit sha", () => {
    expect(deploySha({ VERCEL_GIT_COMMIT_SHA: "abc", GITHUB_SHA: "def" })).toBe("abc");
  });

  it("falls back to the GitHub sha, then local", () => {
    expect(deploySha({ GITHUB_SHA: "def" })).toBe("def");
    expect(deploySha({})).toBe("local");
  });
});
