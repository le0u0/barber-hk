"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BilingualAlert } from "../bilingual-alert";
import {
  SELFIE_AGAIN,
  SELFIE_FAIL,
  SELFIE_NEED,
  SELFIE_SAMPLE,
  resolveAlert,
  withFollowUp,
  type Bilingual,
} from "@/lib/alert-copy";
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
    pending: "Making the brief…",
    submit: "Read photo",
    sample: "Use a sample photo",
  },
  yue: {
    title: "自拍",
    other: "Selfie",
    privacy: "相片只送一次嚟寫備忘，唔會保存。",
    photo: "相片",
    pending: "寫緊備忘…",
    submit: "睇相",
    sample: "用示範相",
  },
} as const;

export default function SelfiePage() {
  const router = useRouter();
  const yue = usePrefs().lang === "yue";
  const copy = yue ? COPY.yue : COPY.en;
  const [error, setError] = useState<Bilingual | null>(null);
  const [pending, setPending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  async function send(imageBase64: string) {
    const response = await fetch("/api/brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "selfie", mimeType: "image/jpeg", imageBase64 }),
    });
    const data = (await response.json()) as BriefResponse & { error?: string };
    if (!response.ok || !data.brief) {
      throw new Error(data.error || SELFIE_FAIL.en);
    }
    const prefs = loadPrefs();
    savePrefs({ ...prefs, lastCutId: data.cut.id });
    saveBrief(data);
    router.push("/brief");
  }

  function onFile(next: File | undefined) {
    setFile(next ?? null);
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return next ? URL.createObjectURL(next) : "";
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError(SELFIE_NEED);
      return;
    }
    setPending(true);
    setError(null);
    try {
      await send(await blobToJpegBase64(file));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : undefined;
      setError(withFollowUp(resolveAlert(message, SELFIE_FAIL), SELFIE_AGAIN));
      setPending(false);
    }
  }

  async function useSample() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/fixtures/selfie-sample.png");
      if (!response.ok) {
        setError(SELFIE_SAMPLE);
        setPending(false);
        return;
      }
      await send(await blobToJpegBase64(await response.blob()));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : undefined;
      setError(withFollowUp(resolveAlert(message, SELFIE_FAIL), SELFIE_AGAIN));
      setPending(false);
    }
  }

  return (
    <main className="page-form">
      <h1 className="hero-title">
        {copy.title} <span lang={yue ? "en" : "zh-HK"}>{copy.other}</span>
      </h1>
      <p className="hero-yue">
        {copy.privacy}
        <span lang={yue ? "en" : "zh-HK"} className="mt-1 block">
          {yue ? COPY.en.privacy : COPY.yue.privacy}
        </span>
      </p>
      <form className="mt-6 flex flex-col gap-3" lang={yue ? "zh-HK" : "en"} onSubmit={onSubmit}>
        <input
          className="sr-only"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => onFile(event.currentTarget.files?.[0])}
        />
        <button
          type="button"
          className="cta cta-ink"
          onClick={(event) => {
            const input = event.currentTarget.form?.elements.namedItem("photo");
            if (input instanceof HTMLInputElement) input.click();
          }}
        >
          {yue ? "揀相" : "Choose photo"} <span lang={yue ? "en" : "zh-HK"}>{yue ? "Choose photo" : "揀相"}</span>
        </button>
        {file ? <p className="note">{file.name}</p> : null}
        {preview ? (
          // Blob preview from the file the visitor just picked.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" width={120} height={160} className="cut-photo" style={{ width: 120 }} />
        ) : null}
        {error ? <BilingualAlert copy={error} yue={yue} /> : null}
        <button type="submit" className="cta cta-yellow" disabled={pending} aria-disabled={pending}>
          {pending ? (
            <>
              Reading… <span lang="zh-HK">讀緊…</span>
            </>
          ) : (
            <>
              Read photo <span lang="zh-HK">睇相</span>
            </>
          )}
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
    <button type="button" className="cta cta-line" disabled={pending} aria-disabled={pending} onClick={onUse}>
      {label}
    </button>
  );
}
