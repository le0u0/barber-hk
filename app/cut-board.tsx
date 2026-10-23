"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { listCutViews } from "@/lib/cut-views";
import { usePrefs } from "@/lib/use-prefs";
import { CutCarousel } from "./cut-carousel";

export function CutBoard() {
  const lastId = usePrefs().lastCutId;
  const views = listCutViews();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = views.find((view) => view.id === openId && view.orbit) ?? null;
  const openers = useRef(new Map<string, HTMLButtonElement>());

  const closeCarousel = useCallback(() => {
    setOpenId((current) => {
      const opener = current ? openers.current.get(current) : undefined;
      if (opener) requestAnimationFrame(() => opener.focus());
      return null;
    });
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeCarousel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCarousel]);

  return (
    <section aria-labelledby="cut-catalog">
      <h2 id="cut-catalog" className="section-title">
        8 cuts <span lang="zh-HK">八款</span>
      </h2>
      {open ? (
        <CutCarousel
          key={open.id}
          frames={open.frames}
          nameEn={open.nameEn}
          nameYue={open.nameYue}
          onClose={closeCarousel}
        />
      ) : null}
      <ul className="cut-grid">
        {views.map((view) => {
          const front = view.frames[0];
          const last = view.id === lastId;
          const opened = open?.id === view.id;
          const className = `cut-card${last ? " is-last" : ""}${opened ? " is-open" : ""}`;
          const photo = (
            <Image
              src={front.image}
              alt={`${view.nameEn} — ${view.nameYue}, front view`}
              width={360}
              height={480}
              unoptimized
              className="cut-photo"
            />
          );
          const names = (
            <div className="cut-meta">
              <div>
                <p className="cut-name-en">{view.nameEn}</p>
                <p className="cut-name-zh" lang="zh-HK">
                  {view.nameYue}
                </p>
              </div>
              {view.orbit ? <span className="chevron" aria-hidden="true">›</span> : null}
            </div>
          );

          if (!view.orbit) {
            return (
              <li key={view.nameEn}>
                <figure className={className}>
                  {photo}
                  {names}
                  <figcaption className="front-only">
                    Front only <span lang="zh-HK">只有正面</span>
                  </figcaption>
                </figure>
              </li>
            );
          }

          return (
            <li key={view.nameEn}>
              <button
                type="button"
                className={className}
                aria-expanded={opened}
                aria-controls={opened ? "cut-orbit" : undefined}
                ref={(node) => {
                  if (node) openers.current.set(view.id, node);
                  else openers.current.delete(view.id);
                }}
                onClick={() => setOpenId(opened ? null : view.id)}
              >
                {photo}
                <span className="dot-row" aria-hidden="true">
                  {view.frames.map((frame, dot) => (
                    <span key={frame.angle} className={dot === 0 ? "dot is-on" : "dot"} />
                  ))}
                </span>
                {names}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
