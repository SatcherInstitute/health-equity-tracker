import { createContext, type ReactNode, useContext } from 'react'

/**
 * Tree-scoped flag for "this subtree is a side-by-side compare report."
 * Consumed by CardWrapper to suppress per-card insight UI in compare mode
 * (the row-level contrast insight takes over). Single-disparity reports
 * don't wrap their children, so the default `false` applies.
 *
 * A context (rather than a Jotai atom) avoids the first-render flicker that
 * a useEffect-driven atom write would cause.
 */
const CompareModeContext = createContext<boolean>(false)

export function CompareModeProvider({ children }: { children: ReactNode }) {
  return (
    <CompareModeContext.Provider value={true}>
      {children}
    </CompareModeContext.Provider>
  )
}

export function useCompareMode(): boolean {
  return useContext(CompareModeContext)
}

// A compare row whose sides cannot be contrasted (one side has no data for that
// card, e.g. state BJS beside county Vera history) renders no contrast section,
// so its cards must not offer the contrast insight button either.
const ContrastAvailableContext = createContext<boolean>(true)

export function ContrastAvailableProvider({
  available,
  children,
}: {
  available: boolean
  children: ReactNode
}) {
  return (
    <ContrastAvailableContext.Provider value={available}>
      {children}
    </ContrastAvailableContext.Provider>
  )
}

export function useContrastAvailable(): boolean {
  return useContext(ContrastAvailableContext)
}
