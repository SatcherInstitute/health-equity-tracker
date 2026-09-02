import { INSIGHT_PREVIEW_PARAM_KEY } from './utils/urlutils'

const INSIGHT_PREVIEW_STORAGE_KEY = 'insightPreview'

// sessionStorage throws outright when cookies are fully blocked. This module is
// imported by CardWrapper and Report, so an uncaught throw at module scope
// white-screens the app for every visitor, not just one arming preview.
function readSessionFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

function writeSessionFlag(key: string, value: boolean) {
  try {
    if (value) sessionStorage.setItem(key, 'true')
    else sessionStorage.removeItem(key)
  } catch {
    // Preview stays off for this tab; nothing else depends on the write.
  }
}

// The param is stripped once read, rather than left in the URL, because
// setMadLibWithParam rebuilds the query string from a fixed allowlist on every
// mode change. Left in place it would silently disappear on the first mode
// switch while the feature stayed on, so the URL would stop describing the
// state. sessionStorage is the single source of truth instead, and links a
// reviewer copies or screenshots do not carry preview to anyone else.
export function armInsightPreview(): boolean {
  if (typeof window === 'undefined') return false

  const params = new URLSearchParams(window.location.search)

  if (params.get(INSIGHT_PREVIEW_PARAM_KEY) === '1') {
    writeSessionFlag(INSIGHT_PREVIEW_STORAGE_KEY, true)
    params.delete(INSIGHT_PREVIEW_PARAM_KEY)
    const query = params.toString()
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
    )
  }

  return readSessionFlag(INSIGHT_PREVIEW_STORAGE_KEY)
}

export function disarmInsightPreview() {
  writeSessionFlag(INSIGHT_PREVIEW_STORAGE_KEY, false)
  // SHOW_INSIGHT_GENERATION is resolved once at module scope, so the open
  // insight components only clear on a fresh evaluation.
  window.location.reload()
}

export const INSIGHT_PREVIEW_MODE = armInsightPreview()

// VITE_ vars are string-replaced into the bundle at build time and cannot change
// at runtime, so prod ships this permanently unset and preview supplies the
// per-tab override.
export const SHOW_INSIGHT_GENERATION = Boolean(
  import.meta.env.VITE_SHOW_INSIGHT_GENERATION || INSIGHT_PREVIEW_MODE,
)

export const SHOW_CORRELATION_CARD = import.meta.env.VITE_SHOW_CORRELATION_CARD
