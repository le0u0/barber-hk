export function cutDisplayName(
  card: { nameEn: string; nameYue: string },
  lang: "en" | "yue",
): string {
  return lang === "yue" ? card.nameYue : card.nameEn;
}
