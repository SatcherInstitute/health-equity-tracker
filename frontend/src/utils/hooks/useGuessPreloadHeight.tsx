import { useIsBreakpointAndUp } from './useIsBreakpointAndUp'

// calculate page size for responsive layout and minimized CLS
export function useGuessPreloadHeight(
  minMaxArray: number[],
  halveHeight?: boolean,
) {
  const [min, max] = minMaxArray
  const isXl = useIsBreakpointAndUp('xl')
  let preloadHeight = isXl ? max : min
  if (halveHeight) preloadHeight /= 2

  return preloadHeight
}
