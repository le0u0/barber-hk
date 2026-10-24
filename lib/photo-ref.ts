export const SYNTHETIC_BADGE = { en: "Synthetic ref", yue: "合成參考" } as const;
export const SYNTHETIC_CAPTION = { en: "Not a customer photo", yue: "唔係客人相" } as const;

/**
 * Display swap for cuts that have a pack frame.
 * The catalog diagram stays the API image. Only listed cuts change on screen.
 */
export const PHOTO_REFS: Record<string, { image: string; md5: string }> = {
  "french-crop": {
    image: "/mtr-assets/angles/french-crop/front.jpg",
    md5: "7d8c52d6b542",
  },
};

export function photoRef(cutId: string): { image: string; md5: string } | null {
  return PHOTO_REFS[cutId] ?? null;
}

export function displayImage(cut: { id: string; image: string }): { src: string; synthetic: boolean } {
  const ref = photoRef(cut.id);
  if (!ref) return { src: cut.image, synthetic: false };
  return { src: ref.image, synthetic: true };
}
