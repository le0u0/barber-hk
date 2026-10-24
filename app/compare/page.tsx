"use client";

import Image from "next/image";
import { useState } from "react";
import { listCuts, type Cut } from "@/lib/catalog";
import { COMPARE_FIELDS, compareCuts } from "@/lib/compare";
import { savePrefs } from "@/lib/prefs";
import { usePrefs } from "@/lib/use-prefs";

const DEFAULT_PAIR = { left: "crop-fade", right: "french-crop" };

export default function ComparePage() {
  const prefs = usePrefs();
  const cuts = listCuts();
  const [draft, setDraft] = useState<{ left: string; right: string } | null>(null);
  const chosen = draft ?? prefs.compare ?? DEFAULT_PAIR;
  const pair = compareCuts(chosen.left, chosen.right);

  function choose(side: "left" | "right", id: string) {
    const next = { ...chosen, [side]: id };
    if (!compareCuts(next.left, next.right)) return;
    setDraft(next);
    savePrefs({ ...prefs, compare: next });
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
      <h1 className="text-2xl font-semibold">
        Compare two cuts <span lang="zh-HK">比較兩款</span>
      </h1>
      <p className="text-sm">Put two cuts side by side and read the difference to your barber.</p>
      <p lang="zh-HK" className="text-sm">
        兩款並排，對住師傅講分別。
      </p>
      {pair ? (
        <>
          <section className="border border-stone-300 bg-white p-3 text-sm">
            <h2 className="font-semibold">
              Say this <span lang="zh-HK">照住講</span>
            </h2>
            <p className="mt-2">{pair.line.en}</p>
            <p lang="zh-HK" className="mt-1">
              {pair.line.yue}
            </p>
          </section>
          <div className="grid grid-cols-2 gap-3">
            <Column
              labelEn="This one"
              labelYue="呢款"
              cut={pair.left}
              cuts={cuts}
              otherId={pair.right.id}
              onChange={(id) => choose("left", id)}
            />
            <Column
              labelEn="The other"
              labelYue="另一款"
              cut={pair.right}
              cuts={cuts}
              otherId={pair.left.id}
              onChange={(id) => choose("right", id)}
            />
          </div>
        </>
      ) : (
        <p role="alert" className="text-sm text-red-800">
          Pick two different cuts. <span lang="zh-HK">請揀兩個唔同嘅髮型。</span>
        </p>
      )}
    </main>
  );
}

function Column({
  labelEn,
  labelYue,
  cut,
  cuts,
  otherId,
  onChange,
}: {
  labelEn: string;
  labelYue: string;
  cut: Cut;
  cuts: Cut[];
  otherId: string;
  onChange: (id: string) => void;
}) {
  return (
    <section className="min-w-0 border border-stone-300 bg-white p-2">
      <label className="block text-sm font-medium">
        {labelEn} <span lang="zh-HK">{labelYue}</span>
        <select
          className="mt-1 block w-full border border-stone-300 bg-white p-2 text-sm"
          value={cut.id}
          onChange={(event) => onChange(event.target.value)}
        >
          {cuts.map((option) => (
            <option key={option.id} value={option.id} disabled={option.id === otherId}>
              {option.nameEn} {option.nameYue}
            </option>
          ))}
        </select>
      </label>
      <Image src={cut.image} alt="" width={120} height={160} unoptimized className="mt-2 h-auto w-full" />
      <h2 className="mt-2 text-sm font-semibold">{cut.nameEn}</h2>
      <p lang="zh-HK" className="text-sm">
        {cut.nameYue}
      </p>
      {COMPARE_FIELDS.map((field) => (
        <div key={field.key} className="mt-2 text-xs">
          <p className="font-medium">
            {field.en} <span lang="zh-HK">{field.yue}</span>
          </p>
          <p>{cut.brief.en[field.key]}</p>
          <p lang="zh-HK">{cut.brief.yue[field.key]}</p>
        </div>
      ))}
    </section>
  );
}
