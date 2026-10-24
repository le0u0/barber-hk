"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  ANGLE_LABEL,
  CAROUSEL_CHROME,
  FRONT_ONLY_LABEL,
  SYNTHETIC_BADGE,
  SYNTHETIC_CAPTION,
  stepAngle,
  type CutCard,
  type CutFrame,
} from "@/lib/cut-views";
import { usePrefs } from "@/lib/use-prefs";

function CutCarousel({ nameEn, nameYue, frames }: { nameEn: string; nameYue: string; frames: CutFrame[] }) {
  const lang = usePrefs().lang;
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const frame = frames[index] ?? frames[0];
  const label = ANGLE_LABEL[frame.angle][lang];

  function move(delta: number) {
    setIndex((current) => stepAngle(current, delta, frames.length));
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={lang === "yue" ? nameYue : nameEn}
      className="flex flex-col gap-2"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") move(1);
        else if (event.key === "ArrowLeft") move(-1);
        else if (event.key === "Home") move(-index);
        else if (event.key === "End") move(frames.length - 1 - index);
        else return;
        event.preventDefault();
      }}
    >
      <div
        className="relative aspect-[3/4] touch-pan-y overflow-hidden bg-stone-200"
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("button")) return;
          startX.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (startX.current == null) return;
          const delta = event.clientX - startX.current;
          startX.current = null;
          if (delta <= -40) move(1);
          else if (delta >= 40) move(-1);
        }}
      >
        <Image
          src={frame.image}
          alt={label}
          fill
          sizes="240px"
          className="object-cover object-top"
          unoptimized
        />
        <p className="absolute left-2 top-2 bg-stone-950 px-2 py-1 text-xs font-semibold text-white">
          {SYNTHETIC_BADGE[lang]}
        </p>
        <button
          type="button"
          className="absolute left-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/80 text-lg"
          aria-label={CAROUSEL_CHROME.previous[lang]}
          onClick={() => move(-1)}
        >
          ‹
        </button>
        <button
          type="button"
          className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/80 text-lg"
          aria-label={CAROUSEL_CHROME.next[lang]}
          onClick={() => move(1)}
        >
          ›
        </button>
      </div>
      <p className="text-xs text-stone-600">{SYNTHETIC_CAPTION[lang]}</p>
      <p aria-live="polite" className="text-sm font-medium">
        {label}
      </p>
      <div className="flex justify-center">
        {frames.map((item, dot) => (
          <button
            key={item.angle}
            type="button"
            className="inline-flex h-11 w-6 items-center justify-center"
            aria-label={ANGLE_LABEL[item.angle][lang]}
            aria-current={dot === index ? "true" : undefined}
            onClick={() => setIndex(dot)}
          >
            <span
              className={
                dot === index ? "h-2.5 w-2.5 rounded-full bg-stone-900" : "h-2.5 w-2.5 rounded-full bg-stone-300"
              }
            />
          </button>
        ))}
      </div>
    </section>
  );
}

export function CutFigure({ card }: { card: CutCard }) {
  const lang = usePrefs().lang;
  if (!card.orbit) {
    return (
      <figure>
        <Image src={card.image} alt="" width={120} height={160} unoptimized />
        <figcaption className="text-xs text-stone-600">{FRONT_ONLY_LABEL[lang]}</figcaption>
      </figure>
    );
  }
  return <CutCarousel nameEn={card.nameEn} nameYue={card.nameYue} frames={card.frames} />;
}
