import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  barberBright,
  barberControlStyle,
  barberCopy,
  barberShowKeyAction,
  briefLines,
  endBarberShow,
  lead,
  startBarberShow,
} from "./barber-show";

const CJK = /[\u3400-\u9fff]/;
const YELLOW = /#ffd300|mtr-yellow/i;

const brief = {
  en: { ask: "Ask.", sides: "Sides.", top: "Top.", fringe: "Fringe.", finish: "Finish." },
  yue: { ask: "照住講。", sides: "兩側。", top: "頂。", fringe: "劉海。", finish: "造型。" },
};

describe("barber bright card", () => {
  it("uses a white ground and ink type, with no MTR yellow", () => {
    expect(barberBright).toEqual({ canvas: "#FFFFFF", ink: "#0A0A0A" });
    expect(barberControlStyle()).toMatchObject({
      background: "#FFFFFF",
      color: "#0A0A0A",
      minHeight: 44,
      borderRadius: 2,
    });

    const source = [
      "lib/barber-show.ts",
      "lib/use-barber-show.ts",
      "app/barber-show.tsx",
      "app/cut-board.tsx",
      "app/page.tsx",
      "app/brief/page.tsx",
    ]
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(source).not.toMatch(YELLOW);
    expect(source).not.toMatch(/three-quarter|swipe|carousel/i);
    expect(source).toContain("startBarberShow");
    expect(source).toContain("wakeLock");
  });

  it("keeps English and Cantonese on the card chrome", () => {
    for (const line of Object.values(barberCopy)) {
      expect(line.en.trim().length).toBeGreaterThan(0);
      expect(line.yue).toMatch(CJK);
    }
    expect(lead("yue", barberCopy.open).primary).toBe("畀師傅睇");
    expect(lead("en", barberCopy.close).secondary).toBe("關閉");
  });

  it("puts the line you say to the barber first, in both languages", () => {
    const lines = briefLines(brief);
    expect(lines.map((line) => line.label.en)).toEqual(["Say this", "Sides", "Top", "Fringe", "Finish"]);
    expect(lines[0]?.emphasis).toBe(true);
    expect(lines[0]?.text).toEqual({ en: "Ask.", yue: "照住講。" });
    expect(lines.every((line) => CJK.test(line.label.yue) && CJK.test(line.text.yue))).toBe(true);
  });

  it("closes on Escape", () => {
    expect(barberShowKeyAction("Escape")).toBe("close");
    expect(barberShowKeyAction("ArrowRight")).toBeNull();
  });
});

describe("startBarberShow", () => {
  it("asks for fullscreen and one screen wake lock", async () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    const release = vi.fn().mockResolvedValue(undefined);
    const request = vi.fn().mockResolvedValue({ release });
    const exit = vi.fn().mockResolvedValue(undefined);

    const result = await startBarberShow({ requestFullscreen }, { wakeLock: { request } });

    expect(requestFullscreen).toHaveBeenCalledOnce();
    expect(request).toHaveBeenCalledOnce();
    expect(request).toHaveBeenCalledWith("screen");
    expect(result.status).toEqual({ fullscreen: true, wakeLock: true });

    await endBarberShow(result.sentinel, exit);
    expect(exit).toHaveBeenCalledOnce();
    expect(release).toHaveBeenCalledOnce();
  });

  it("still opens when fullscreen and the wake lock are denied", async () => {
    const result = await startBarberShow(
      {
        requestFullscreen: () => Promise.reject(new Error("denied")),
      },
      {
        wakeLock: {
          request: () => Promise.reject(new Error("denied")),
        },
      },
    );

    expect(result.status).toEqual({ fullscreen: false, wakeLock: false });
    expect(result.sentinel).toBeNull();
    await expect(endBarberShow(null, () => {})).resolves.toBeUndefined();
  });

  it("reports a missing fullscreen API without throwing", async () => {
    const result = await startBarberShow({}, {});
    expect(result.status).toEqual({ fullscreen: false, wakeLock: false });
  });
});
