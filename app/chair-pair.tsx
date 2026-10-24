import { lead, type Bilingual } from "@/lib/chair-copy";

export function ChairPair({ copy, lang }: { copy: Bilingual; lang: "en" | "yue" }) {
  const line = lead(lang, copy);
  return (
    <>
      <span lang={line.primaryLang}>{line.primary}</span>{" "}
      <span className="font-medium" lang={line.secondaryLang}>
        {line.secondary}
      </span>
    </>
  );
}
