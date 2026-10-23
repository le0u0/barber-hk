import manifest from "../docs/angles/MANIFEST.json";
import { listCutCards } from "./catalog";

export const ANGLE_ORDER = ["front", "three-quarter", "side", "back"] as const;

export type CutAngle = (typeof ANGLE_ORDER)[number];

export const ANGLE_LABEL: Record<CutAngle, { en: string; yue: string }> = {
  front: { en: "Front", yue: "正面" },
  "three-quarter": { en: "Three-quarter", yue: "斜面" },
  side: { en: "Side", yue: "側面" },
  back: { en: "Back", yue: "後腦" },
};

export type CutFrame = { angle: CutAngle; image: string };

export type CutView = {
  id: string;
  nameEn: string;
  nameYue: string;
  frames: CutFrame[];
  orbit: boolean;
};

type ManifestRow = {
  cutId: string;
  angle: string;
  path: string;
  status: string;
};

const MANIFEST = manifest as ManifestRow[];

/** Four frames only when every angle is manifest status `generated` at the pack path. */
function generatedOrbit(id: string): CutFrame[] | null {
  const frames: CutFrame[] = [];
  for (const angle of ANGLE_ORDER) {
    const path = `mtr-assets/angles/${id}/${angle}.jpg`;
    const row = MANIFEST.find((entry) => entry.cutId === id && entry.angle === angle);
    if (!row || row.status !== "generated" || row.path !== path) return null;
    frames.push({ angle, image: `/${path}` });
  }
  return frames;
}

/**
 * A single generated front is a still. Missing angles stay off the demo path,
 * so one `generated` front never opens swipe chrome.
 */
function shippedFront(id: string): string | null {
  const path = `mtr-assets/angles/${id}/front.jpg`;
  const row = MANIFEST.find((entry) => entry.cutId === id && entry.angle === "front");
  if (!row || row.status !== "generated" || row.path !== path) return null;
  return `/${path}`;
}

export function listCutViews(): CutView[] {
  return listCutCards().map((card) => {
    const orbit = generatedOrbit(card.id);
    if (orbit) {
      return { id: card.id, nameEn: card.nameEn, nameYue: card.nameYue, frames: orbit, orbit: true };
    }
    return {
      id: card.id,
      nameEn: card.nameEn,
      nameYue: card.nameYue,
      frames: [{ angle: "front", image: shippedFront(card.id) ?? card.image }],
      orbit: false,
    };
  });
}

export function cutView(id: string | null | undefined): CutView | null {
  if (!id) return null;
  return listCutViews().find((view) => view.id === id) ?? null;
}

export function stepAngle(index: number, count: number, key: string): number | null {
  if (count <= 0) return null;
  if (key === "ArrowRight") return Math.min(count - 1, index + 1);
  if (key === "ArrowLeft") return Math.max(0, index - 1);
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
}

export function slideAnnouncement(index: number, count: number, angle: CutAngle): string {
  const label = ANGLE_LABEL[angle];
  return `${index + 1} of ${count}, ${label.en} ${label.yue}`;
}
