import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { briefOutputLang, cutLabel, cutsHeading, t, type Locale } from "./i18n";

const ROOT = path.resolve(import.meta.dirname, "..");
const DUAL =
  /[A-Za-z]{3,}[^"'`\n]{0,40}[\u3400-\u9fff]|[\u3400-\u9fff][^"'`\n]{0,40}[A-Za-z]{3,}/;
const LITERAL = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g;

function walk(dir: string, out: string[]) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx|ts)$/.test(entry) && !full.includes(`${path.sep}api${path.sep}`)) out.push(full);
  }
  return out;
}

describe("single-locale chrome", () => {
  it("keeps English chrome free of Cantonese and Cantonese chrome in Cantonese", () => {
    const keys = [
      "quiz",
      "selfie",
      "homeTitle",
      "lastPick",
      "showBrief",
      "readPhoto",
      "photo",
      "noBrief",
    ] as const;
    for (const key of keys) {
      expect(t("en", key)).not.toMatch(/[\u3400-\u9fff]/);
      expect(t("yue", key)).toMatch(/[\u3400-\u9fff]/);
      expect(t("en", key)).not.toBe(t("yue", key));
    }
  });

  it("names a cut in one locale", () => {
    const cut = { nameEn: "French crop", nameYue: "法式碎蓋" };
    expect(cutLabel(cut, "en")).toBe("French crop");
    expect(cutLabel(cut, "yue")).toBe("法式碎蓋");
    expect(cutsHeading("en", 8)).toBe("8 cuts");
    expect(cutsHeading("yue", 8)).toBe("8 款");
  });

  it("lets the brief language follow the header until the visitor picks", () => {
    expect(briefOutputLang("en", null)).toBe("en");
    expect(briefOutputLang("yue", null)).toBe("yue");
    expect(briefOutputLang("yue", "en")).toBe("en");
    expect(briefOutputLang("en", "yue")).toBe("yue");
  });

  it("does not ship dual-script labels in visitor source", () => {
    const files = walk(path.join(ROOT, "app"), []);
    const hits: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      const literals = source.match(LITERAL) ?? [];
      for (const literal of literals) {
        if (DUAL.test(literal)) hits.push(`${path.relative(ROOT, file)} ${literal}`);
      }
    }
    expect(hits).toEqual([]);
    const joined = files.map((file) => readFileSync(file, "utf8")).join("\n");
    expect(joined).not.toContain("Selfie 自拍");
    expect(joined).not.toContain("Quiz 問卷");
    expect(joined).not.toContain("Show brief 出備忘");
    expect(joined).toContain(">EN<");
    expect(joined).toContain(">粵<");
  });
});

describe("locale type", () => {
  it("accepts only the two header locales", () => {
    const locales: Locale[] = ["en", "yue"];
    expect(locales).toHaveLength(2);
  });
});
