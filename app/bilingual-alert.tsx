import { leadRest, type Bilingual } from "@/lib/alert-copy";

export function BilingualAlert({
  copy,
  yue,
  role = "alert",
  className = "alert",
}: {
  copy: Bilingual;
  yue: boolean;
  role?: "alert" | "status";
  className?: string;
}) {
  const line = leadRest(copy, yue);
  return (
    <p role={role} className={className}>
      {line.lead} <span lang={line.restLang}>{line.rest}</span>
    </p>
  );
}
