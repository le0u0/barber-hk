"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { slideAnnouncement, stepAngle, type CutFrame } from "@/lib/cut-views";

function useReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      media.addEventListener("change", onStoreChange);
      return () => media.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export function CutCarousel({
  frames,
  nameEn,
  nameYue,
  onClose,
}: {
  frames: CutFrame[];
  nameEn: string;
  nameYue: string;
  onClose?: () => void;
}) {
  const reduce = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);
  const region = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [hint, setHint] = useState(true);
  const pointer = useRef<{ x: number; id: number } | null>(null);
  const frame = frames[index] ?? frames[0];

  useEffect(() => {
    region.current?.focus();
  }, []);

  function go(next: number) {
    const clamped = Math.max(0, Math.min(frames.length - 1, next));
    setIndex(clamped);
    setHint(false);
    const node = scroller.current?.children[clamped] as HTMLElement | undefined;
    node?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", inline: "start", block: "nearest" });
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const next = stepAngle(index, frames.length, event.key);
    if (next === null) {
      if (event.key === "Escape") onClose?.();
      return;
    }
    event.preventDefault();
    go(next);
  }

  function onScroll() {
    const node = scroller.current;
    if (!node || node.clientWidth === 0) return;
    const next = Math.round(node.scrollLeft / node.clientWidth);
    if (next !== index) {
      setIndex(next);
      setHint(false);
    }
  }

  function onPointerDown(event: React.PointerEvent) {
    pointer.current = { x: event.clientX, id: event.pointerId };
  }

  function onPointerUp(event: React.PointerEvent) {
    const start = pointer.current;
    pointer.current = null;
    if (!start || start.id !== event.pointerId) return;
    const delta = event.clientX - start.x;
    if (delta <= -40) go(index + 1);
    if (delta >= 40) go(index - 1);
  }

  return (
    <section
      ref={region}
      className="orbit"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${nameEn} angles`}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="orbit-stage">
        {reduce ? (
          <Image
            src={frame.image}
            alt=""
            width={360}
            height={480}
            unoptimized
            className="cut-photo"
            draggable={false}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          />
        ) : (
          <div ref={scroller} className="orbit-scroller" onScroll={onScroll}>
            {frames.map((item) => (
              <Image
                key={item.angle}
                src={item.image}
                alt=""
                width={360}
                height={480}
                unoptimized
                className="cut-photo"
                draggable={false}
              />
            ))}
          </div>
        )}
      </div>
      <div className="orbit-nav">
        <button type="button" className="orbit-arrow" aria-label="Previous angle 上一面" disabled={index === 0} onClick={() => go(index - 1)}>
          ‹
        </button>
        <div className="dot-row" role="group" aria-label="Angles">
          {frames.map((item, dot) => (
            <button
              key={item.angle}
              type="button"
              className="dot-hit"
              aria-label={slideAnnouncement(dot, frames.length, item.angle)}
              aria-current={dot === index}
              onClick={() => go(dot)}
            >
              <span className={dot === index ? "dot is-on" : "dot"} />
            </button>
          ))}
        </div>
        <button
          type="button"
          className="orbit-arrow"
          aria-label="Next angle 下一面"
          disabled={index === frames.length - 1}
          onClick={() => go(index + 1)}
        >
          ›
        </button>
      </div>
      <h3 className="cut-name-en" style={{ fontSize: "var(--type-title)", marginTop: "var(--space-2)" }}>
        {nameEn}
      </h3>
      <p className="cut-name-zh" lang="zh-HK">
        {nameYue}
      </p>
      <p className="angle-label" aria-live="polite">
        {slideAnnouncement(index, frames.length, frame.angle)}
      </p>
      {hint && !reduce ? (
        <p className="note">
          Swipe <span lang="zh-HK">左右滑</span>
        </p>
      ) : null}
      {onClose ? (
        <button type="button" className="cta cta-line" style={{ marginTop: "var(--space-3)" }} onClick={onClose}>
          Close <span lang="zh-HK">關閉</span>
        </button>
      ) : null}
    </section>
  );
}
