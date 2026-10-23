"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { resolveStoredBrief } from "@/lib/brief-resume";
import { formatBriefText } from "@/lib/brief-text";
import { cutDisplayName } from "@/lib/cut-name";
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
    emptyTitle: "No brief yet",
    emptyBody: "Take the quiz or send a selfie.",
    quiz: "Quiz",
    selfie: "Selfie",
    copyEn: "Copy English",
    copyYue: "Copy 粵語",
    share: "Share both",
    copied: "Copied",
    copyFail: "Could not copy",
    note: "East Asian hair note",
  },
  yue: {
    emptyTitle: "未有備忘",
    emptyBody: "先做問卷或者自拍。",
    quiz: "問卷",
    selfie: "自拍",
    copyEn: "複製英文",
    copyYue: "複製粵語",
    share: "一齊分享",
    copied: "已複製",
    copyFail: "複製唔到",
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
  const [status, setStatus] = useState("");

  if (!ready) {
    return <main className="mx-auto min-h-[40vh] w-full max-w-xl px-4 py-6" />;
  }

  async function write(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(copy.copied);
    } catch {
      setStatus(copy.copyFail);
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
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-3 px-4 py-6">
        <h1 className="text-2xl font-semibold">{copy.emptyTitle}</h1>
        <p>{copy.emptyBody}</p>
        <Link href="/quiz" className="inline-flex min-h-[44px] items-center underline">
          {copy.quiz}
        </Link>
        <Link href="/selfie" className="inline-flex min-h-[44px] items-center underline">
          {copy.selfie}
        </Link>
      </main>
    );
  }

  const shown = brief.brief[lang];

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6" lang={yue ? "zh-HK" : "en"}>
      <div className="flex items-center gap-3">
        <Image
          src={brief.cut.image}
          alt=""
          width={96}
          height={128}
          unoptimized
          className="h-28 w-[84px] object-cover object-top"
        />
        <div>
          <h1 className="text-3xl font-semibold leading-tight">{cutDisplayName(brief.cut, lang)}</h1>
          <p lang={yue ? "en" : "zh-HK"} className="text-lg">
            {cutDisplayName(brief.cut, yue ? "en" : "yue")}
          </p>
        </div>
      </div>
      {brief.notice ? (
        <div className="border border-amber-700 bg-amber-50 p-3 text-sm" role="status">
          <p>{yue ? brief.notice.yue : brief.notice.en}</p>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="min-h-[44px] border border-stone-900 px-3 py-2 text-sm font-medium" onClick={() => write(formatBriefText(brief, "en"))}>
          {copy.copyEn}
        </button>
        <button type="button" className="min-h-[44px] border border-stone-900 px-3 py-2 text-sm font-medium" onClick={() => write(formatBriefText(brief, "yue"))}>
          {copy.copyYue}
        </button>
        <button type="button" className="col-span-2 min-h-[44px] border border-stone-900 bg-stone-900 px-3 py-2 text-sm font-medium text-white" onClick={share}>
          {copy.share}
        </button>
      </div>
      {status ? (
        <p role="status" className="text-sm">
          {status}
        </p>
      ) : null}
      <article className="border border-stone-300 bg-white p-4 text-lg leading-relaxed">
        {LABELS[lang].map(([key, label]) => (
          <p key={key} className={key === "ask" ? "text-xl font-medium leading-snug" : "mt-3"}>
            <span className="font-semibold">{label}. </span>
            {shown[key as keyof BriefCopy]}
          </p>
        ))}
      </article>
      <section className="text-sm leading-relaxed">
        <h2 className="font-semibold">{copy.note}</h2>
        <p className="mt-1" lang="en">
          {brief.cut.eastAsianNote}
        </p>
      </section>
    </main>
  );
}
