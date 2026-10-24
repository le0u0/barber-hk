import type { FaceGuide } from "./face-shape";

export type QuizAnswers = {
  sides: "skin" | "taper" | "scissor";
  top: "buzz" | "short" | "medium" | "long";
  finish: "textured" | "sleek" | "natural";
  part: "none" | "side" | "middle";
};

export type BriefCopy = {
  ask: string;
  sides: string;
  top: string;
  fringe: string;
  finish: string;
};

export type BriefResponse = {
  source: "gemini" | "fallback";
  fallbackReason?: "missing_key" | "gemini_error";
  notice?: { en: string; yue: string };
  cut: {
    id: string;
    nameEn: string;
    nameYue: string;
    image: string;
    eastAsianNote: string;
  };
  brief: { en: BriefCopy; yue: BriefCopy };
  face?: FaceGuide;
};
