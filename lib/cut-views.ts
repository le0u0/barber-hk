import manifest from "../docs/angles/MANIFEST.json";
import { listCuts } from "./catalog";

export const ANGLE_ORDER = [
  "front",
  "three-quarter-left",
  "side-left",
  "back",
  "side-right",
  "three-quarter-right",
] as const;

export type CutAngle = (typeof ANGLE_ORDER)[number];

export const ANGLE_LABEL: Record<CutAngle, { en: string; yue: string }> = {
  front: { en: "Front", yue: "正面" },
  "three-quarter-left": { en: "Three-quarter left", yue: "左斜面" },
  "side-left": { en: "Side left", yue: "左側" },
  back: { en: "Back", yue: "後腦" },
  "side-right": { en: "Side right", yue: "右側" },
  "three-quarter-right": { en: "Three-quarter right", yue: "右斜面" },
};

export const SYNTHETIC_BADGE = { en: "Synthetic ref", yue: "合成參考" } as const;
export const SYNTHETIC_CAPTION = { en: "Not a customer photo", yue: "唔係客人相" } as const;
export const FRONT_ONLY_LABEL = { en: "Front only", yue: "只有正面" } as const;
export const CAROUSEL_CHROME = {
  previous: { en: "Previous angle", yue: "上一個角度" },
  next: { en: "Next angle", yue: "下一個角度" },
} as const;

export type CutFrame = { angle: CutAngle; image: string };

export type CutCard = {
  id: string;
  nameEn: string;
  nameYue: string;
  image: string;
  orbit: boolean;
  frames: CutFrame[];
};

type ManifestRow = {
  cutId: string;
  angle?: string;
  path?: string;
  status: string;
  md5?: string;
};

const rows = manifest as ManifestRow[];

/** Six packed frames, only when every angle is `generated` at the pack path. */
export function orbitFor(cutId: string): CutFrame[] | null {
  const frames: CutFrame[] = [];
  for (const angle of ANGLE_ORDER) {
    const path = `mtr-assets/angles/${cutId}/${angle}.jpg`;
    const row = rows.find((entry) => entry.cutId === cutId && entry.angle === angle);
    if (!row || row.status !== "generated" || row.path !== path) return null;
    frames.push({ angle, image: `/${path}` });
  }
  return frames;
}

export function listCutCards(): CutCard[] {
  return listCuts().map((cut) => {
    const orbit = orbitFor(cut.id);
    if (orbit) {
      return {
        id: cut.id,
        nameEn: cut.nameEn,
        nameYue: cut.nameYue,
        image: orbit[0].image,
        orbit: true,
        frames: orbit,
      };
    }
    return {
      id: cut.id,
      nameEn: cut.nameEn,
      nameYue: cut.nameYue,
      image: cut.image,
      orbit: false,
      frames: [{ angle: "front", image: cut.image }],
    };
  });
}

export function cutView(id: string): CutCard | null {
  return listCutCards().find((card) => card.id === id) ?? null;
}

export function stepAngle(index: number, delta: number, count: number): number {
  if (count <= 0) return 0;
  return ((index + delta) % count + count) % count;
}
