"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { blobToJpegBase64 } from "@/lib/image-file";
import { BRIEF_KEY, loadPrefs, savePrefs } from "@/lib/prefs";
import type { BriefResponse } from "@/lib/types";

export default function SelfiePage() {
  const router = useRouter();
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
    if (!file) {
      setError("Choose a photo first. 請先揀相。");
      return;
    }
    setPending(true);
    setError("");
    try {
      await send(await blobToJpegBase64(file));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not read that photo.");
      setPending(false);
    }
  }

  async function useSample() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/fixtures/selfie-sample.png");
      if (!response.ok) throw new Error("Sample fixture missing.");
      await send(await blobToJpegBase64(await response.blob()));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not use the sample.");
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
            required
          />
        </label>
        {error ? (
          <p role="alert" className="alert text-sm">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn-primary disabled:opacity-50" disabled={pending}>
          {pending ? "Making brief…" : "Read photo 睇相"}
        </button>
        <button type="button" className="btn-quiet disabled:opacity-50" disabled={pending} onClick={useSample}>
          Use sample fixture
        </button>
      </form>
    </main>
  );
}
