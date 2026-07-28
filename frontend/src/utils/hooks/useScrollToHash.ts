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
    target.scrollIntoView({
      behavior: animating ? 'smooth' : 'instant',
      block: 'start',
    })
  }

  // only when the goal itself moves, never merely because we are partway to it,
  // so an in-flight animation is not restarted on every observation
  const correctIfGoalMoved = () => {
    const goal = measureGoal()
    if (Math.abs(goal - lastGoal) < POSITION_EPSILON_PX) return
    lastGoal = goal
    scroll()
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
    observer.disconnect()
    styleObserver.disconnect()
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

  // body, html and #root are all pinned to the viewport height in this app, so
  // they never report content growth. The wrappers between the target and the
  // root are the elements that actually resize when a card above the target
  // finishes loading, so the whole ancestor chain is observed.
  observer.observe(target)
  for (
    let ancestor = target.parentElement;
    ancestor;
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

  return stop
}

export function useScrollToHash(hashId: string | null) {
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!hashId) return
    return scrollToHashTarget(hashId, { smooth: !prefersReducedMotion })
  }, [hashId, prefersReducedMotion])
}
