"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { EMPTY_BRIEF } from "@/lib/fallback-brief";
import { BRIEF_KEY } from "@/lib/prefs";
import type { BriefResponse } from "@/lib/types";
import { BriefView } from "../brief-view";
import { useOnline } from "../offline-note";

function subscribe() {
  return () => {};
}

function readBrief() {
  return sessionStorage.getItem(BRIEF_KEY);
}

export default function BriefPage() {
  const raw = useSyncExternalStore(subscribe, readBrief, () => null);
  const online = useOnline();
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
        <h1 className="text-2xl font-semibold">
          {EMPTY_BRIEF.title.en} <span lang="zh-HK">{EMPTY_BRIEF.title.yue}</span>
        </h1>
        <p>{EMPTY_BRIEF.body.en}</p>
        <p lang="zh-HK">{EMPTY_BRIEF.body.yue}</p>
        {online ? null : (
          <>
            <p>{EMPTY_BRIEF.offline.en}</p>
            <p lang="zh-HK">{EMPTY_BRIEF.offline.yue}</p>
          </>
        )}
        <Link href="/quiz" className="underline">
          Quiz 問卷
        </Link>
        <Link href="/selfie" className="underline">
          Selfie 自拍
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
      <h1 className="sr-only">
        {brief.cut.nameEn} {brief.cut.nameYue}
      </h1>
      <BriefView brief={brief} />
    </main>
  );
}
