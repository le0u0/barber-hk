"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  barberBright,
  barberControlStyle,
  barberCopy,
  barberShowKeyAction,
  lead,
  type BarberCard,
  type BarberShowStatus,
  type Bilingual,
} from "@/lib/barber-show";
import { usePrefs } from "@/lib/use-prefs";

function Pair({ copy, lang, className }: { copy: Bilingual; lang: "en" | "yue"; className?: string }) {
  const line = lead(lang, copy);
  return (
    <>
      <span className={className} lang={line.primaryLang}>
        {line.primary}
      </span>{" "}
      <span lang={line.secondaryLang}>{line.secondary}</span>
    </>
  );
}

export function BarberShow({
  card,
  status,
  onClose,
  onBright,
}: {
  card: BarberCard;
  status: BarberShowStatus;
  onClose: () => void;
  onBright: () => void;
}) {
  const lang = usePrefs().lang;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const onBrightRef = useRef(onBright);
  const name = lead(lang, { en: card.nameEn, yue: card.nameYue });

  useEffect(() => {
    onCloseRef.current = onClose;
    onBrightRef.current = onBright;
  });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (barberShowKeyAction(event.key) === "close") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const items = [...root.querySelectorAll<HTMLElement>("button, [href], input, select, textarea")].filter(
        (item) => !item.hasAttribute("disabled"),
      );
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="barber-show-title"
      className="fixed inset-0 z-50 overflow-auto px-4 py-4"
      style={{ background: barberBright.canvas, color: barberBright.ink, colorScheme: "light" }}
    >
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold">
            <Pair copy={barberCopy.title} lang={lang} />
          </p>
          <button
            ref={closeRef}
            type="button"
            className="px-3 text-base font-bold"
            style={barberControlStyle()}
            onClick={() => onCloseRef.current()}
          >
            <Pair copy={barberCopy.close} lang={lang} />
          </button>
        </div>
        <h2 id="barber-show-title" className="text-4xl font-bold leading-none tracking-tight" lang={name.primaryLang}>
          {name.primary}
        </h2>
        <p className="-mt-2 text-2xl font-semibold leading-tight" lang={name.secondaryLang}>
          {name.secondary}
        </p>
        <Image
          src={card.image}
          alt=""
          width={360}
          height={480}
          unoptimized
          priority
          className="h-auto w-full bg-white"
          style={{ width: "100%", height: "auto", background: barberBright.canvas }}
        />
        {card.lines?.map((line) => {
          const text = lead(lang, line.text);
          return (
            <section key={line.label.en}>
              <h3 className="text-sm font-bold">
                <Pair copy={line.label} lang={lang} />
              </h3>
              <p className={line.emphasis ? "mt-1 text-2xl font-semibold leading-snug" : "mt-1 text-lg leading-snug"} lang={text.primaryLang}>
                {text.primary}
              </p>
              <p className="mt-1 text-lg leading-snug" lang={text.secondaryLang}>
                {text.secondary}
              </p>
            </section>
          );
        })}
        {!card.lines ? (
          <p className="text-lg font-semibold">
            <Pair copy={barberCopy.reference} lang={lang} />
          </p>
        ) : null}
        {card.note ? (
          <section>
            <h3 className="text-sm font-bold">
              <Pair copy={barberCopy.note} lang={lang} />
            </h3>
            <p className="mt-1 text-lg leading-snug">{card.note}</p>
          </section>
        ) : null}
        <p className="text-base font-bold" role="status">
          <Pair copy={status.wakeLock ? barberCopy.stayOn : barberCopy.dim} lang={lang} />
        </p>
        {status.fullscreen ? null : (
          <button
            type="button"
            className="w-full px-3 text-base font-bold"
            style={barberControlStyle()}
            onClick={() => onBrightRef.current()}
          >
            <Pair copy={barberCopy.fullscreen} lang={lang} />
          </button>
        )}
      </div>
    </div>
  );
}
