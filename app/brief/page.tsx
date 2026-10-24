"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  BRIEF_FIELDS,
  briefFieldLabel,
  briefOutputLang,
  cutLabel,
  sourceLabel,
  t,
  type Locale,
} from "@/lib/i18n";
import { BRIEF_KEY } from "@/lib/prefs";
import { usePrefs } from "@/lib/use-prefs";
import type { BriefCopy, BriefResponse } from "@/lib/types";

function CopyBlock({ lang, copy }: { lang: Locale; copy: BriefCopy }) {
  return (
    <section lang={lang === "yue" ? "zh-HK" : "en"} className="border border-stone-300 bg-white p-3">
      {BRIEF_FIELDS.map((key) => (
        <p key={key} className="mt-2 text-sm">
          <span className="font-medium">{briefFieldLabel(lang, key)}. </span>
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
  const uiLang = usePrefs().lang;
  const [outputOverride, setOutputOverride] = useState<Locale | null>(null);
  const briefLang = briefOutputLang(uiLang, outputOverride);
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
        <h1 className="text-2xl font-semibold">{t(uiLang, "noBrief")}</h1>
        <p>{t(uiLang, "noBriefLead")}</p>
        <Link href="/quiz" className="underline">
          {t(uiLang, "quiz")}
        </Link>
        <Link href="/selfie" className="underline">
          {t(uiLang, "selfie")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
      <p className="text-xs uppercase tracking-wide text-stone-600">
        {sourceLabel(uiLang, brief.source)}
        {brief.fallbackReason ? ` (${brief.fallbackReason})` : ""}
      </p>
      {brief.notice ? (
        <div className="border border-amber-700 bg-amber-50 p-3 text-sm" role="status">
          <p lang={briefLang === "yue" ? "zh-HK" : "en"}>{brief.notice[briefLang]}</p>
        </div>
      ) : null}
      <div className="flex items-end gap-3">
        <Image src={brief.cut.image} alt="" width={96} height={128} unoptimized />
        <div>
          <h1 className="text-2xl font-semibold" lang={uiLang === "yue" ? "zh-HK" : "en"}>
            {cutLabel(brief.cut, uiLang)}
          </h1>
          <p className="text-xs text-stone-600">
            <code>{brief.cut.id}</code>
          </p>
        </div>
      </div>
      <div className="lang-switch" role="group" aria-label={t(uiLang, "briefLanguage")}>
        <button type="button" aria-pressed={briefLang === "en"} onClick={() => setOutputOverride("en")}>
          English
        </button>
        <span aria-hidden="true">|</span>
        <button type="button" aria-pressed={briefLang === "yue"} onClick={() => setOutputOverride("yue")}>
          粵語
        </button>
      </div>
      <CopyBlock lang={briefLang} copy={brief.brief[briefLang]} />
      <section className="text-sm">
        <h2 className="font-semibold">{t(uiLang, "eastAsian")}</h2>
        <p className="mt-1">{brief.cut.eastAsianNote}</p>
      </section>
    </main>
  );
}
