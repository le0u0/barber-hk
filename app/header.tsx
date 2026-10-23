"use client";

import Link from "next/link";
import { savePrefs } from "@/lib/prefs";
import { usePrefs } from "@/lib/use-prefs";

export function Header() {
  const prefs = usePrefs();
  const yue = prefs.lang === "yue";

  function toggleLang() {
    savePrefs({ ...prefs, lang: yue ? "en" : "yue" });
  }

  return (
    <header className="flex items-center justify-between gap-3 px-4">
      <Link href="/" className="inline-flex min-h-[44px] items-center font-semibold tracking-tight">
        Barber HK
      </Link>
      <nav className="flex items-center text-sm">
        <Link href="/quiz" className="inline-flex min-h-[44px] items-center px-2">
          {yue ? "問卷" : "Quiz"}
        </Link>
        <Link href="/selfie" className="inline-flex min-h-[44px] items-center px-2">
          {yue ? "自拍" : "Selfie"}
        </Link>
        <button
          type="button"
          className="inline-flex min-h-[44px] items-center border px-3"
          aria-label={yue ? "Show English" : "顯示粵語"}
          onClick={toggleLang}
        >
          {yue ? "EN" : "粵"}
        </button>
      </nav>
    </header>
  );
}
