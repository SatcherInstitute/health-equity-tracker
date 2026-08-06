import { getDefaultStore } from 'jotai'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { activeHashIdAtom } from '../sharedSettingsState'

beforeEach(() => {
  document.body.innerHTML = `
    <div id="rate-map"></div>
    <div id="data-table"></div>
  `
  window.history.replaceState(undefined, '', '/')
  getDefaultStore().set(activeHashIdAtom, null)
})

afterEach(() => {
  vi.clearAllMocks()
})

// Exercises the handleObserver logic extracted from useStepObserver directly,
// covering the three scroll-spy scenarios without needing a React render.

describe('scroll-spy handleObserver logic', () => {
  const store = getDefaultStore()

  function buildObserverCallback(
    isScrolledToTop: boolean,
    recentlyClicked: string | null,
    setActiveId: (id: string) => void,
  ) {
    return (entries: Partial<IntersectionObserverEntry>[]) => {
      for (const entry of entries) {
        if (isScrolledToTop) {
          setActiveId('')
          if (window.location.hash) {
            window.history.replaceState(
              '',
              document.title,
              window.location.pathname + window.location.search,
            )
            store.set(activeHashIdAtom, null)
          }
        } else if (entry?.isIntersecting) {
          const preferredId = recentlyClicked ?? (entry.target as Element).id
          setActiveId(preferredId)
          if (!recentlyClicked && preferredId) {
            if (window.location.hash !== `#${preferredId}`) {
              window.history.replaceState(undefined, '', `#${preferredId}`)
            }
            store.set(activeHashIdAtom, preferredId)
          }
        }
      }
    }
  }

  it('syncs URL hash and activeHashIdAtom when user scrolls freely', () => {
    const setActiveId = vi.fn()
    const cb = buildObserverCallback(false, null, setActiveId)

    cb([{ isIntersecting: true, target: document.getElementById('rate-map')! }])

    expect(window.location.hash).toBe('#rate-map')
    expect(store.get(activeHashIdAtom)).toBe('rate-map')
    expect(setActiveId).toHaveBeenCalledWith('rate-map')
  })

  it('clears URL hash and activeHashIdAtom when scrolled back to top', () => {
    window.history.replaceState(undefined, '', '#rate-map')
    store.set(activeHashIdAtom, 'rate-map')
    const setActiveId = vi.fn()
    const cb = buildObserverCallback(true, null, setActiveId)

    cb([{ isIntersecting: true, target: document.getElementById('rate-map')! }])

    expect(window.location.hash).toBe('')
    expect(store.get(activeHashIdAtom)).toBeNull()
    expect(setActiveId).toHaveBeenCalledWith('')
  })

  it('prefers recentlyClicked over the observed entry and skips URL write', () => {
    const setActiveId = vi.fn()
    const cb = buildObserverCallback(false, 'data-table', setActiveId)

    cb([{ isIntersecting: true, target: document.getElementById('rate-map')! }])

    expect(setActiveId).toHaveBeenCalledWith('data-table')
    expect(window.location.hash).toBe('')
    expect(store.get(activeHashIdAtom)).toBeNull()
  })
})
