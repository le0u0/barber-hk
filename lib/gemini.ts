import { getCut, listCuts } from "./catalog";
import type { BriefCopy, QuizAnswers } from "./types";

const MODEL = "gemini-3.5-flash-lite";
const COPY_KEYS = ["ask", "sides", "top", "fringe", "finish"] as const;

export type GeminiOk = {
  ok: true;
  cutId: string;
  en: BriefCopy;
  yue: BriefCopy;
};

export type GeminiFail = {
  ok: false;
  reason: "missing_key" | "gemini_error";
};

function redact(text: string, key: string): string {
  return key ? text.split(key).join("[redacted]") : text;
}

function asCopy(value: unknown, requireCjk: boolean): BriefCopy | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const copy = {} as BriefCopy;
  for (const key of COPY_KEYS) {
    const field = record[key];
    if (typeof field !== "string" || field.trim().length === 0) return null;
    copy[key] = field.trim();
  }
  if (requireCjk && !/[\u3400-\u9fff]/.test(Object.values(copy).join(""))) return null;
  return copy;
}

function parseModelJson(text: string): { cutId?: string; en: BriefCopy; yue: BriefCopy } | null {
  const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    const parsed = JSON.parse(trimmed) as { cutId?: unknown; en?: unknown; yue?: unknown };
    const en = asCopy(parsed.en, false);
    const yue = asCopy(parsed.yue, true);
    if (!en || !yue) return null;
    return { cutId: typeof parsed.cutId === "string" ? parsed.cutId : undefined, en, yue };
  } catch {
    return null;
  }
}

export async function writeWithGemini(input: {
  mode: "quiz" | "selfie";
  cutId?: string;
  answers?: QuizAnswers;
  image?: { mimeType: string; data: string };
}): Promise<GeminiOk | GeminiFail> {
  const key = process.env.GEMINI_API_KEY?.trim() ?? "";
  if (!key) return { ok: false, reason: "missing_key" };

  const catalog = listCuts()
    .map((cut) => `${cut.id}: ${cut.nameEn} / ${cut.nameYue}`)
    .join("\n");

  const instruction = [
    "Write a Hong Kong men's barber brief the customer can show the barber.",
    "Reply with JSON only, no markdown.",
    'Shape: {"cutId":"...","en":{"ask":"","sides":"","top":"","fringe":"","finish":""},"yue":{"ask":"","sides":"","top":"","fringe":"","finish":""}}',
    "en is English. yue is spoken Hong Kong Cantonese (唔, 嘅, 啲), not formal written Chinese.",
    "Do not invent a ninth haircut. cutId must be one of:",
    catalog,
    input.mode === "quiz"
      ? `The cut is already chosen: ${input.cutId}. Keep that cutId. Use the quiz only to phrase the brief.`
      : "Look at the photo and pick the single closest cutId from the list. Do not describe a generated hairstyle image.",
    input.answers ? `Quiz answers: ${JSON.stringify(input.answers)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const parts: Array<Record<string, unknown>> = [{ text: instruction }];
  if (input.image) {
    parts.push({
      inline_data: { mime_type: input.image.mimeType, data: input.image.data },
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(20000),
      },
    );

    if (!response.ok) return { ok: false, reason: "gemini_error" };

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>;
    };
    const text = (payload.candidates?.[0]?.content?.parts ?? [])
      .filter((part) => part.text && !part.thought)
      .map((part) => part.text)
      .join("\n");
    const parsed = parseModelJson(text);
    if (!parsed) return { ok: false, reason: "gemini_error" };

    const cutId = input.mode === "quiz" ? input.cutId : parsed.cutId;
    if (!cutId || !getCut(cutId)) return { ok: false, reason: "gemini_error" };

    return { ok: true, cutId, en: parsed.en, yue: parsed.yue };
  } catch (error) {
    const message = error instanceof Error ? error.message : "gemini failed";
    console.error("gemini brief failed", redact(message, key));
    return { ok: false, reason: "gemini_error" };
  }
}
