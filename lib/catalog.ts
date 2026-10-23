import raw from "../fixtures/cuts.json";
import type { BriefCopy, QuizAnswers } from "./types";

export type Cut = {
  id: string;
  nameEn: string;
  nameYue: string;
  image: string;
  eastAsianNote: string;
  brief: { en: BriefCopy; yue: BriefCopy };
};

const COPY_KEYS = ["ask", "sides", "top", "fringe", "finish"] as const;

function isCopy(value: unknown): value is BriefCopy {
  if (!value || typeof value !== "object") return false;
  const copy = value as Record<string, unknown>;
  return COPY_KEYS.every((key) => typeof copy[key] === "string" && copy[key].trim().length > 0);
}

function isCut(value: unknown): value is Cut {
  if (!value || typeof value !== "object") return false;
  const cut = value as Record<string, unknown>;
  const brief = cut.brief as { en?: unknown; yue?: unknown } | undefined;
  return (
    typeof cut.id === "string" &&
    typeof cut.nameEn === "string" &&
    typeof cut.nameYue === "string" &&
    typeof cut.image === "string" &&
    typeof cut.eastAsianNote === "string" &&
    !!brief &&
    isCopy(brief.en) &&
    isCopy(brief.yue)
  );
}

const cuts: Cut[] = (raw as unknown[]).filter(isCut);

if (cuts.length !== 8) {
  throw new Error(`Expected 8 cuts in fixtures/cuts.json, got ${cuts.length}`);
}

const ids = new Set(cuts.map((cut) => cut.id));
if (ids.size !== 8) {
  throw new Error("Cut ids in fixtures/cuts.json must be unique");
}

export function listCuts(): Cut[] {
  return cuts;
}

export function getCut(id: string): Cut | undefined {
  return cuts.find((cut) => cut.id === id);
}

export function matchCut(answers: QuizAnswers): Cut {
  const id = matchId(answers);
  const cut = getCut(id);
  if (!cut) {
    throw new Error(`Matcher returned unknown cut ${id}`);
  }
  return cut;
}

function matchId(answers: QuizAnswers): string {
  if (answers.top === "buzz") return "induction";
  if (answers.part === "middle") return "curtain";
  if (answers.finish === "sleek" && answers.part === "side" && answers.top === "long") {
    return "pompadour";
  }
  if (answers.finish === "sleek" && answers.part === "side" && answers.sides === "skin") {
    return "undercut";
  }
  if (answers.finish === "sleek" && answers.part === "side") return "side-part";
  if (answers.sides === "skin" && answers.finish === "textured") return "crop-fade";
  if (answers.top === "short" && answers.finish === "textured" && answers.part === "none") {
    return "french-crop";
  }
  if (answers.sides !== "skin" && (answers.top === "medium" || answers.top === "long")) {
    return "two-block";
  }
  if (answers.sides === "skin") return "crop-fade";
  if (answers.finish === "sleek") return "side-part";
  if (answers.top === "short") return "french-crop";
  return "two-block";
}
