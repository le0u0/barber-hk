"use client";

import Image from "next/image";
import { SYNTHETIC_BADGE, SYNTHETIC_CAPTION, displayImage } from "@/lib/photo-ref";
import { usePrefs } from "@/lib/use-prefs";

export function CutPhoto({ id, image }: { id: string; image: string }) {
  const lang = usePrefs().lang;
  const shown = displayImage({ id, image });

  if (!shown.synthetic) {
    return <Image src={shown.src} alt="" width={120} height={160} unoptimized />;
  }

  return (
    <figure>
      <div className="relative h-40 overflow-hidden bg-stone-200">
        <Image
          src={shown.src}
          alt={SYNTHETIC_BADGE[lang]}
          width={213}
          height={720}
          className="h-full w-full object-cover object-top"
          unoptimized
        />
        <figcaption className="absolute left-1 top-1 bg-stone-950 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {SYNTHETIC_BADGE[lang]}
        </figcaption>
      </div>
      <p className="mt-1 text-xs text-stone-600">{SYNTHETIC_CAPTION[lang]}</p>
    </figure>
  );
}
