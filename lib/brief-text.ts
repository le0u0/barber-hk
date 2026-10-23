import type { BriefCopy, BriefResponse } from "./types";

const FIELDS = ["ask", "sides", "top", "fringe", "finish"] as const;

const LABELS = {
  en: { ask: "Say this", sides: "Sides", top: "Top", fringe: "Fringe", finish: "Finish" },
  yue: { ask: "照住講", sides: "兩側", top: "頂", fringe: "劉海", finish: "造型" },
} as const;

export function formatBriefText(
  brief: Pick<BriefResponse, "cut" | "brief">,
  lang: "en" | "yue" | "both",
): string {
  const langs = lang === "both" ? (["en", "yue"] as const) : ([lang] as const);
  const blocks = langs.map((code) => {
    const labels = LABELS[code];
    const copy: BriefCopy = brief.brief[code];
    const lines = FIELDS.map((key) => `${labels[key]}. ${copy[key]}`);
    const title = code === "en" ? "English" : "粵語";
    return [title, ...lines].join("\n");
  });
  return [`${brief.cut.nameEn}\n${brief.cut.nameYue}`, ...blocks].join("\n\n");
}
