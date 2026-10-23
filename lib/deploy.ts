export function deploySha(env: Record<string, string | undefined> = process.env): string {
  return env.VERCEL_GIT_COMMIT_SHA || env.GITHUB_SHA || "local";
}
