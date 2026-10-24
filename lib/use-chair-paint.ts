"use client";

import { useEffect } from "react";
import { chairTokens } from "./chair-tokens";

/** Paint the quiz or selfie viewport with Leo canvas and ink. Restores on leave. */
export function useChairPaint() {
  useEffect(() => {
    const body = document.body;
    const previous = {
      background: body.style.background,
      color: body.style.color,
      colorScheme: body.style.colorScheme,
    };
    body.style.background = chairTokens.canvas;
    body.style.color = chairTokens.ink;
    body.style.colorScheme = "light";
    body.dataset.chair = "quiz-selfie";
    return () => {
      body.style.background = previous.background;
      body.style.color = previous.color;
      body.style.colorScheme = previous.colorScheme;
      delete body.dataset.chair;
    };
  }, []);
}
