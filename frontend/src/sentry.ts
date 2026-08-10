import * as Sentry from '@sentry/react'

const NOISE_PATTERNS = [
  'ResizeObserver loop',
  'Loading chunk',
  'Failed to fetch dynamically imported module',
  'Non-Error exception captured',
  'ChunkLoadError',
  'Script error.',
]

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_DEPLOY_CONTEXT,
    tracesSampleRate: 0,
    beforeSend(event) {
      const message = event.exception?.values?.[0]?.value ?? ''
      if (NOISE_PATTERNS.some((p) => message.includes(p))) return null
      return event
    },
  })
}
