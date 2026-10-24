export function launchedFromHomeScreen(input: {
  displayModeStandalone: boolean;
  iosNavigatorStandalone: boolean;
}): boolean {
  return input.displayModeStandalone || input.iosNavigatorStandalone;
}
