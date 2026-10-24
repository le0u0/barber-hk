"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { blobToJpegBase64 } from "@/lib/image-file";
import { t } from "@/lib/i18n";
import { BRIEF_KEY, loadPrefs, savePrefs } from "@/lib/prefs";
import { usePrefs } from "@/lib/use-prefs";
import type { BriefResponse } from "@/lib/types";

export default function SelfiePage() {
  const router = useRouter();
  const lang = usePrefs().lang;
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
      throw new Error(data.error || t(lang, "couldNotMake"));
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
    if (!file) {
      setError(t(lang, "choosePhoto"));
      return;
    }
    setPending(true);
    setError("");
    try {
      await send(await blobToJpegBase64(file));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t(lang, "couldNotRead"));
      setPending(false);
    }
  }

  async function useSample() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/fixtures/selfie-sample.png");
      if (!response.ok) throw new Error(t(lang, "sampleMissing"));
      await send(await blobToJpegBase64(await response.blob()));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t(lang, "couldNotSample"));
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
      <h1 className="text-2xl font-semibold">{t(lang, "selfie")}</h1>
      <p className="text-sm">{t(lang, "selfieLead")}</p>
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <label className="text-sm">
          {t(lang, "photo")}
          <input
            className="mt-1 block w-full"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
          />
        </label>
        {error ? (
          <p role="alert" className="text-sm text-red-800">
            {error}
          </p>
        ) : null}
        <button type="submit" className="border border-stone-900 px-3 py-2 disabled:opacity-50" disabled={pending}>
          {pending ? t(lang, "makingBrief") : t(lang, "readPhoto")}
        </button>
        <button type="button" className="border px-3 py-2 disabled:opacity-50" disabled={pending} onClick={useSample}>
          {t(lang, "useSample")}
        </button>
      </form>
    </main>
  );
}
