import { getCut, listCuts, matchCut } from "@/lib/catalog";
import { writeWithGemini } from "@/lib/gemini";
import { isQuiz } from "@/lib/prefs";
import type { BriefResponse, QuizAnswers } from "@/lib/types";

const MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_CHARS = 3_000_000;

const SELFIE_NOTICE = {
  en: "The photo was not read. This is a starter textured crop fade, a common Hong Kong request. Use the quiz if you want a matched cut.",
  yue: "相片未讀到。以下係常用嘅碎蓋漸變起步備忘。想對到你嘅選擇，請做問卷。",
};

function briefFor(cutId: string, copy?: { en: BriefResponse["brief"]["en"]; yue: BriefResponse["brief"]["yue"] }, extra?: Pick<BriefResponse, "source" | "fallbackReason" | "notice">): BriefResponse {
  const cut = getCut(cutId);
  if (!cut) {
    throw new Error("unknown cut");
  }
  return {
    source: extra?.source ?? "fallback",
    fallbackReason: extra?.fallbackReason,
    notice: extra?.notice,
    cut: {
      id: cut.id,
      nameEn: cut.nameEn,
      nameYue: cut.nameYue,
      image: cut.image,
      eastAsianNote: cut.eastAsianNote,
    },
    brief: copy ?? cut.brief,
  };
}

export async function GET() {
  const cuts = listCuts();
  return Response.json({
    count: cuts.length,
    ids: cuts.map((cut) => cut.id),
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Send JSON." }, { status: 400 });
  }

  const payload = body as { path?: unknown; answers?: unknown; imageBase64?: unknown; mimeType?: unknown };

  if (payload.path === "quiz") {
    if (!isQuiz(payload.answers)) {
      return Response.json({ error: "Quiz answers are incomplete." }, { status: 400 });
    }
    const answers = payload.answers as QuizAnswers;
    const cut = matchCut(answers);
    const gemini = await writeWithGemini({ mode: "quiz", cutId: cut.id, answers });
    if (gemini.ok) {
      return Response.json(briefFor(cut.id, { en: gemini.en, yue: gemini.yue }, { source: "gemini" }));
    }
    return Response.json(
      briefFor(cut.id, cut.brief, {
        source: "fallback",
        fallbackReason: gemini.reason,
        notice:
          gemini.reason === "missing_key"
            ? undefined
            : {
                en: "Gemini did not answer. This is the saved brief for your quiz answers.",
                yue: "Gemini 未答到。以下係按你問卷配好嘅備忘。",
              },
      }),
    );
  }

  if (payload.path === "selfie") {
    const mimeType = payload.mimeType;
    const imageBase64 = payload.imageBase64;
    if (typeof mimeType !== "string" || !MIME.has(mimeType)) {
      return Response.json({ error: "Use a JPEG, PNG, or WebP photo." }, { status: 400 });
    }
    if (typeof imageBase64 !== "string" || imageBase64.length === 0) {
      return Response.json({ error: "That image was empty." }, { status: 400 });
    }
    if (imageBase64.length > MAX_IMAGE_CHARS) {
      return Response.json({ error: "That photo is too large. Try a smaller one." }, { status: 413 });
    }

    const gemini = await writeWithGemini({
      mode: "selfie",
      image: { mimeType, data: imageBase64 },
    });
    if (gemini.ok) {
      return Response.json(briefFor(gemini.cutId, { en: gemini.en, yue: gemini.yue }, { source: "gemini" }));
    }
    return Response.json(
      briefFor("crop-fade", undefined, {
        source: "fallback",
        fallbackReason: gemini.reason,
        notice: SELFIE_NOTICE,
      }),
    );
  }

  return Response.json({ error: "Choose quiz or selfie." }, { status: 400 });
}
