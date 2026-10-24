"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChairPair } from "@/app/chair-pair";
import { chairError, joinCopy, selfieCopy } from "@/lib/chair-copy";
import { chairLineStyle, chairPrimaryStyle, chairStyle, chairTokens } from "@/lib/chair-tokens";
import { blobToJpegBase64 } from "@/lib/image-file";
import { BRIEF_KEY, loadPrefs, savePrefs } from "@/lib/prefs";
import { useChairPaint } from "@/lib/use-chair-paint";
import { usePrefs } from "@/lib/use-prefs";
import type { BriefResponse } from "@/lib/types";

export default function SelfiePage() {
  const router = useRouter();
  const lang = usePrefs().lang;
  useChairPaint();
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
      throw new Error(data.error || joinCopy(selfieCopy.fail));
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
      setError(joinCopy(selfieCopy.needPhoto));
      return;
    }
    setPending(true);
    setError("");
    try {
      await send(await blobToJpegBase64(file));
    } catch (caught) {
      setError(chairError(caught, selfieCopy.fail));
      setPending(false);
    }
  }

  async function useSample() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/fixtures/selfie-sample.png");
      if (!response.ok) throw new Error(joinCopy(selfieCopy.sampleMissing));
      await send(await blobToJpegBase64(await response.blob()));
    } catch (caught) {
      setError(chairError(caught, selfieCopy.sampleMissing));
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6" data-chair="selfie" style={chairStyle()}>
      <h1 className="text-3xl font-bold tracking-tight">
        <ChairPair copy={selfieCopy.title} lang={lang} />
      </h1>
      <p className="text-base leading-normal">
        <ChairPair copy={selfieCopy.privacy} lang={lang} />
      </p>
      <p className="text-sm">
        <code>fixtures/selfie-sample.png</code>
      </p>
      <form className="flex flex-col gap-3" lang={lang === "yue" ? "zh-HK" : "en"} noValidate onSubmit={onSubmit}>
        <label className="flex flex-col justify-center gap-2 px-3 py-2 font-bold" style={chairLineStyle()}>
          <ChairPair copy={selfieCopy.photo} lang={lang} />
          <input className="max-w-full font-normal" name="photo" type="file" accept="image/jpeg,image/png,image/webp" />
        </label>
        {error ? (
          <p role="alert" className="font-bold" style={{ color: chairTokens.vermillion }}>
            {error}
          </p>
        ) : null}
        <button type="submit" className="w-full px-3 py-2 text-base font-bold disabled:opacity-50" style={chairPrimaryStyle()} disabled={pending}>
          <ChairPair copy={pending ? selfieCopy.pending : selfieCopy.submit} lang={lang} />
        </button>
        <button type="button" className="w-full px-3 py-2 text-base font-bold disabled:opacity-50" style={chairLineStyle()} disabled={pending} onClick={useSample}>
          <ChairPair copy={selfieCopy.sample} lang={lang} />
        </button>
      </form>
    </main>
  );
}
