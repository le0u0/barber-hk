"use client";

import Image from "next/image";
import { fallbackPanel } from "@/lib/fallback-brief";
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
    <section lang={lang === "yue" ? "zh-HK" : "en"} className="border border-stone-300 bg-white p-3">
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

export function BriefView({ brief }: { brief: BriefResponse }) {
  const panel = fallbackPanel(brief);

  return (
    <>
      {brief.source === "gemini" ? (
        <p className="text-xs uppercase tracking-wide text-stone-600">Gemini</p>
      ) : panel ? (
        <div className="border border-amber-700 bg-amber-50 p-3 text-sm" role="status">
          <p className="font-medium">
            {panel.title.en} <span lang="zh-HK">{panel.title.yue}</span>
          </p>
          <p className="mt-1">{panel.body.en}</p>
          <p lang="zh-HK" className="mt-1">
            {panel.body.yue}
          </p>
        </div>
      ) : null}
      <div className="flex items-end gap-3">
        <Image src={brief.cut.image} alt="" width={96} height={128} unoptimized />
        <div>
          <h2 className="text-2xl font-semibold">{brief.cut.nameEn}</h2>
          <p lang="zh-HK" className="text-lg">
            {brief.cut.nameYue}
          </p>
          <p className="text-xs text-stone-600">
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
    </>
  );
}
