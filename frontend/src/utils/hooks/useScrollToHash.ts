import { useEffect } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

// A card's position keeps moving after the first scroll: HetLazyLoader swaps
// placeholder heights for real ones, and cards above the target grow as their
// queries resolve. Corrections are driven by observed layout change rather than
// a timer, and are not animated, so they read as the page settling rather than
// as the page chasing the reader.

const SETTLE_TIMEOUT_MS = 15_000
// scrollend is not in Safari yet; without a fallback the target would never
// become focusable and corrections would stay animated forever
const ANIMATION_FALLBACK_MS = 1_000
const POSITION_EPSILON_PX = 1

interface ScrollToHashOptions {
  smooth?: boolean
}

export function scrollToHashTarget(
  hashId: string,
  options: ScrollToHashOptions = {},
): () => void {
  const target = document.getElementById(hashId)
  if (!target) return () => {}

  let animating = options.smooth ?? true
  let stopped = false

  // measured against the document, not the viewport, so it changes only when
  // layout shifts and not while we are scrolling toward the target
  const measureDocumentTop = () =>
    target.getBoundingClientRect().top + window.scrollY

  let lastDocumentTop = measureDocumentTop()

  const scroll = () => {
    target.scrollIntoView({
      behavior: animating ? 'smooth' : 'instant',
      block: 'start',
    })
  }

  const correctIfMoved = () => {
    const documentTop = measureDocumentTop()
    if (Math.abs(documentTop - lastDocumentTop) < POSITION_EPSILON_PX) return
    lastDocumentTop = documentTop
    scroll()
  }

  const observer = new ResizeObserver(correctIfMoved)
  const settleTimer = window.setTimeout(() => stop(), SETTLE_TIMEOUT_MS)
  let animationTimer = 0

  const endAnimation = () => {
    if (stopped || !animating) return
    animating = false
    window.clearTimeout(animationTimer)
    window.removeEventListener('scrollend', endAnimation)
    // keyboard and screen reader users otherwise stay at the top of the
    // document while the viewport moves without them
    target.focus({ preventScroll: true })
  }

  function stop() {
    if (stopped) return
    stopped = true
    observer.disconnect()
    window.clearTimeout(settleTimer)
    window.clearTimeout(animationTimer)
    window.removeEventListener('scrollend', endAnimation)
    window.removeEventListener('wheel', stop)
    window.removeEventListener('pointerdown', stop)
    window.removeEventListener('keydown', stop)
  }

  // the wrappers are plain divs; making the target programmatically focusable
  // here keeps every hash destination focusable without annotating each one
  if (!target.hasAttribute('tabindex')) target.tabIndex = -1

  scroll()

  if (animating) {
    window.addEventListener('scrollend', endAnimation)
    animationTimer = window.setTimeout(endAnimation, ANIMATION_FALLBACK_MS)
  } else {
    target.focus({ preventScroll: true })
  }

  // body catches cards above the target growing; the target itself catches its
  // own content resolving
  observer.observe(document.body)
  observer.observe(target)

  window.addEventListener('wheel', stop, { passive: true })
  window.addEventListener('pointerdown', stop)
  window.addEventListener('keydown', stop)

  return stop
}

export function useScrollToHash(hashId: string | null) {
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!hashId) return
    return scrollToHashTarget(hashId, { smooth: !prefersReducedMotion })
  }, [hashId, prefersReducedMotion])
}
