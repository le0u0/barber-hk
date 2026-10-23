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

function orbitFrames(id: string): CutFrame[] {
  return ANGLE_ORDER.map((angle) => ({
    angle,
    image: `/cuts/angles/${id}/${angle}.jpg`,
  }));
}

/** Demo path only. Other cuts stay front-only until a real shoot lands. */
const ORBIT_IDS = ["crop-fade", "french-crop", "two-block"] as const;

const ORBIT: Record<string, CutFrame[]> = Object.fromEntries(
  ORBIT_IDS.map((id) => [id, orbitFrames(id)]),
);

const FRONT_ONLY: Record<string, string> = {
  "side-part": "/cuts/office-front.jpg",
  curtain: "/cuts/centre-front.jpg",
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
