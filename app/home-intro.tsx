"use client";

import Link from "next/link";
import { listCutCards } from "@/lib/catalog";
import { cutDisplayName } from "@/lib/cut-name";
import { usePrefs } from "@/lib/use-prefs";

export function HomeIntro() {
  const prefs = usePrefs();
  const yue = prefs.lang === "yue";
  const last = listCutCards().find((cut) => cut.id === prefs.lastCutId) ?? null;

  return (
    <section className="flex max-w-xl flex-col gap-4 pb-8 pt-2">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-600">
        {yue ? "香港男士髮型" : "Hong Kong men’s cuts"}
      </p>
      <div className="flex flex-col gap-2">
        <h1 className="text-[1.75rem] font-semibold leading-[1.15] tracking-tight">
          {yue ? "一份畀師傅睇嘅備忘" : "A brief to show your barber"}
        </h1>
        <p lang={yue ? "en" : "zh-HK"} className="text-lg leading-snug">
          {yue ? "A brief to show your barber. English and Cantonese, one screen." : "英文同粵語，一屏講晒你想點剪。"}
        </p>
      </div>
      <p className="text-sm leading-relaxed text-stone-700">
        {yue ? "做問卷或者自拍，出一版備忘，將電話畀師傅睇。" : "Quiz or selfie. You get one screen in English and 粵語 — hand the phone over."}
        <span lang={yue ? "en" : "zh-HK"} className="mt-1 block">
          {yue
            ? "Quiz or selfie, then hand your phone to the barber."
            : "做問卷或者自拍，然後將呢一版畀師傅睇。"}
        </span>
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/quiz"
          className="flex min-h-14 flex-col justify-center bg-stone-900 px-4 py-3 text-white"
        >
          <span className="text-base font-semibold">{yue ? "問卷" : "Quiz"}</span>
          <span className="text-sm text-stone-200">{yue ? "四條問題" : "Four questions · 問卷"}</span>
        </Link>
        <Link
          href="/selfie"
          className="flex min-h-14 flex-col justify-center border border-stone-900 bg-white px-4 py-3"
        >
          <span className="text-base font-semibold">{yue ? "自拍" : "Selfie"}</span>
          <span className="text-sm text-stone-600">{yue ? "一張相" : "One photo · 自拍"}</span>
        </Link>
      </div>
      <p className="text-xs leading-relaxed text-stone-600">
        {yue ? "偏好只留喺呢個瀏覽器。自拍唔會保存。" : "Preferences stay in this browser. Your selfie is not kept."}
        <span lang={yue ? "en" : "zh-HK"} className="block">
          {yue ? "Preferences stay in this browser. Your selfie is not kept." : "偏好只留喺呢個瀏覽器。自拍唔會保存。"}
        </span>
      </p>
      {last ? (
        <Link href="/brief" className="inline-flex min-h-[44px] items-center text-sm font-medium underline underline-offset-4">
          {yue ? "上次" : "Last time"}: {cutDisplayName(last, prefs.lang)}
          <span lang={yue ? "en" : "zh-HK"}> · {cutDisplayName(last, yue ? "en" : "yue")}</span>
        </Link>
      ) : null}
    </section>
  );
}
