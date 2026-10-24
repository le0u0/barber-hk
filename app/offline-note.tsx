"use client";

import { useSyncExternalStore } from "react";
import { OFFLINE_BANNER } from "@/lib/fallback-brief";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

export function useOnline(): boolean {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}

export function OfflineNote() {
  const online = useOnline();
  if (online) return null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4">
      <div role="status" className="border border-amber-700 bg-amber-50 p-3 text-sm">
        <p>{OFFLINE_BANNER.en}</p>
        <p lang="zh-HK">{OFFLINE_BANNER.yue}</p>
      </div>
    </div>
  );
}
