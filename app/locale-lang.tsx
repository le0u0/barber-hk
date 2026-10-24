"use client";

import { useEffect } from "react";
import { usePrefs } from "@/lib/use-prefs";

export function LocaleLang() {
  const lang = usePrefs().lang;

  useEffect(() => {
    document.documentElement.lang = lang === "yue" ? "zh-HK" : "en";
  }, [lang]);

  return null;
}
