import { useMediaQuery, useTheme } from "@material-ui/core";

// calculate page size for responsive layout and minimized CLS
export function useGuessPreloadHeight(
  minMaxArray: number[],
  halveHeight?: boolean
) {
  const [min, max] = minMaxArray;
  const theme = useTheme();
  const pageIsWide = useMediaQuery(theme.breakpoints.up("xl"));
  let preloadHeight = pageIsWide ? max : min;
  if (halveHeight) preloadHeight /= 2;

  return preloadHeight;
}
