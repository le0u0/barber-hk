// @vitest-environment jsdom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { chairTokens } from "./chair-tokens";
import { useChairPaint } from "./use-chair-paint";

function Probe() {
  useChairPaint();
  return null;
}

function paintedColor(property: "backgroundColor" | "color") {
  return getComputedStyle(document.body)[property];
}

function expectedColor(hex: string, property: "backgroundColor" | "color") {
  const probe = document.createElement("div");
  probe.style[property] = hex;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe)[property];
  probe.remove();
  return value;
}

describe("useChairPaint", () => {
  let root: Root | null = null;
  let holder: HTMLDivElement | null = null;

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    holder?.remove();
    root = null;
    holder = null;
    document.body.style.background = "";
    document.body.style.color = "";
    document.body.style.colorScheme = "";
    delete document.body.dataset.chair;
  });

  it("paints the screen with Leo canvas and ink, then restores the previous ground", () => {
    document.body.style.background = "#f4efe6";
    document.body.style.color = "#1c1915";
    holder = document.createElement("div");
    document.body.appendChild(holder);
    root = createRoot(holder);

    act(() => {
      root?.render(createElement(Probe));
    });

    expect(paintedColor("backgroundColor")).toBe(expectedColor(chairTokens.canvas, "backgroundColor"));
    expect(paintedColor("color")).toBe(expectedColor(chairTokens.ink, "color"));
    expect(document.body.dataset.chair).toBe("quiz-selfie");
    expect(document.body.style.colorScheme).toBe("light");

    act(() => {
      root?.unmount();
    });
    root = null;

    expect(paintedColor("backgroundColor")).toBe(expectedColor("#f4efe6", "backgroundColor"));
    expect(paintedColor("color")).toBe(expectedColor("#1c1915", "color"));
    expect(document.body.dataset.chair).toBeUndefined();
  });
});
