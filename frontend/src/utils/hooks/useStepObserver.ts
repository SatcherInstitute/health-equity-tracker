import { getDefaultStore } from 'jotai'
import { useEffect, useRef, useState } from 'react'
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

  function handleInteraction() {
    // any time the user interacts, cancel pending automated scrolling
    setRecentlyClicked(null)
  }

  useEffect(() => {
    // if user scrolls or clicks, go back to tracking scroll position in the table of contents
    function watchScroll() {
      window.addEventListener('wheel', handleInteraction)
      window.addEventListener('pointerdown', handleInteraction)
      window.addEventListener('keydown', handleInteraction)
    }
    watchScroll()
    return () => {
      window.removeEventListener('wheel', handleInteraction)
      window.removeEventListener('pointerdown', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }
  })

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
  const isKnownStep =
    Boolean(hashLink) && stepIds.includes(hashId as ScrollableHashId)

  useEffect(() => {
    // updates to the URL or available stepIds results in recalculated focus for the Table of Contents

    if (isKnownStep) {
      setActiveId(hashId)
      setRecentlyClicked(hashId as ScrollableHashId)
    }
  }, [location?.hash, stepIds])

  useScrollToHash(isKnownStep ? hashId : null)

  return [activeId, setRecentlyClicked] as const
}
