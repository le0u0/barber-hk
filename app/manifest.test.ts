import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import manifest from "./manifest";

function pngSize(bytes: Buffer) {
  expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(bytes.subarray(12, 16).toString("ascii")).toBe("IHDR");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe("web app manifest", () => {
  const webManifest = manifest();

  it("is installable on a phone home screen", () => {
    expect(webManifest.name).toBe("Barber HK");
    expect(webManifest.short_name).toBe("Barber HK");
    expect(webManifest.start_url).toBe("/");
    expect(webManifest.scope).toBe("/");
    expect(webManifest.display).toBe("standalone");
    expect(webManifest.background_color).toBe("#f4efe6");
    expect(webManifest.theme_color).toBe("#1c1915");
    expect(webManifest.icons?.map((icon) => icon.sizes)).toEqual(["192x192", "512x512", "512x512"]);
    expect(webManifest.icons?.some((icon) => icon.purpose === "maskable" && icon.sizes === "512x512")).toBe(true);
  });

  it("points at png icons with the declared pixel size", () => {
    const seen = new Set<string>();
    for (const icon of webManifest.icons ?? []) {
      if (!icon.src || seen.has(icon.src)) continue;
      seen.add(icon.src);
      const file = readFileSync(`public${icon.src}`);
      const [width, height] = (icon.sizes ?? "0x0").split("x").map(Number);
      expect(pngSize(file)).toEqual({ width, height });
      expect(file.length).toBeGreaterThan(100);
    }
    expect(seen.size).toBe(2);
  });

  it("serves a 180px apple touch icon", () => {
    expect(pngSize(readFileSync("public/apple-touch-icon.png"))).toEqual({ width: 180, height: 180 });
  });

  it("keeps the reviewed icon bytes", () => {
    const hashes = {
      "/icon-192x192.png": "",
      "/icon-512x512.png": "",
      "/apple-touch-icon.png": "",
    };
    for (const src of Object.keys(hashes) as Array<keyof typeof hashes>) {
      hashes[src] = createHash("sha256").update(readFileSync(`public${src}`)).digest("hex");
    }
    expect(hashes).toEqual({
      "/icon-192x192.png": "40290f82aa4cb8e27e3f11cb3ccd492cfe8e934826dbf1fbbf1b2a05f03e44c4",
      "/icon-512x512.png": "ae38a212eb0185b7bade5461d6976b0d84b44bf042274e029331eefcb9f70ed3",
      "/apple-touch-icon.png": "e3b608dde864b87477d4c37dc48a982d5f6a9942029613cb880299d87fd4a4ca",
    });
  });
});
