import { headers } from "next/headers";

export async function QaStrip() {
  const sha = (await headers()).get("x-deploy-sha");
  if (!sha) return null;

  return (
    <p data-deploy-sha={sha} className="px-4 py-1 text-[11px] leading-tight text-stone-400">
      QA {sha}
    </p>
  );
}
