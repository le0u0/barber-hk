import { headers } from "next/headers";

export async function QaStrip() {
  const sha = (await headers()).get("x-deploy-sha");
  if (!sha) return null;

  return (
    <p data-deploy-sha={sha} className="qa-strip">
      QA {sha}
    </p>
  );
}
