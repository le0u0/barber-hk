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
    "--chair-canvas": chairTokens.canvas,
    "--chair-ink": chairTokens.ink,
    "--chair-vermillion": chairTokens.vermillion,
    "--chair-on-vermillion": chairTokens.onVermillion,
  } as CSSProperties;
}
