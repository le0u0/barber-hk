"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { blobToJpegBase64 } from "@/lib/image-file";
import { loadPrefs, saveBrief, savePrefs } from "@/lib/prefs";
import { showSampleFixture } from "@/lib/qa";
import { usePrefs } from "@/lib/use-prefs";
import type { BriefResponse } from "@/lib/types";

const COPY = {
  en: {
    title: "Selfie",
    other: "自拍",
    privacy: "The photo is sent once to write your brief. It is not kept.",
    photo: "Photo",
    needPhoto: "Choose a photo first.",
    fail: "Could not read that photo.",
    pending: "Making the brief…",
    submit: "Read photo",
    sample: "Use a sample photo",
    sampleMissing: "Sample photo is unavailable.",
  },
  yue: {
    title: "自拍",
    other: "Selfie",
    privacy: "相片只送一次嚟寫備忘，唔會保存。",
    photo: "相片",
    needPhoto: "請先揀相。",
    fail: "讀唔到呢張相。",
    pending: "寫緊備忘…",
    submit: "睇相",
    sample: "用示範相",
    sampleMissing: "示範相用唔到。",
  },
} as const;

export default function SelfiePage() {
  const router = useRouter();
  const yue = usePrefs().lang === "yue";
  const copy = yue ? COPY.yue : COPY.en;
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function send(imageBase64: string) {
    const response = await fetch("/api/brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "selfie", mimeType: "image/jpeg", imageBase64 }),
    });
    const data = (await response.json()) as BriefResponse & { error?: string };
    if (!response.ok || !data.brief) {
      throw new Error(data.error || copy.fail);
    }
    const prefs = loadPrefs();
    savePrefs({ ...prefs, lastCutId: data.cut.id });
    saveBrief(data);
    router.push("/brief");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("photo");
    const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;
    if (!file) {
      setError(copy.needPhoto);
      return;
    }
    setPending(true);
    setError("");
    try {
      await send(await blobToJpegBase64(file));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.fail);
      setPending(false);
    }
  }

  async function useSample() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/fixtures/selfie-sample.png");
      if (!response.ok) throw new Error(copy.sampleMissing);
      await send(await blobToJpegBase64(await response.blob()));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.sampleMissing);
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold">{copy.title}</h1>
        <p lang={yue ? "en" : "zh-HK"} className="text-sm text-stone-600">
          {copy.other}
        </p>
      </div>
      <p className="text-sm leading-relaxed">
        {copy.privacy}
        <span lang={yue ? "en" : "zh-HK"} className="mt-1 block text-stone-600">
          {yue ? COPY.en.privacy : COPY.yue.privacy}
        </span>
      </p>
      <form className="flex flex-col gap-3" lang={yue ? "zh-HK" : "en"} onSubmit={onSubmit}>
        <label className="flex min-h-[44px] flex-col justify-center text-base">
          {copy.photo}
          <input className="mt-1 block w-full" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required />
        </label>
        {error ? (
          <p role="alert" className="text-sm text-red-800">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="min-h-12 border border-stone-900 bg-stone-900 px-3 py-2 text-white disabled:opacity-50"
          disabled={pending}
        >
          {pending ? copy.pending : copy.submit}
        </button>
        <Suspense fallback={null}>
          <SamplePhoto pending={pending} label={copy.sample} onUse={useSample} />
        </Suspense>
      </form>
    </main>
  );
}

function SamplePhoto({ pending, label, onUse }: { pending: boolean; label: string; onUse: () => void }) {
  const qa = useSearchParams().get("qa");
  if (!showSampleFixture(process.env.NODE_ENV, qa)) return null;

  return (
    <button type="button" className="min-h-[44px] border px-3 py-2 disabled:opacity-50" disabled={pending} onClick={onUse}>
      {label}
    </button>
  );
}
