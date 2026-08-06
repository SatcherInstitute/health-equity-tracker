import { getDefaultStore } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { activeHashIdAtom } from '../sharedSettingsState'
import { useScrollToHash } from './useScrollToHash'

export type ScrollableHashId =
  | 'rate-map'
  | 'rates-over-time'
  | 'rate-chart'
  | 'unknown-demographic-map'
  | 'inequities-over-time'
  | 'population-vs-distribution'
  | 'data-table'
  | 'age-adjusted-ratios'
  | 'definitions-missing-data'
  | 'multimap-modal'

export function useStepObserver(
  stepIds: ScrollableHashId[],
  isScrolledToTop: boolean,
) {
  const location = useLocation()

  const observer = useRef<IntersectionObserver | null>(null)
  const [activeId, setActiveId] = useState('')
  const [recentlyClicked, setRecentlyClicked] =
    useState<ScrollableHashId | null>(null)

  const handleInteraction = useCallback(() => {
    setRecentlyClicked(null)
  }, [])

  useEffect(() => {
    window.addEventListener('wheel', handleInteraction)
    window.addEventListener('pointerdown', handleInteraction)
    window.addEventListener('keydown', handleInteraction)
    return () => {
      window.removeEventListener('wheel', handleInteraction)
      window.removeEventListener('pointerdown', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }
  }, [handleInteraction])

  useEffect(() => {
    const store = getDefaultStore()

    const handleObserver = (entries: any) => {
      entries.forEach((entry: any) => {
        // when page is scrolled to the top, don't track scroll position and remove any hash
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
          // prefer a recently clicked id, otherwise set to the observed "in view" id
          const preferredId = recentlyClicked ?? entry.target.id
          setActiveId(preferredId)
          // Passive scroll-spy: keep the URL hash in sync with the visible section
          // so copying the URL after scrolling still deep-links to the right card.
          // Only fires when the user is scrolling freely (not during a programmatic
          // settle triggered by a click or deep link).
          if (!recentlyClicked && preferredId) {
            if (window.location.hash !== `#${preferredId}`) {
              window.history.replaceState(undefined, '', `#${preferredId}`)
            }
            store.set(activeHashIdAtom, preferredId)
          }
        }
      })
    }

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: '-20% 0% -35% 0px',
    })

    const elements = stepIds
      .map((stepId) => {
        const stepElem = document.getElementById(stepId)
        return stepElem
      })
      .filter((el) => el !== undefined)

    elements.forEach((elem) => elem && observer.current?.observe(elem))
    return () => observer.current?.disconnect()
  }, [stepIds, recentlyClicked, isScrolledToTop])

  const hashLink = location?.hash
  const hashId = hashLink.substring(1) || ''
  const isScrollableHashId = (id: string): id is ScrollableHashId =>
    (stepIds as string[]).includes(id)
  const isKnownStep = Boolean(hashLink) && isScrollableHashId(hashId)

  useEffect(() => {
    if (isKnownStep && isScrollableHashId(hashId)) {
      setActiveId(hashId)
      setRecentlyClicked(hashId)
      getDefaultStore().set(activeHashIdAtom, hashId)
    }
  }, [location?.hash, stepIds])

  useScrollToHash(isKnownStep ? hashId : null)

  return [activeId, setRecentlyClicked] as const
}
