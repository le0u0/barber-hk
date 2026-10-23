"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { savePrefs } from "@/lib/prefs";
import { usePrefs } from "@/lib/use-prefs";

export function Header() {
  const prefs = usePrefs();
  const yue = prefs.lang === "yue";
  const path = usePathname();

  function toggleLang() {
    savePrefs({ ...prefs, lang: yue ? "en" : "yue" });
  }

  return (
    <header className="site-header">
      <Link href="/" className="logo-mark">
        Barber HK
      </Link>
      <nav className="flex items-center">
        <Link href="/quiz" className={path === "/quiz" ? "nav-link is-active" : "nav-link"}>
          Quiz
        </Link>
        <Link href="/selfie" className={path === "/selfie" ? "nav-link is-active" : "nav-link"}>
          Selfie
        </Link>
        <button
          type="button"
          className="lang-chip"
          aria-label={yue ? "Show English" : "顯示粵語"}
          onClick={toggleLang}
        >
          {yue ? "EN" : "粵"}
        </button>
      </nav>
    </header>
  );
}
