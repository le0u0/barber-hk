import type { CSSProperties } from "react";

/**
 * Leo TOKENS for the quiz and selfie screens.
 * Canvas and ink are the chair ground and type. Vermillion is the accent.
 * MTR yellow is not a chair token.
 */
export const chairTokens = {
  canvas: "#F7F4EB",
  ink: "#0A0A0A",
  vermillion: "#C8102E",
  onVermillion: "#FFFFFF",
} as const;

export function chairStyle(): CSSProperties {
  return {
    background: chairTokens.canvas,
    color: chairTokens.ink,
    colorScheme: "light",
  };
}

export function chairOptionStyle(selected: boolean): CSSProperties {
  return {
    borderColor: selected
      ? chairTokens.vermillion
      : `color-mix(in srgb, ${chairTokens.ink} 22%, ${chairTokens.canvas})`,
    background: selected
      ? `color-mix(in srgb, ${chairTokens.vermillion} 10%, ${chairTokens.canvas})`
      : chairTokens.canvas,
    color: chairTokens.ink,
    minHeight: 44,
    borderRadius: 2,
    borderWidth: 2,
    borderStyle: "solid",
  };
}

export function chairPrimaryStyle(): CSSProperties {
  return {
    background: chairTokens.vermillion,
    color: chairTokens.onVermillion,
    borderColor: chairTokens.vermillion,
    minHeight: 44,
    borderRadius: 2,
    borderWidth: 2,
    borderStyle: "solid",
  };
}

export function chairLineStyle(): CSSProperties {
  return {
    background: "transparent",
    color: chairTokens.ink,
    borderColor: chairTokens.ink,
    minHeight: 44,
    borderRadius: 2,
    borderWidth: 2,
    borderStyle: "solid",
  };
}
