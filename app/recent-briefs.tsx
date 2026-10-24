"use client";

import { useSyncExternalStore } from "react";
import { invalidateRecentBriefs, RECENT_BRIEFS_EVENT, recentBriefCount } from "@/lib/recent-briefs";

function subscribe(onStoreChange: () => void) {
  const handler = () => {
    invalidateRecentBriefs();
    onStoreChange();
  };
  window.addEventListener(RECENT_BRIEFS_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(RECENT_BRIEFS_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function RecentBriefs() {
  const count = useSyncExternalStore(subscribe, recentBriefCount, () => 0);

  return (
    <p className="text-sm" data-recent-brief-count={count}>
      Recent briefs <span lang="zh-HK">最近備忘</span>: {count}
    </p>
  );
}
