"use client";

import Link from "next/link";
import { savePrefs } from "@/lib/prefs";
import { usePrefs } from "@/lib/use-prefs";

export function Header() {
  const prefs = usePrefs();
  const lang = prefs.lang;

  function toggleLang() {
    savePrefs({ ...prefs, lang: lang === "en" ? "yue" : "en" });
  }

  return (
    <header className="flex items-center justify-between gap-3 px-4 py-3">
      <Link href="/" className="font-semibold tracking-tight">
        Barber HK
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link href="/quiz">{lang === "yue" ? "問卷" : "Quiz"}</Link>
        <Link href="/selfie">{lang === "yue" ? "自拍" : "Selfie"}</Link>
        <Link href="/compare">{lang === "yue" ? "比較" : "Compare"}</Link>
        <button type="button" className="border px-2 py-1" onClick={toggleLang}>
          {lang === "yue" ? "EN" : "粵"}
        </button>
      </nav>
    </header>
  );
}

export function LastPick() {
  const id = usePrefs().lastCutId;
  if (!id) return null;

  return (
    <p className="text-sm text-stone-700">
      Last pick <span lang="zh-HK">上次</span>: <code>{id}</code>
    </p>
  );
}
