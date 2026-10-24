"use client";

import { useSyncExternalStore } from "react";
import { launchedFromHomeScreen } from "@/lib/home-screen";

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function installedNow() {
  const nav = navigator as Navigator & { standalone?: boolean };
  return launchedFromHomeScreen({
    displayModeStandalone: window.matchMedia("(display-mode: standalone)").matches,
    iosNavigatorStandalone: nav.standalone === true,
  });
}

export function AddToHome() {
  const installed = useSyncExternalStore(subscribe, installedNow, () => false);
  if (installed) return null;

  return (
    <p className="text-sm" data-add-to-home="">
      Add Barber HK to your home screen from the browser menu.{" "}
      <span lang="zh-HK">用瀏覽器選單加入主畫面。</span>
    </p>
  );
}
