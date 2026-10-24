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
    <header className="site-header">
      <Link href="/" className="font-semibold tracking-tight">
        Barber HK
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link className="nav-link" href="/quiz">
          {lang === "yue" ? "問卷" : "Quiz"}
        </Link>
        <Link className="nav-link" href="/selfie">
          {lang === "yue" ? "自拍" : "Selfie"}
        </Link>
        <button type="button" className="btn-quiet" onClick={toggleLang}>
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
    <p className="muted text-sm">
      Last pick <span lang="zh-HK">上次</span>: <code>{id}</code>
    </p>
  );
}
