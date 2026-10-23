export function isQaMode(value: string | null | undefined): boolean {
  return value === "1";
}

export function showSampleFixture(nodeEnv: string | undefined, qa: string | null | undefined): boolean {
  return nodeEnv === "development" || isQaMode(qa);
}
