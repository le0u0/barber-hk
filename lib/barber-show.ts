import type { BriefCopy } from "./types";

/** Bright ground for showing a cut to the barber. White stays readable in a shop. */
export const barberBright = {
  canvas: "#FFFFFF",
  ink: "#0A0A0A",
} as const;

export type Bilingual = { en: string; yue: string };

export const barberCopy = {
  open: { en: "Show barber", yue: "畀師傅睇" },
  close: { en: "Close", yue: "關閉" },
  fullscreen: { en: "Full screen", yue: "全螢幕" },
  stayOn: { en: "Screen stays on", yue: "螢幕保持光亮" },
  dim: { en: "Turn brightness up. The screen may dim.", yue: "螢幕可能會暗，請調光。" },
  title: { en: "For your barber", yue: "畀師傅睇" },
  reference: { en: "Reference diagram", yue: "參考圖" },
  note: { en: "East Asian hair note", yue: "東亞髮質" },
} as const satisfies Record<string, Bilingual>;

export type BarberLine = {
  label: Bilingual;
  text: Bilingual;
  emphasis?: boolean;
};

export type BarberCard = {
  id: string;
  nameEn: string;
  nameYue: string;
  image: string;
  lines?: BarberLine[];
  note?: string;
};

export type BarberShowStatus = {
  fullscreen: boolean;
  wakeLock: boolean;
};

export type WakeLockSentinelLike = {
  release: () => Promise<void>;
};

export type BarberControlStyle = {
  background: string;
  color: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: "solid";
  borderRadius: number;
  minHeight: number;
  minWidth: number;
};

const LINE_LABELS: Array<[keyof BriefCopy, Bilingual]> = [
  ["ask", { en: "Say this", yue: "照住講" }],
  ["sides", { en: "Sides", yue: "兩側" }],
  ["top", { en: "Top", yue: "頂" }],
  ["fringe", { en: "Fringe", yue: "劉海" }],
  ["finish", { en: "Finish", yue: "造型" }],
];

export function lead(lang: "en" | "yue", copy: Bilingual) {
  if (lang === "yue") {
    return {
      primary: copy.yue,
      primaryLang: "zh-HK" as const,
      secondary: copy.en,
      secondaryLang: "en" as const,
    };
  }
  return {
    primary: copy.en,
    primaryLang: "en" as const,
    secondary: copy.yue,
    secondaryLang: "zh-HK" as const,
  };
}

export function briefLines(brief: { en: BriefCopy; yue: BriefCopy }): BarberLine[] {
  return LINE_LABELS.map(([key, label]) => ({
    label,
    text: { en: brief.en[key], yue: brief.yue[key] },
    emphasis: key === "ask",
  }));
}

export function barberControlStyle(): BarberControlStyle {
  return {
    background: barberBright.canvas,
    color: barberBright.ink,
    borderColor: barberBright.ink,
    borderWidth: 2,
    borderStyle: "solid",
    borderRadius: 2,
    minHeight: 44,
    minWidth: 44,
  };
}

export function barberShowKeyAction(key: string): "close" | null {
  return key === "Escape" ? "close" : null;
}

type FullscreenTarget = {
  requestFullscreen?: () => Promise<void> | void;
};

type WakeLockHost = {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinelLike>;
  };
};

function attempt(run: () => Promise<void> | void): Promise<void> {
  try {
    return Promise.resolve(run());
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function startBarberShow(
  node: FullscreenTarget,
  host: WakeLockHost = typeof navigator === "undefined" ? {} : navigator,
): Promise<{ status: BarberShowStatus; sentinel: WakeLockSentinelLike | null }> {
  const fullscreenAttempt = node.requestFullscreen
    ? attempt(() => node.requestFullscreen!())
    : Promise.reject(new Error("fullscreen unavailable"));
  const wakeAttempt = host.wakeLock
    ? host.wakeLock.request("screen")
    : Promise.reject(new Error("wake lock unavailable"));

  const [fullscreen, wake] = await Promise.allSettled([fullscreenAttempt, wakeAttempt]);
  return {
    status: {
      fullscreen: fullscreen.status === "fulfilled",
      wakeLock: wake.status === "fulfilled",
    },
    sentinel: wake.status === "fulfilled" ? wake.value : null,
  };
}

async function exitFullscreen() {
  if (typeof document !== "undefined" && document.fullscreenElement) {
    await document.exitFullscreen();
  }
}

export async function endBarberShow(
  sentinel: WakeLockSentinelLike | null,
  exit: () => Promise<void> | void = exitFullscreen,
) {
  await Promise.allSettled([attempt(exit), sentinel ? sentinel.release() : Promise.resolve()]);
}
