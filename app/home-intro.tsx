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
    <section>
      <h1 className="hero-title">{yue ? "一份畀師傅睇嘅備忘" : "A brief for your barber"}</h1>
      <p className="hero-yue" lang={yue ? "en" : "zh-HK"}>
        {yue ? "A brief for your barber. English and Cantonese on one screen." : "英文同粵語，一屏畀師傅睇。"}
      </p>
      {last ? (
        <Link href="/brief" className="last-chip">
          {yue ? "上次" : "Last pick"} {yue ? "Last pick" : "上次"}: {cutDisplayName(last, prefs.lang)}
          <span lang={yue ? "en" : "zh-HK"}> · {cutDisplayName(last, yue ? "en" : "yue")}</span>
        </Link>
      ) : null}
      <div className="cta-row">
        <Link href="/quiz" className="cta cta-yellow">
          <span>Quiz</span>
          <span lang="zh-HK">問卷</span>
        </Link>
        <Link href="/selfie" className="cta cta-ink">
          <span>Selfie</span>
          <span lang="zh-HK">自拍</span>
        </Link>
      </div>
    </section>
  );
}
