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

const ORBIT: Record<string, CutFrame[]> = {
  "crop-fade": [
    { angle: "front", image: "/cuts/textured-front.jpg" },
    { angle: "three-quarter", image: "/cuts/textured-three-quarter.jpg" },
    { angle: "side", image: "/cuts/textured-side.jpg" },
    { angle: "back", image: "/cuts/textured-back.jpg" },
  ],
  "two-block": [
    { angle: "front", image: "/cuts/section-front.jpg" },
    { angle: "three-quarter", image: "/cuts/section-three-quarter.jpg" },
    { angle: "side", image: "/cuts/section-side.jpg" },
    { angle: "back", image: "/cuts/section-back.jpg" },
  ],
  curtain: [
    { angle: "front", image: "/cuts/centre-front.jpg" },
    { angle: "three-quarter", image: "/cuts/centre-three-quarter.jpg" },
    { angle: "side", image: "/cuts/centre-side.jpg" },
    { angle: "back", image: "/cuts/centre-back.jpg" },
  ],
};

const FRONT_ONLY: Record<string, string> = {
  "french-crop": "/cuts/fringe-front.jpg",
  "side-part": "/cuts/office-front.jpg",
  undercut: "/cuts/slick-front.jpg",
  pompadour: "/cuts/volume-front.jpg",
  induction: "/cuts/buzz-front.jpg",
};

export function listCutViews(): CutView[] {
  return listCutCards().map((card) => {
    const orbit = ORBIT[card.id];
    if (orbit) {
      return { id: card.id, nameEn: card.nameEn, nameYue: card.nameYue, frames: orbit, orbit: true };
    }
    return {
      id: card.id,
      nameEn: card.nameEn,
      nameYue: card.nameYue,
      frames: [{ angle: "front", image: FRONT_ONLY[card.id] ?? card.image }],
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
