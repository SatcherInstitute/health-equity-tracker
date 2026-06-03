import { useAtomValue, useSetAtom } from 'jotai'
import { lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { STATUS } from 'react-joyride-react-19' // TODO: ideally revert back to react-joyride and not this temporary fork
import { useLocation } from 'react-router'
import {
  type DropdownVarId,
  isDropdownVarId,
} from '../../data/config/DropDownIds'
import { METRIC_CONFIG } from '../../data/config/MetricConfig'
import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import { INCARCERATION_IDS } from '../../data/providers/IncarcerationProvider'
import ReportProvider from '../../reports/ReportProvider'
import { LIFELINE_IDS } from '../../reports/ui/LifelineAlert'
import { srSpeak } from '../../utils/a11yutils'
import { urlMap } from '../../utils/externalUrls'
import useDeprecatedParamRedirects from '../../utils/hooks/useDeprecatedParamRedirects'
import { useHeaderScrollMargin } from '../../utils/hooks/useHeaderScrollMargin'
import {
  getMadLibPhraseText,
  getSelectedConditions,
  MADLIB_LIST,
  type MadLib,
  type MadLibId,
  type PhraseSelections,
} from '../../utils/MadLibs'
import { locationAtom, urlParamAtom } from '../../utils/sharedSettingsState'
import {
  DATA_TYPE_1_PARAM,
  DATA_TYPE_2_PARAM,
  MADLIB_PHRASE_PARAM,
  MADLIB_SELECTIONS_PARAM,
  MAP2_GROUP_PARAM,
  parseMls,
  SHOW_ONBOARDING_PARAM,
  stringifyMls,
} from '../../utils/urlutils'
import CHLPMapsModal from './CHLPMapsModal'
import DefaultHelperBox from './DefaultHelperBox'
import MadLibUI from './MadLibUI'
import TopicInfoModal from './TopicInfoModal'
import VoteDotOrgModal from './VoteDotOrgModal'

const Onboarding = lazy(async () => await import('./Onboarding'))

const EXPLORE_DATA_ID = 'main'

function ExploreDataPage() {
  const location: any = useLocation()
  const [showVoteDotOrgBanner, setShowVoteDotOrgBanner] = useState(false)
  const [showCHLPMapsBanner, setshowCHLPMapsBanner] = useState(false)
  const [showIncarceratedChildrenAlert, setShowIncarceratedChildrenAlert] =
    useState(false)

  const setLocationAtom = useSetAtom(locationAtom)
  const onboardParam = useAtomValue(urlParamAtom(SHOW_ONBOARDING_PARAM))

  // Deprecated param redirects fire once on mount via useLayoutEffect
  useDeprecatedParamRedirects()

  // madLib is derived from URL atoms — never owned state.
  // Components re-render only when mls or mlp actually changes.
  const mlsParam = useAtomValue(urlParamAtom(MADLIB_SELECTIONS_PARAM))
  const mlpParam = useAtomValue(urlParamAtom(MADLIB_PHRASE_PARAM))

  const madLib = useMemo<MadLib>(() => {
    const index = MADLIB_LIST.findIndex((el) => el.id === mlpParam)
    const idx = index !== -1 ? index : 0
    const selections: PhraseSelections = mlsParam
      ? parseMls(mlsParam)
      : MADLIB_LIST[idx].defaultSelections
    return { ...MADLIB_LIST[idx], activeSelections: selections }
  }, [mlsParam, mlpParam])

  const showStickyLifeline = LIFELINE_IDS.some(
    (id) =>
      id === (madLib.activeSelections[1] as DropdownVarId) ||
      id === (madLib.activeSelections[3] as DropdownVarId),
  )

  const noTopicChosen = getSelectedConditions(madLib)?.length === 0

  // Single write path for all MadLib URL changes.
  // Builds the complete new search string and calls pushState once.
  // dtOverrides lets callers set dt1/dt2 in the same write:
  //   { dt1: 'hiv_prevalence' } — set to value
  //   { dt1: '' }              — clear (topic changed)
  //   omit key                 — keep current URL value
  const setMadLibWithParam = useCallback(
    (ml: MadLib, dtOverrides?: { dt1?: string; dt2?: string }) => {
      const var1HasDataTypes =
        isDropdownVarId(ml.activeSelections[1]) &&
        METRIC_CONFIG[ml.activeSelections[1]]?.length > 1
      const var2HasDataTypes =
        ml.id === 'comparevars' &&
        isDropdownVarId(ml.activeSelections[3]) &&
        METRIC_CONFIG[ml.activeSelections[3]]?.length > 1

      // Preserve all existing params (extremes, atl, onboard, etc.),
      // then only set or delete what actually changes.
      const next = new URLSearchParams(window.location.search)

      const dtParam1 =
        dtOverrides?.dt1 !== undefined
          ? dtOverrides.dt1
          : (next.get(DATA_TYPE_1_PARAM) ?? '')
      const dtParam2 =
        dtOverrides?.dt2 !== undefined
          ? dtOverrides.dt2
          : (next.get(DATA_TYPE_2_PARAM) ?? '')

      next.set(MADLIB_SELECTIONS_PARAM, stringifyMls(ml.activeSelections))
      next.set(MADLIB_PHRASE_PARAM, ml.id)

      if (ml.id === 'disparity') next.delete(MAP2_GROUP_PARAM)

      if (var1HasDataTypes) {
        const defaultDt1 =
          METRIC_CONFIG[ml.activeSelections[1] as DropdownVarId]?.[0]
            ?.dataTypeId ?? ''
        next.set(DATA_TYPE_1_PARAM, dtParam1 || defaultDt1)
      } else {
        next.delete(DATA_TYPE_1_PARAM)
      }

      if (var2HasDataTypes) {
        const defaultDt2 =
          METRIC_CONFIG[ml.activeSelections[3] as DropdownVarId]?.[0]
            ?.dataTypeId ?? ''
        next.set(DATA_TYPE_2_PARAM, dtParam2 || defaultDt2)
      } else {
        next.delete(DATA_TYPE_2_PARAM)
      }

      setLocationAtom({ searchParams: next })
    },
    [setLocationAtom],
  )

  const showOnboarding =
    noTopicChosen && onboardParam === 'true' && location.hash === ''

  const [activelyOnboarding, setActivelyOnboarding] =
    useState<boolean>(showOnboarding)
  const onboardingCallback = (data: any) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status)) {
      setActivelyOnboarding(false)
      setLocationAtom((prev) => {
        const next = new URLSearchParams(prev.searchParams)
        next.set(SHOW_ONBOARDING_PARAM, 'false')
        return { ...prev, searchParams: next }
      })
    }
  }

  // Set up sticky madlib behavior
  const [isSticking, setIsSticking] = useState<boolean>(false)
  const madlibRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      // https://stackoverflow.com/a/61115077/7902371
      const observer = new IntersectionObserver(
        ([e]) => setIsSticking(e.intersectionRatio < 1),
        {
          rootMargin: '-1px 0px 0px 0px',
          threshold: [1],
        },
      )

      observer.observe(node)
    }
  }, [])
  const isStickyEnabled = !noTopicChosen && isSticking

  const isSingleColumn = madLib.id === 'disparity'

  function handleModeChange(mode: MadLibId) {
    const var1 = madLib.activeSelections[1]
    const geo1 =
      madLib.id === 'comparevars'
        ? madLib.activeSelections[5]
        : madLib.activeSelections[3]

    const var2: DropdownVarId =
      var1 === 'poverty' ? 'health_insurance' : 'poverty'
    const geo2 = geo1 === '00' ? '13' : '00'

    const updatedSelections: PhraseSelections =
      mode === 'comparegeos'
        ? { 1: var1, 3: geo1, 5: geo2 }
        : mode === 'comparevars'
          ? { 1: var1, 3: var2, 5: geo1 }
          : { 1: var1, 3: geo1 }

    const var1HasDataTypes =
      isDropdownVarId(var1) && METRIC_CONFIG[var1]?.length > 1

    // Preserve all existing params (extremes, atl, group1, demo, etc.),
    // then only set or delete what actually changes with the mode switch.
    const next = new URLSearchParams(window.location.search)
    next.set(MADLIB_SELECTIONS_PARAM, stringifyMls(updatedSelections))
    next.set(MADLIB_PHRASE_PARAM, mode)
    if (mode === 'disparity') next.delete(MAP2_GROUP_PARAM)
    next.delete(DATA_TYPE_2_PARAM)
    if (!var1HasDataTypes) next.delete(DATA_TYPE_1_PARAM)

    setLocationAtom({ searchParams: next })
    location.hash = ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* on any changes to the madlib settings */
  useEffect(() => {
    srSpeak(`Now viewing report: ${getMadLibPhraseText(madLib)}`)
    setShowVoteDotOrgBanner(
      getSelectedConditions(madLib)?.some((condition: DataTypeConfig) =>
        [
          'voter_participation',
          'women_in_state_legislature',
          'women_in_us_congress',
        ].includes(condition?.dataTypeId),
      ),
    )

    setshowCHLPMapsBanner(
      getSelectedConditions(madLib)?.some(
        (condition: DataTypeConfig) => condition.categoryId === 'hiv',
      ),
    )

    setShowIncarceratedChildrenAlert(
      getSelectedConditions(madLib)?.some((condition: DataTypeConfig) =>
        INCARCERATION_IDS.includes(condition?.dataTypeId),
      ),
    )
  }, [madLib])

  const headerScrollMargin = useHeaderScrollMargin(
    'madlib-container',
    isStickyEnabled,
    [
      madLib,
      showIncarceratedChildrenAlert,
      showStickyLifeline,
      showVoteDotOrgBanner,
      showCHLPMapsBanner,
    ],
  )

  return (
    <>
      {/* Conditional Modals */}
      <TopicInfoModal />
      <VoteDotOrgModal />
      <CHLPMapsModal />
      <Onboarding
        callback={onboardingCallback}
        activelyOnboarding={activelyOnboarding}
      />

      <div
        id={EXPLORE_DATA_ID}
        tabIndex={-1}
        className={'h-full bg-explore-bg-color'}
      >
        <div
          ref={madlibRef}
          className={`z-sticky-mad-lib mb-1 bg-alt-white p-4 shadow-raised-tighter md:top-0 md:w-full ${!noTopicChosen ? 'md:sticky' : ''} `}
          id='madlib-container'
        >
          <MadLibUI madLib={madLib} setMadLibWithParam={setMadLibWithParam} />

          {showStickyLifeline && isStickyEnabled && (
            <p className='flex justify-center'>
              <a href={urlMap.lifeline}>988lifeline.org</a>
            </p>
          )}
        </div>
        <div className='w-full pt-0'>
          {noTopicChosen ? (
            <DefaultHelperBox />
          ) : (
            <ReportProvider
              isSingleColumn={isSingleColumn}
              madLib={madLib}
              handleModeChange={handleModeChange}
              selectedConditions={getSelectedConditions(madLib)}
              showLifeLineAlert={showStickyLifeline}
              showIncarceratedChildrenAlert={showIncarceratedChildrenAlert}
              showVoteDotOrgBanner={showVoteDotOrgBanner}
              showCHLPMapsBanner={showCHLPMapsBanner}
              setMadLib={setMadLibWithParam}
              isScrolledToTop={!isSticking}
              headerScrollMargin={headerScrollMargin}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default ExploreDataPage
