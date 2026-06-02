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
