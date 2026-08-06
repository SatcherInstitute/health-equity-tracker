import { getDefaultStore } from 'jotai'
import { useEffect } from 'react'
import { activeHashIdAtom } from '../sharedSettingsState'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

// A card's position keeps moving after the first scroll: HetLazyLoader swaps
// placeholder heights for real ones, and cards above the target grow as their
// queries resolve. Corrections are driven by observed layout change rather than
// a timer, and are not animated, so they read as the page settling rather than
// as the page chasing the reader.

const SETTLE_TIMEOUT_MS = 5_000
// scrollend is not in Safari yet; without a fallback the target would never
// become focusable and corrections would stay animated forever
const ANIMATION_FALLBACK_MS = 1_000
const POSITION_EPSILON_PX = 1
// coalesces a burst of near-simultaneous layout shifts (several cards finishing
// their queries within the same tick) into one correction, instead of
// restarting the scroll animation once per card
const CORRECTION_DEBOUNCE_MS = 120

interface ScrollToHashOptions {
  smooth?: boolean
}

// Only one hash scroll may be settling at a time. The wheel/pointerdown/keydown
// listeners below already cancel the previous scroll for anything the user
// clicks or types, but two calls made back to back with no interaction between
// them would otherwise both run until their own settle timeouts, and the
// abandoned one still focuses its target after the newer one has landed.
// Callers discard the returned stop(), so this has to be enforced here.
let cancelActiveScroll: (() => void) | null = null

export function scrollToHashTarget(
  hashId: string,
  options: ScrollToHashOptions = {},
): () => void {
  const target = document.getElementById(hashId)
  // a link to a target that isn't in the DOM is a no-op, so an in-flight
  // scroll toward a target that does exist should be left alone
  if (!target) return () => {}

  cancelActiveScroll?.()

  // single point of truth for "what section is currently targeted" and for
  // reflecting that in the URL — every scroll-to-anchor path in the app
  // (deep links, on-this-page menus, breadcrumbs, table of contents) calls
  // this function, so callers no longer need to do either themselves
  const store = getDefaultStore()
  if (store.get(activeHashIdAtom) !== hashId) {
    store.set(activeHashIdAtom, hashId)
  }
  if (window.location.hash !== `#${hashId}`) {
    window.history.replaceState(undefined, '', `#${hashId}`)
  }

  let animating = options.smooth ?? true
  let stopped = false

  // the scroll position this target wants, in document coordinates. Measured
  // against the document rather than the viewport so it stays constant while we
  // animate toward it, and it subtracts scroll-margin because the sticky header
  // grows when it starts sticking, which moves the goal without moving the card.
  const measureGoal = () => {
    const scrollMargin =
      Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0
    return target.getBoundingClientRect().top + window.scrollY - scrollMargin
  }

  let lastGoal = measureGoal()

  const scroll = () => {
    window.scrollTo({
      top: measureGoal(),
      behavior: animating ? 'smooth' : 'instant',
    })
  }

  let correctionTimer = 0
  // only when the goal itself moves, never merely because we are partway to it,
  // so an in-flight animation is not restarted on every observation. Debounced
  // so a burst of layout shifts from several cards loading together collapses
  // into one correction rather than restarting the scroll once per card.
  const correctIfGoalMoved = () => {
    window.clearTimeout(correctionTimer)
    correctionTimer = window.setTimeout(() => {
      const goal = measureGoal()
      if (Math.abs(goal - lastGoal) < POSITION_EPSILON_PX) return
      lastGoal = goal
      scroll()
    }, CORRECTION_DEBOUNCE_MS)
  }

  const observer = new ResizeObserver(correctIfGoalMoved)
  // scroll-margin is re-rendered as an inline style when the header starts
  // sticking, which no ResizeObserver would report
  const styleObserver = new MutationObserver(correctIfGoalMoved)
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
    if (cancelActiveScroll === stop) cancelActiveScroll = null
    observer.disconnect()
    styleObserver.disconnect()
    window.clearTimeout(settleTimer)
    window.clearTimeout(animationTimer)
    window.clearTimeout(correctionTimer)
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

  // body and html are pinned to the viewport height in this app and #root is
  // pinned to body, so none of them ever report content growth. Only the
  // wrappers between the target and #root resize when a card above the target
  // finishes loading, so the walk up the tree stops there instead of at <html>.
  observer.observe(target)
  for (
    let ancestor = target.parentElement;
    ancestor && ancestor.id !== 'root';
    ancestor = ancestor.parentElement
  ) {
    observer.observe(ancestor)
  }
  styleObserver.observe(target, {
    attributes: true,
    attributeFilter: ['style', 'class'],
  })

  window.addEventListener('wheel', stop, { passive: true })
  window.addEventListener('pointerdown', stop)
  window.addEventListener('keydown', stop)

  cancelActiveScroll = stop

  return stop
}

export function useScrollToHash(hashId: string | null) {
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!hashId) return
    return scrollToHashTarget(hashId, { smooth: !prefersReducedMotion })
  }, [hashId, prefersReducedMotion])
}
