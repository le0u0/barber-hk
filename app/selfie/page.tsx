"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  SAMPLE_FAIL,
  SELFIE_FAIL,
  SELFIE_NEED,
  SELFIE_NETWORK,
  SELFIE_OFFLINE,
  apiErrorCopy,
  isTransportError,
} from "@/lib/fallback-brief";
import { blobToJpegBase64 } from "@/lib/image-file";
import { BRIEF_KEY, loadPrefs, savePrefs } from "@/lib/prefs";
import type { BriefResponse } from "@/lib/types";

export default function SelfiePage() {
  const router = useRouter();
  const [error, setError] = useState<{ en: string; yue: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function send(imageBase64: string) {
    const response = await fetch("/api/brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "selfie", mimeType: "image/jpeg", imageBase64 }),
    });
    const data = (await response.json()) as BriefResponse & { error?: string };
    if (!response.ok || !data.brief) {
      throw new Error(data.error || "Could not make a brief.");
    }
    const prefs = loadPrefs();
    savePrefs({ ...prefs, lastCutId: data.cut.id });
    sessionStorage.setItem(BRIEF_KEY, JSON.stringify(data));
    router.push("/brief");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("photo");
    const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;
    if (!navigator.onLine) {
      setError(SELFIE_OFFLINE);
      return;
    }
    if (!file) {
      setError(SELFIE_NEED);
      return;
    }
    setPending(true);
    setError(null);
    try {
      await send(await blobToJpegBase64(file));
    } catch (caught) {
      setError(
        isTransportError(caught)
          ? SELFIE_NETWORK
          : apiErrorCopy(caught instanceof Error ? caught.message : undefined, SELFIE_FAIL),
      );
      setPending(false);
    }
  }

  async function useSample() {
    if (!navigator.onLine) {
      setError(SELFIE_OFFLINE);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/fixtures/selfie-sample.png");
      if (!response.ok) throw new Error(SAMPLE_FAIL.en);
      await send(await blobToJpegBase64(await response.blob()));
    } catch (caught) {
      setError(
        isTransportError(caught) ? SELFIE_NETWORK : apiErrorCopy(caught instanceof Error ? caught.message : undefined, SAMPLE_FAIL),
      );
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
      <h1 className="text-2xl font-semibold">Selfie 自拍</h1>
      <p className="text-sm">
        The photo is sent once to make a brief. It is not stored. QA fixture path:{" "}
        <code>fixtures/selfie-sample.png</code>
      </p>
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <label className="text-sm">
          Photo 相片
          <input
            className="mt-1 block w-full"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
          />
        </label>
        {error ? (
          <p role="alert" className="text-sm text-red-800">
            {error.en} <span lang="zh-HK">{error.yue}</span>
          </p>
        ) : null}
        <button type="submit" className="border border-stone-900 px-3 py-2 disabled:opacity-50" disabled={pending}>
          {pending ? "Making brief…" : "Read photo 睇相"}
        </button>
        <button type="button" className="border px-3 py-2 disabled:opacity-50" disabled={pending} onClick={useSample}>
          Use sample fixture
        </button>
      </form>
    </main>
  );
}
