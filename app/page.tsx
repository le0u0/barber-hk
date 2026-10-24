"use client";

import Image from "next/image";
import Link from "next/link";
import { listCuts } from "@/lib/catalog";
import { cutLabel, cutsHeading, t } from "@/lib/i18n";
import { usePrefs } from "@/lib/use-prefs";
import { LastPick } from "./header";

export default function Home() {
  const lang = usePrefs().lang;
  const cuts = listCuts();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{t(lang, "homeTitle")}</h1>
        <p>{t(lang, "homeLead")}</p>
        <LastPick />
      </div>
      <div className="flex gap-3">
        <Link href="/quiz" className="border border-stone-900 px-3 py-2">
          {t(lang, "quiz")}
        </Link>
        <Link href="/selfie" className="border border-stone-900 px-3 py-2">
          {t(lang, "selfie")}
        </Link>
      </div>
      <section>
        <h2 className="mb-3 text-sm font-semibold">{cutsHeading(lang, cuts.length)}</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cuts.map((cut) => (
            <li key={cut.id} className="border border-stone-300 bg-white p-2">
              <Image src={cut.image} alt="" width={120} height={160} unoptimized />
              <p className="mt-1 text-sm font-medium" lang={lang === "yue" ? "zh-HK" : "en"}>
                {cutLabel(cut, lang)}
              </p>
              <p className="text-xs text-stone-600">
                <code>{cut.id}</code>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
