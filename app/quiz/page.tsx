"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChairPair } from "@/app/chair-pair";
import styles from "@/app/chair.module.css";
import { chairError, joinCopy, quizCopy, quizQuestions } from "@/lib/chair-copy";
import { chairStyle } from "@/lib/chair-tokens";
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
    <main className={styles.screen} data-chair="quiz" style={chairStyle()}>
      <h1 className={styles.title}>
        <ChairPair copy={quizCopy.title} lang={lang} />
      </h1>
      <p className={styles.lede}>
        <ChairPair copy={quizCopy.lede} lang={lang} />
      </p>
      <form className={styles.form} lang={lang === "yue" ? "zh-HK" : "en"} onSubmit={onSubmit}>
        {quizQuestions.map((question) => (
          <fieldset key={question.key} className={styles.fieldset}>
            <legend className={styles.legend}>
              <ChairPair copy={question.legend} lang={lang} />
            </legend>
            {question.options.map((option) => (
              <label key={option.value} className={styles.option}>
                <input
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
                  required
                />
                <ChairPair copy={option.label} lang={lang} />
              </label>
            ))}
          </fieldset>
        ))}
        {error ? (
          <p role="alert" className={styles.alert}>
            {error}
          </p>
        ) : null}
        <button type="submit" className={styles.primary} disabled={pending}>
          <ChairPair copy={pending ? quizCopy.pending : quizCopy.submit} lang={lang} />
        </button>
      </form>
    </main>
  );
}
