"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FACE_CHART_COPY, isFaceShape, type FaceShapeId } from "@/lib/face-shape";
import { BRIEF_KEY, isQuiz, savePrefs } from "@/lib/prefs";
import { usePrefs } from "@/lib/use-prefs";
import type { BriefResponse, QuizAnswers } from "@/lib/types";
import { FaceChart } from "./face-chart";

const QUESTIONS: Array<{
  key: keyof QuizAnswers;
  legend: string;
  options: Array<[QuizAnswers[keyof QuizAnswers], string]>;
}> = [
  {
    key: "sides",
    legend: "Sides 兩側",
    options: [
      ["skin", "Skin fade 皮膚漸變"],
      ["taper", "Taper 短漸變"],
      ["scissor", "Scissor 用剪"],
    ],
  },
  {
    key: "top",
    legend: "Top 頂",
    options: [
      ["buzz", "Buzz 全短"],
      ["short", "Short 短"],
      ["medium", "Medium 中"],
      ["long", "Long 長"],
    ],
  },
  {
    key: "finish",
    legend: "Finish 造型",
    options: [
      ["textured", "Textured 抓碎"],
      ["sleek", "Sleek 貼服"],
      ["natural", "Natural 自然"],
    ],
  },
  {
    key: "part",
    legend: "Part 分線",
    options: [
      ["none", "None 不分"],
      ["side", "Side 側分"],
      ["middle", "Middle 中分"],
    ],
  },
];

export default function QuizPage() {
  const router = useRouter();
  const prefs = usePrefs();
  const [draft, setDraft] = useState<Partial<QuizAnswers> | null>(null);
  const [faceDraft, setFaceDraft] = useState<FaceShapeId | null>(null);
  const answers = draft ?? prefs.quiz ?? {};
  const faceShape = faceDraft ?? prefs.faceShape;
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function chooseFace(id: FaceShapeId) {
    setFaceDraft(id);
    savePrefs({ ...prefs, faceShape: id });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isFaceShape(faceShape)) {
      setError(`${FACE_CHART_COPY.needEn} ${FACE_CHART_COPY.needYue}`);
      return;
    }
    if (!isQuiz(answers)) {
      setError("Answer every question. 請答完四條。");
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "quiz", answers, faceShape }),
      });
      const data = (await response.json()) as BriefResponse & { error?: string };
      if (!response.ok || !data.brief) {
        throw new Error(data.error || "Could not make a brief.");
      }
      savePrefs({ ...prefs, quiz: answers, lastCutId: data.cut.id, faceShape });
      sessionStorage.setItem(BRIEF_KEY, JSON.stringify(data));
      router.push("/brief");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not make a brief.");
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
      <h1 className="text-2xl font-semibold">Quiz 問卷</h1>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <FaceChart value={faceShape} onChange={chooseFace} />
        {QUESTIONS.map((question) => (
          <fieldset key={question.key} className="border border-stone-300 p-3">
            <legend className="px-1 text-sm font-medium">{question.legend}</legend>
            <div className="flex flex-col gap-1">
              {question.options.map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={question.key}
                    value={value}
                    checked={answers[question.key] === value}
                    onChange={() =>
                      setDraft((current) => ({
                        ...(current ?? prefs.quiz ?? {}),
                        [question.key]: value,
                      }))
                    }
                    required
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        {error ? (
          <p role="alert" className="text-sm text-red-800">
            {error}
          </p>
        ) : null}
        <button type="submit" className="border border-stone-900 px-3 py-2 disabled:opacity-50" disabled={pending}>
          {pending ? "Making brief…" : "Show brief 出備忘"}
        </button>
      </form>
    </main>
  );
}
