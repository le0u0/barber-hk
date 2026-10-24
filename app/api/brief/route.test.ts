import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/brief", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/brief", () => {
  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
    vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a static English and Cantonese brief when the quiz has no Gemini key", async () => {
    const response = await post({
      path: "quiz",
      answers: { sides: "skin", top: "short", finish: "textured", part: "none" },
    });
    const body = (await response.json()) as {
      source: string;
      fallbackReason?: string;
      brief: { en: { ask: string }; yue: { ask: string } };
    };

    expect(response.status).toBe(200);
    expect(body.source).toBe("fallback");
    expect(body.fallbackReason).toBe("missing_key");
    expect(body.brief.en.ask.length).toBeGreaterThan(0);
    expect(body.brief.yue.ask).toMatch(/[\u3400-\u9fff]/);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("attaches the face-shape chart note and still matches the quiz cut", async () => {
    const response = await post({
      path: "quiz",
      answers: { sides: "skin", top: "short", finish: "textured", part: "none" },
      faceShape: "round",
    });
    const body = (await response.json()) as {
      source: string;
      cut: { id: string };
      face?: { id: string; nameYue: string; noteEn: string };
    };

    expect(response.status).toBe(200);
    expect(body.source).toBe("fallback");
    expect(body.cut.id).toBe("crop-fade");
    expect(body.face?.id).toBe("round");
    expect(body.face?.nameYue).toBe("圓面");
    expect(body.face?.noteEn).toMatch(/height on top/);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("rejects an unknown face shape", async () => {
    const response = await post({
      path: "quiz",
      answers: { sides: "skin", top: "short", finish: "textured", part: "none" },
      faceShape: "triangle",
    });
    const body = (await response.json()) as { error?: string };

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/face shape/i);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("rejects a selfie whose mime type is not a photo", async () => {
    const response = await post({
      path: "selfie",
      mimeType: "image/gif",
      imageBase64: "abc",
    });
    const body = (await response.json()) as { error?: string };

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/JPEG, PNG, or WebP/);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe("GET /api/brief", () => {
  it("lists exactly eight stable cut ids", async () => {
    const response = await GET();
    const body = (await response.json()) as { count: number; ids: string[] };

    expect(response.status).toBe(200);
    expect(body.count).toBe(8);
    expect(body.ids).toEqual([
      "crop-fade",
      "french-crop",
      "two-block",
      "side-part",
      "curtain",
      "undercut",
      "pompadour",
      "induction",
    ]);
  });
});
