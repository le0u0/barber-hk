"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChairPair } from "@/app/chair-pair";
import styles from "@/app/chair.module.css";
import { chairError, joinCopy, selfieCopy } from "@/lib/chair-copy";
import { chairStyle } from "@/lib/chair-tokens";
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
    <main className={styles.screen} data-chair="selfie" style={chairStyle()}>
      <h1 className={styles.title}>
        <ChairPair copy={selfieCopy.title} lang={lang} />
      </h1>
      <p className={styles.lede}>
        <ChairPair copy={selfieCopy.privacy} lang={lang} />
      </p>
      <p className={styles.note}>
        <code>fixtures/selfie-sample.png</code>
      </p>
      <form className={styles.form} lang={lang === "yue" ? "zh-HK" : "en"} onSubmit={onSubmit}>
        <label className={styles.file}>
          <ChairPair copy={selfieCopy.photo} lang={lang} />
          <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required />
        </label>
        {error ? (
          <p role="alert" className={styles.alert}>
            {error}
          </p>
        ) : null}
        <button type="submit" className={styles.primary} disabled={pending}>
          <ChairPair copy={pending ? selfieCopy.pending : selfieCopy.submit} lang={lang} />
        </button>
        <button type="button" className={styles.line} disabled={pending} onClick={useSample}>
          <ChairPair copy={selfieCopy.sample} lang={lang} />
        </button>
      </form>
    </main>
  );
}
