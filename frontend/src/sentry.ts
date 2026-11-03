import * as Sentry from '@sentry/react'

const NOISE_PATTERNS = [
  'ResizeObserver loop',
  'Loading chunk',
  'Failed to fetch dynamically imported module',
  // Safari's wording for the same stale-chunk failure after a deploy
  'Importing a module script failed',
  'Non-Error exception captured',
  'ChunkLoadError',
  'Script error.',
]

export function isNoise(message: string): boolean {
  return NOISE_PATTERNS.some((p) => message.includes(p))
}

const PRELOAD_RELOAD_KEY = 'het-preload-reload-at'
const PRELOAD_RELOAD_COOLDOWN_MS = 60_000

// A tab opened before a deploy requests chunk hashes that no longer exist.
// Reload once to pick up the new index.html; the cooldown stops a reload loop
// if the chunk is genuinely unavailable. The event is deliberately not
// prevented: that would resolve the import to undefined and make React.lazy
// throw a different, unfiltered error before the reload lands.
export function handlePreloadError(
  getStorage: () => Storage = () => sessionStorage,
  reload: () => void = () => window.location.reload(),
): void {
  try {
    const storage = getStorage()
    const lastReload = Number(storage.getItem(PRELOAD_RELOAD_KEY) ?? 0)
    if (Date.now() - lastReload < PRELOAD_RELOAD_COOLDOWN_MS) return
    storage.setItem(PRELOAD_RELOAD_KEY, String(Date.now()))
  } catch {
    // Without storage there is no way to bound retries across reloads, and an
    // unbounded reload loop is worse than the single failed chunk.
    return
  }
  reload()
}

window.addEventListener('vite:preloadError', () => handlePreloadError())

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_DEPLOY_CONTEXT,
    tracesSampleRate: 0,
    beforeSend(event) {
      const message = event.exception?.values?.[0]?.value ?? ''
      if (isNoise(message)) return null
      return event
    },
  })
}
