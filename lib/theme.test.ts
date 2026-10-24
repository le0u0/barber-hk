import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(import.meta.dirname, "..");

const TOKENS: Record<string, string> = {
  "--canvas": "#F4EFE6",
  "--elevated": "#FFFCFA",
  "--ink": "#12141A",
  "--muted": "#6B6560",
  "--line": "#D9D2C7",
  "--accent": "#C8102E",
  "--accent-ink": "#FFFCFA",
  "--focus": "#C8102E",
  "--danger": "#9B1B1B",
  "--radius-card": "12px",
  "--tap-min": "44px",
};

function walk(dir: string, out: string[]) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(css|tsx|ts)$/.test(entry)) out.push(full);
  }
  return out;
}

describe("ink + vermillion tokens", () => {
  const css = readFileSync(path.join(ROOT, "app/globals.css"), "utf8");

  it("defines the Leo amend tokens", () => {
    for (const [name, value] of Object.entries(TOKENS)) {
      const match = css.match(new RegExp(`${name}:\\s*([^;]+);`));
      expect(match?.[1]?.trim().toLowerCase()).toBe(value.toLowerCase());
    }
  });

  it("paints primary CTAs and active controls with the accent", () => {
    expect(css).toMatch(/\.btn-primary\s*\{[^}]*background:\s*var\(--accent\)/);
    expect(css).toMatch(/\.btn-primary\s*\{[^}]*color:\s*var\(--accent-ink\)/);
    expect(css).toMatch(/accent-color:\s*var\(--accent\)/);
    expect(css).toMatch(/outline:\s*2px solid var\(--focus\)/);
  });

  it("keeps #FFD300 out of visitor chrome", () => {
    const files = walk(path.join(ROOT, "app"), []);
    const hits = files.filter((file) => /#ffd300/i.test(readFileSync(file, "utf8")));
    expect(hits).toEqual([]);
  });

  it("uses the vermillion button on the home, quiz, and selfie screens", () => {
    for (const file of ["app/page.tsx", "app/quiz/page.tsx", "app/selfie/page.tsx"]) {
      const source = readFileSync(path.join(ROOT, file), "utf8");
      expect(source).toContain("btn-primary");
      expect(source).not.toMatch(/#ffd300/i);
      expect(source).not.toMatch(/yellow|amber/i);
    }
  });
});
