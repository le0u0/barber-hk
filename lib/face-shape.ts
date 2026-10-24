export const FACE_SHAPE_IDS = ["oval", "round", "square", "oblong", "heart", "diamond"] as const;

export type FaceShapeId = (typeof FACE_SHAPE_IDS)[number];

export type FaceShape = {
  id: FaceShapeId;
  nameEn: string;
  nameYue: string;
  noteEn: string;
  noteYue: string;
  suits: readonly string[];
};

export type FaceGuide = {
  id: FaceShapeId;
  nameEn: string;
  nameYue: string;
  noteEn: string;
  noteYue: string;
};

export const FACE_CHART_COPY = {
  legendEn: "Face shape",
  legendYue: "面型",
  disclaimerEn:
    "Pick the closest outline. This is a paper chart, not a photo of you. There is no try-on and no face morph.",
  disclaimerYue: "揀最接近嘅輪廓。呢個係圖表，唔係你嘅相。冇試戴，亦唔會變面。",
  needEn: "Pick a face shape.",
  needYue: "請揀面型。",
  suitsEn: "Often suits",
  suitsYue: "通常適合",
} as const;

/** Schematic head outlines. Stroke diagrams only — not photos and not a try-on. */
export const FACE_OUTLINES: Record<FaceShapeId, string> = {
  oval: "M32 6 C46 6 54 20 54 40 C54 62 44 74 32 74 C20 74 10 62 10 40 C10 20 18 6 32 6 Z",
  round: "M32 12 C48 12 56 26 56 40 C56 54 48 68 32 68 C16 68 8 54 8 40 C8 26 16 12 32 12 Z",
  square: "M18 14 H46 C52 14 54 20 54 26 V50 C54 64 48 72 32 72 C16 72 10 64 10 50 V26 C10 20 12 14 18 14 Z",
  oblong: "M32 4 C42 4 48 18 48 40 C48 64 42 76 32 76 C22 76 16 64 16 40 C16 18 22 4 32 4 Z",
  heart: "M32 72 C20 56 8 44 8 28 C8 16 16 10 24 12 C28 13 31 16 32 22 C33 16 36 13 40 12 C48 10 56 16 56 28 C56 44 44 56 32 72 Z",
  diamond: "M32 6 C36 8 42 18 50 32 C56 42 56 50 50 58 C42 70 36 74 32 74 C28 74 22 70 14 58 C8 50 8 42 14 32 C22 18 28 8 32 6 Z",
};

export const FACE_SHAPES: readonly FaceShape[] = [
  {
    id: "oval",
    nameEn: "Oval",
    nameYue: "橢圓面",
    noteEn: "Oval face. Most of these cuts sit evenly. Ask the barber to keep the fringe light so it does not draw a line.",
    noteYue: "橢圓面。呢幾款多數都坐得穩。叫師傅劉海剪輕啲，唔好畫一條線。",
    suits: ["two-block", "side-part", "french-crop"],
  },
  {
    id: "round",
    nameEn: "Round",
    nameYue: "圓面",
    noteEn: "Round face. Ask for height on top and keep the sides close. Do not add width beside the ears.",
    noteYue: "圓面。頂要有高度，兩側貼少少。耳仔旁邊唔好加寬。",
    suits: ["crop-fade", "french-crop", "pompadour"],
  },
  {
    id: "square",
    nameEn: "Square",
    nameYue: "方面",
    noteEn: "Square face. A strong jaw can take a clear side, but soften the corners with texture. No hard helmet line.",
    noteYue: "方面。下顎硬，側邊可以清楚，但角位要抓碎。唔好剪到成個頭盔。",
    suits: ["crop-fade", "two-block", "french-crop"],
  },
  {
    id: "oblong",
    nameEn: "Long",
    nameYue: "長面",
    noteEn: "Long face. Do not stack more height on the crown. A fringe or a side part keeps the length from looking longer.",
    noteYue: "長面。頭頂唔好再疊高。留劉海或者側分，個面先唔會睇落更長。",
    suits: ["side-part", "curtain", "two-block"],
  },
  {
    id: "heart",
    nameEn: "Heart",
    nameYue: "心形面",
    noteEn: "Heart-shaped face. Wider at the forehead. A short fringe lowers that width. Keep the temples from sticking out.",
    noteYue: "心形面。額較寬。短劉海可以收窄個額。太陽穴兩邊唔好凸出。",
    suits: ["french-crop", "side-part", "crop-fade"],
  },
  {
    id: "diamond",
    nameEn: "Diamond",
    nameYue: "菱形面",
    noteEn: "Diamond face. Cheekbones are the wide part. A soft fringe and a little width at the temples balance it. Skip a tall slick crown.",
    noteYue: "菱形面。最寬係顴骨。柔劉海同太陽穴少少寬度會平衡啲。唔好頂高又貼死。",
    suits: ["french-crop", "side-part", "curtain"],
  },
];

export function isFaceShape(value: unknown): value is FaceShapeId {
  return typeof value === "string" && (FACE_SHAPE_IDS as readonly string[]).includes(value);
}

export function faceShapeById(value: unknown): FaceShape | null {
  if (!isFaceShape(value)) return null;
  return FACE_SHAPES.find((shape) => shape.id === value) ?? null;
}

export function faceGuide(value: unknown): FaceGuide | null {
  const shape = faceShapeById(value);
  if (!shape) return null;
  return {
    id: shape.id,
    nameEn: shape.nameEn,
    nameYue: shape.nameYue,
    noteEn: shape.noteEn,
    noteYue: shape.noteYue,
  };
}
