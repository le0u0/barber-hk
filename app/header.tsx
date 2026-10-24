"use client";

import Link from "next/link";
import { t } from "@/lib/i18n";
import { savePrefs } from "@/lib/prefs";
import { usePrefs } from "@/lib/use-prefs";

export function Header() {
  const prefs = usePrefs();
  const lang = prefs.lang;

  function setLang(next: "en" | "yue") {
    savePrefs({ ...prefs, lang: next });
  }

  return (
    <header className="flex items-center justify-between gap-3 px-4 py-3">
      <Link href="/" className="font-semibold tracking-tight">
        Barber HK
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link href="/quiz">{t(lang, "quiz")}</Link>
        <Link href="/selfie">{t(lang, "selfie")}</Link>
        <div className="lang-switch" role="group" aria-label={t(lang, "language")}>
          <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>EN</button>
          <span aria-hidden="true">|</span>
          <button type="button" aria-pressed={lang === "yue"} onClick={() => setLang("yue")}>粵</button>
        </div>
      </nav>
    </header>
  );
}

export function LastPick() {
  const prefs = usePrefs();
  const id = prefs.lastCutId;
  if (!id) return null;

  return (
    <p className="text-sm text-stone-700">
      {t(prefs.lang, "lastPick")}: <code>{id}</code>
    </p>
  );
}
