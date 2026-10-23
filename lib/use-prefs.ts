"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_PREFS, invalidatePrefs, loadPrefs, PREFS_EVENT, type Prefs } from "./prefs";

function subscribe(onStoreChange: () => void) {
  const handler = () => {
    invalidatePrefs();
    onStoreChange();
  };
  window.addEventListener(PREFS_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(PREFS_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, loadPrefs, () => EMPTY_PREFS);
}
