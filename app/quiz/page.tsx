"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { QUIZ, t } from "@/lib/i18n";
import { BRIEF_KEY, isQuiz, savePrefs } from "@/lib/prefs";
import { usePrefs } from "@/lib/use-prefs";
import type { BriefResponse, QuizAnswers } from "@/lib/types";

export default function QuizPage() {
  const router = useRouter();
  const prefs = usePrefs();
  const lang = prefs.lang;
  const [draft, setDraft] = useState<Partial<QuizAnswers> | null>(null);
  const answers = draft ?? prefs.quiz ?? {};
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isQuiz(answers)) {
      setError(t(lang, "quizIncomplete"));
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
        throw new Error(data.error || t(lang, "couldNotMake"));
      }
      savePrefs({ ...prefs, quiz: answers, lastCutId: data.cut.id });
      sessionStorage.setItem(BRIEF_KEY, JSON.stringify(data));
      router.push("/brief");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t(lang, "couldNotMake"));
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
      <h1 className="text-2xl font-semibold">{t(lang, "quiz")}</h1>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        {QUIZ.map((question) => (
          <fieldset key={question.key} className="border border-stone-300 p-3">
            <legend className="px-1 text-sm font-medium">{t(lang, question.legend)}</legend>
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
                  {t(lang, label)}
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
          {pending ? t(lang, "makingBrief") : t(lang, "showBrief")}
        </button>
      </form>
    </main>
  );
}
