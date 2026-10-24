"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BriefView } from "@/app/brief-view";
import { QUIZ_FAIL, QUIZ_INCOMPLETE, apiErrorCopy, requestQuizBrief } from "@/lib/fallback-brief";
import { BRIEF_KEY, isQuiz, savePrefs } from "@/lib/prefs";
import { usePrefs } from "@/lib/use-prefs";
import type { BriefResponse, QuizAnswers } from "@/lib/types";

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
  const answers = draft ?? prefs.quiz ?? {};
  const [error, setError] = useState<{ en: string; yue: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [offlineBrief, setOfflineBrief] = useState<BriefResponse | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isQuiz(answers)) {
      setError(QUIZ_INCOMPLETE);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const data = await requestQuizBrief(answers, { onLine: navigator.onLine });
      savePrefs({ ...prefs, quiz: answers, lastCutId: data.cut.id });
      sessionStorage.setItem(BRIEF_KEY, JSON.stringify(data));
      if (data.fallbackReason === "offline") {
        setOfflineBrief(data);
        setPending(false);
        return;
      }
      router.push("/brief");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : undefined;
      setError(apiErrorCopy(message, QUIZ_FAIL));
      setPending(false);
    }
  }

  if (offlineBrief) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
        <h1 className="text-2xl font-semibold">Quiz 問卷</h1>
        <BriefView brief={offlineBrief} />
        <button type="button" className="border border-stone-900 px-3 py-2" onClick={() => setOfflineBrief(null)}>
          Change answers <span lang="zh-HK">改答案</span>
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
      <h1 className="text-2xl font-semibold">Quiz 問卷</h1>
      <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
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
            {error.en} <span lang="zh-HK">{error.yue}</span>
          </p>
        ) : null}
        <button type="submit" className="border border-stone-900 px-3 py-2 disabled:opacity-50" disabled={pending}>
          {pending ? "Making brief…" : "Show brief 出備忘"}
        </button>
      </form>
    </main>
  );
}
