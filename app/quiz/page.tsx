"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChairPair } from "@/app/chair-pair";
import { chairError, joinCopy, quizCopy, quizQuestions } from "@/lib/chair-copy";
import { chairOptionStyle, chairPrimaryStyle, chairStyle, chairTokens } from "@/lib/chair-tokens";
import { BRIEF_KEY, isQuiz, savePrefs } from "@/lib/prefs";
import { useChairPaint } from "@/lib/use-chair-paint";
import { usePrefs } from "@/lib/use-prefs";
import type { BriefResponse, QuizAnswers } from "@/lib/types";

export default function QuizPage() {
  const router = useRouter();
  const prefs = usePrefs();
  useChairPaint();
  const lang = prefs.lang;
  const [draft, setDraft] = useState<Partial<QuizAnswers> | null>(null);
  const answers = draft ?? prefs.quiz ?? {};
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isQuiz(answers)) {
      setError(joinCopy(quizCopy.incomplete));
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
        throw new Error(data.error || joinCopy(quizCopy.fail));
      }
      savePrefs({ ...prefs, quiz: answers, lastCutId: data.cut.id });
      sessionStorage.setItem(BRIEF_KEY, JSON.stringify(data));
      router.push("/brief");
    } catch (caught) {
      setError(chairError(caught, quizCopy.fail));
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6" data-chair="quiz" style={chairStyle()}>
      <h1 className="text-3xl font-bold tracking-tight">
        <ChairPair copy={quizCopy.title} lang={lang} />
      </h1>
      <p className="text-base leading-normal">
        <ChairPair copy={quizCopy.lede} lang={lang} />
      </p>
      <form className="flex flex-col gap-5" lang={lang === "yue" ? "zh-HK" : "en"} noValidate onSubmit={onSubmit}>
        {quizQuestions.map((question) => (
          <fieldset key={question.key} className="flex min-w-0 flex-col gap-2 border-0 p-0">
            <legend className="px-0 font-bold">
              <ChairPair copy={question.legend} lang={lang} />
            </legend>
            {question.options.map((option) => {
              const selected = answers[question.key] === option.value;
              return (
                <label key={option.value} className="flex cursor-pointer items-center gap-3 px-3" style={chairOptionStyle(selected)}>
                  <input
                    type="radio"
                    name={question.key}
                    value={option.value}
                    checked={selected}
                    style={{ accentColor: chairTokens.vermillion, width: 20, height: 20 }}
                    onChange={() =>
                      setDraft((current) => ({
                        ...(current ?? prefs.quiz ?? {}),
                        [question.key]: option.value,
                      }))
                    }
                  />
                  <ChairPair copy={option.label} lang={lang} />
                </label>
              );
            })}
          </fieldset>
        ))}
        {error ? (
          <p role="alert" className="font-bold" style={{ color: chairTokens.vermillion }}>
            {error}
          </p>
        ) : null}
        <button type="submit" className="w-full px-3 py-2 text-base font-bold disabled:opacity-50" style={chairPrimaryStyle()} disabled={pending}>
          <ChairPair copy={pending ? quizCopy.pending : quizCopy.submit} lang={lang} />
        </button>
      </form>
    </main>
  );
}
