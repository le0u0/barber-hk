"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { BilingualAlert } from "../bilingual-alert";
import { BRIEF_EMPTY, COPY_FAIL, COPY_OK, leadRest, type Bilingual } from "@/lib/alert-copy";
import { resolveStoredBrief } from "@/lib/brief-resume";
import { formatBriefText } from "@/lib/brief-text";
import { cutView } from "@/lib/cut-views";
import { cutDisplayName } from "@/lib/cut-name";
import { CutCarousel } from "../cut-carousel";
import { BRIEF_EVENT, readBriefRaw } from "@/lib/prefs";
import { usePrefs } from "@/lib/use-prefs";
import type { BriefCopy } from "@/lib/types";

const LABELS = {
  en: [
    ["ask", "Say this"],
    ["sides", "Sides"],
    ["top", "Top"],
    ["fringe", "Fringe"],
    ["finish", "Finish"],
  ],
  yue: [
    ["ask", "照住講"],
    ["sides", "兩側"],
    ["top", "頂"],
    ["fringe", "劉海"],
    ["finish", "造型"],
  ],
} as const;

const COPY = {
  en: {
    quiz: "Quiz",
    selfie: "Selfie",
    copyEn: "Copy English",
    copyYue: "Copy 粵語",
    share: "Share both",
    note: "East Asian hair note",
  },
  yue: {
    quiz: "問卷",
    selfie: "自拍",
    copyEn: "複製英文",
    copyYue: "複製粵語",
    share: "一齊分享",
    note: "東亞髮質（英文）",
  },
} as const;

function subscribe(onStoreChange: () => void) {
  window.addEventListener(BRIEF_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(BRIEF_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function useClientReady() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function BriefPage() {
  const ready = useClientReady();
  const raw = useSyncExternalStore(subscribe, readBriefRaw, () => null);
  const prefs = usePrefs();
  const yue = prefs.lang === "yue";
  const copy = yue ? COPY.yue : COPY.en;
  const lang = yue ? "yue" : "en";
  const brief = resolveStoredBrief(raw, prefs.lastCutId);
  const [status, setStatus] = useState<Bilingual | null>(null);

  if (!ready) {
    return <main className="mx-auto min-h-[40vh] w-full max-w-xl px-4 py-6" />;
  }

  async function write(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(COPY_OK);
    } catch {
      setStatus(COPY_FAIL);
    }
  }

  async function share() {
    if (!brief) return;
    const text = formatBriefText(brief, "both");
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: cutDisplayName(brief.cut, lang), text });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    await write(text);
  }

  if (!brief?.brief) {
    const title = leadRest(BRIEF_EMPTY.title, yue);
    const body = leadRest(BRIEF_EMPTY.body, yue);
    return (
      <main className="page-form">
        <h1 className="hero-title">
          {title.lead} <span lang={title.restLang}>{title.rest}</span>
        </h1>
        <p className="hero-yue">
          {body.lead} <span lang={body.restLang}>{body.rest}</span>
        </p>
        <div className="cta-row">
          <Link href="/quiz" className="cta cta-yellow">
            Quiz <span lang="zh-HK">問卷</span>
          </Link>
          <Link href="/selfie" className="cta cta-ink">
            Selfie <span lang="zh-HK">自拍</span>
          </Link>
        </div>
      </main>
    );
  }

  const order = yue ? (["yue", "en"] as const) : (["en", "yue"] as const);
  const view = cutView(brief.cut.id);

  return (
    <main className="page-form" lang={yue ? "zh-HK" : "en"}>
      {view && view.orbit ? (
        <CutCarousel frames={view.frames} nameEn={view.nameEn} nameYue={view.nameYue} />
      ) : (
        <div className="flex items-center gap-3">
          <Image src={brief.cut.image} alt="" width={96} height={128} unoptimized className="cut-photo" style={{ width: 96 }} />
          <div>
            <h1 className="hero-title">{cutDisplayName(brief.cut, lang)}</h1>
            <p className="hero-yue" lang={yue ? "en" : "zh-HK"}>
              {cutDisplayName(brief.cut, yue ? "en" : "yue")}
            </p>
          </div>
        </div>
      )}
      {brief.notice ? (
        <div className="alert" role="status">
          <p>{yue ? brief.notice.yue : brief.notice.en}</p>
          <p lang={yue ? "en" : "zh-HK"}>{yue ? brief.notice.en : brief.notice.yue}</p>
        </div>
      ) : null}
      <div className="cta-row">
        <button type="button" className="cta cta-yellow" onClick={() => write(formatBriefText(brief, "en"))}>
          {copy.copyEn}
        </button>
        <button type="button" className="cta cta-yellow" onClick={() => write(formatBriefText(brief, "yue"))}>
          {copy.copyYue}
        </button>
        <button type="button" className="cta cta-ink" style={{ gridColumn: "1 / -1" }} onClick={share}>
          {copy.share}
        </button>
      </div>
      {status ? <BilingualAlert copy={status} yue={yue} role="status" className="ok" /> : null}
      <div className="brief-langs">
        {order.map((code) => (
          <article key={code} className="brief-card" lang={code === "yue" ? "zh-HK" : "en"}>
            <h2 className="font-bold">{code === "yue" ? "粵語" : "English"}</h2>
            {LABELS[code].map(([key, label]) => (
              <p key={key} className={key === "ask" ? "text-xl font-medium leading-snug" : undefined}>
                <span className="font-semibold">{label}. </span>
                {brief.brief[code][key as keyof BriefCopy]}
              </p>
            ))}
          </article>
        ))}
      </div>
      <section className="note">
        <h2 className="font-semibold">{copy.note}</h2>
        <p lang="en">{brief.cut.eastAsianNote}</p>
      </section>
    </main>
  );
}
