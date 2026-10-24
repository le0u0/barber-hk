"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { BRIEF_KEY } from "@/lib/prefs";
import type { BriefCopy, BriefResponse } from "@/lib/types";

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

function CopyBlock({ lang, title, copy }: { lang: "en" | "yue"; title: string; copy: BriefCopy }) {
  return (
    <section lang={lang === "yue" ? "zh-HK" : "en"} className="card p-3">
      <h2 className="font-semibold">{title}</h2>
      {LABELS[lang].map(([key, label]) => (
        <p key={key} className="mt-2 text-sm">
          <span className="font-medium">{label}. </span>
          {copy[key]}
        </p>
      ))}
    </section>
  );
}

function subscribe() {
  return () => {};
}

function readBrief() {
  return sessionStorage.getItem(BRIEF_KEY);
}

export default function BriefPage() {
  const raw = useSyncExternalStore(subscribe, readBrief, () => null);
  let brief: BriefResponse | null = null;
  if (raw) {
    try {
      brief = JSON.parse(raw) as BriefResponse;
    } catch {
      brief = null;
    }
  }

  if (!brief?.brief) {
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-3 px-4 py-6">
        <h1 className="text-2xl font-semibold">No brief yet</h1>
        <p lang="zh-HK">未有備忘。先做問卷或者自拍。</p>
        <Link href="/quiz" className="btn-primary">
          Quiz 問卷
        </Link>
        <Link href="/selfie" className="btn-primary">
          Selfie 自拍
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
      <p className="muted text-xs uppercase tracking-wide">
        {brief.source === "gemini" ? "Gemini" : "Static fallback"}
        {brief.fallbackReason ? ` (${brief.fallbackReason})` : ""}
      </p>
      {brief.notice ? (
        <div className="notice p-3 text-sm" role="status">
          <p>{brief.notice.en}</p>
          <p lang="zh-HK">{brief.notice.yue}</p>
        </div>
      ) : null}
      <div className="flex items-end gap-3">
        <Image src={brief.cut.image} alt="" width={96} height={128} unoptimized />
        <div>
          <h1 className="text-2xl font-semibold">{brief.cut.nameEn}</h1>
          <p lang="zh-HK" className="text-lg">
            {brief.cut.nameYue}
          </p>
          <p className="muted text-xs">
            <code>{brief.cut.id}</code>
          </p>
        </div>
      </div>
      <CopyBlock lang="en" title="English" copy={brief.brief.en} />
      <CopyBlock lang="yue" title="粵語" copy={brief.brief.yue} />
      <section className="text-sm">
        <h2 className="font-semibold">East Asian hair note</h2>
        <p className="mt-1">{brief.cut.eastAsianNote}</p>
      </section>
    </main>
  );
}
