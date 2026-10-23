"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { isQuiz, saveBrief, savePrefs } from "@/lib/prefs";
import { usePrefs } from "@/lib/use-prefs";
import type { BriefResponse, QuizAnswers } from "@/lib/types";

const QUESTIONS: Array<{
  key: keyof QuizAnswers;
  en: string;
  yue: string;
  options: Array<{ value: QuizAnswers[keyof QuizAnswers]; en: string; yue: string }>;
}> = [
  {
    key: "sides",
    en: "Sides",
    yue: "兩側",
    options: [
      { value: "skin", en: "Skin fade", yue: "皮膚漸變" },
      { value: "taper", en: "Taper", yue: "短漸變" },
      { value: "scissor", en: "Scissor", yue: "用剪" },
    ],
  },
  {
    key: "top",
    en: "Top",
    yue: "頂",
    options: [
      { value: "buzz", en: "Buzz", yue: "全短" },
      { value: "short", en: "Short", yue: "短" },
      { value: "medium", en: "Medium", yue: "中" },
      { value: "long", en: "Long", yue: "長" },
    ],
  },
  {
    key: "finish",
    en: "Finish",
    yue: "造型",
    options: [
      { value: "textured", en: "Textured", yue: "抓碎" },
      { value: "sleek", en: "Sleek", yue: "貼服" },
      { value: "natural", en: "Natural", yue: "自然" },
    ],
  },
  {
    key: "part",
    en: "Part",
    yue: "分線",
    options: [
      { value: "none", en: "None", yue: "不分" },
      { value: "side", en: "Side", yue: "側分" },
      { value: "middle", en: "Middle", yue: "中分" },
    ],
  },
];

const COPY = {
  en: {
    title: "Quiz",
    other: "問卷",
    incomplete: "Pick all four. 四題都要揀",
    fail: "Could not make a brief.",
    pending: "Making the brief…",
    submit: "Show brief",
  },
  yue: {
    title: "問卷",
    other: "Quiz",
    incomplete: "四題都要揀。Pick all four.",
    fail: "出唔到備忘。",
    pending: "寫緊備忘…",
    submit: "出備忘",
  },
} as const;

export default function QuizPage() {
  const router = useRouter();
  const prefs = usePrefs();
  const yue = prefs.lang === "yue";
  const copy = yue ? COPY.yue : COPY.en;
  const [draft, setDraft] = useState<Partial<QuizAnswers> | null>(null);
  const answers = draft ?? prefs.quiz ?? {};
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isQuiz(answers)) {
      setError(copy.incomplete);
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "quiz", answers }),
      });
      const data = (await response.json()) as BriefResponse & { error?: string };
      if (!response.ok || !data.brief) {
        throw new Error(data.error || copy.fail);
      }
      savePrefs({ ...prefs, quiz: answers, lastCutId: data.cut.id });
      saveBrief(data);
      router.push("/brief");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.fail);
      setPending(false);
    }
  }

  const lead = yue ? "yue" : "en";

  return (
    <main className="page-form">
      <h1 className="hero-title">
        {copy.title} <span lang={yue ? "en" : "zh-HK"}>{copy.other}</span>
      </h1>
      <p className="hero-yue">
        {yue ? "答四題出備忘" : "Answer four questions"}{" "}
        <span lang={yue ? "en" : "zh-HK"}>{yue ? "Answer four questions" : "答四題出備忘"}</span>
      </p>
      <form className="mt-6 flex flex-col gap-6" lang={yue ? "zh-HK" : "en"} onSubmit={onSubmit}>
        {QUESTIONS.map((question) => (
          <fieldset key={question.key} className="flex flex-col gap-2">
            <legend className="mb-1 font-bold">
              {lead === "yue" ? question.yue : question.en}{" "}
              <span className="pair-rest" lang={lead === "yue" ? "en" : "zh-HK"}>
                {lead === "yue" ? question.en : question.yue}
              </span>
            </legend>
            {question.options.map((option) => (
              <label key={option.value} className="option-row">
                <input
                  className="size-5 shrink-0"
                  type="radio"
                  name={question.key}
                  value={option.value}
                  checked={answers[question.key] === option.value}
                  onChange={() =>
                    setDraft((current) => ({
                      ...(current ?? prefs.quiz ?? {}),
                      [question.key]: option.value,
                    }))
                  }
                />
                <span className="font-bold">{lead === "yue" ? option.yue : option.en}</span>{" "}
                <span className="pair-rest" lang={lead === "yue" ? "en" : "zh-HK"}>
                  {lead === "yue" ? option.en : option.yue}
                </span>
              </label>
            ))}
          </fieldset>
        ))}
        {error ? (
          <p role="alert" className="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="cta cta-yellow" disabled={pending} aria-disabled={pending}>
          {pending ? (
            <>
              Building brief… <span lang="zh-HK">整緊備忘…</span>
            </>
          ) : (
            <>
              Show brief <span lang="zh-HK">出備忘</span>
            </>
          )}
        </button>
      </form>
    </main>
  );
}
