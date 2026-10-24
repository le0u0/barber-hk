import { describe, expect, it } from "vitest";
import { launchedFromHomeScreen } from "./home-screen";

describe("launchedFromHomeScreen", () => {
  it("is false in a normal browser tab", () => {
    expect(launchedFromHomeScreen({ displayModeStandalone: false, iosNavigatorStandalone: false })).toBe(false);
  });

  it("is true when the display mode is standalone", () => {
    expect(launchedFromHomeScreen({ displayModeStandalone: true, iosNavigatorStandalone: false })).toBe(true);
  });

  it("is true when iOS reports navigator.standalone", () => {
    expect(launchedFromHomeScreen({ displayModeStandalone: false, iosNavigatorStandalone: true })).toBe(true);
  });
});
