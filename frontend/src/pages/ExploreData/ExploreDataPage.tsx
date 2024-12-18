import { useAtomValue } from 'jotai'
import { lazy, useCallback, useEffect, useState } from 'react'
import { STATUS } from 'react-joyride'
import { useLocation } from 'react-router-dom'
import {
  type DropdownVarId,
  isDropdownVarId,
} from '../../data/config/DropDownIds'
import { METRIC_CONFIG } from '../../data/config/MetricConfig'
import type {
  DataTypeConfig,
  DataTypeId,
} from '../../data/config/MetricConfigTypes'
import { INCARCERATION_IDS } from '../../data/providers/IncarcerationProvider'
import { ALL } from '../../data/utils/Constants'
import ReportProvider from '../../reports/ReportProvider'
import { LIFELINE_IDS } from '../../reports/ui/LifelineAlert'
import {
  MADLIB_LIST,
  type MadLib,
  type MadLibId,
  type PhraseSegment,
  type PhraseSelections,
  getMadLibPhraseText,
  getSelectedConditions,
} from '../../utils/MadLibs'
import { srSpeak } from '../../utils/a11yutils'
import { urlMap } from '../../utils/externalUrls'
import useDeprecatedParamRedirects from '../../utils/hooks/useDeprecatedParamRedirects'
import { useHeaderScrollMargin } from '../../utils/hooks/useHeaderScrollMargin'
import {
  selectedDataTypeConfig1Atom,
  selectedDataTypeConfig2Atom,
} from '../../utils/sharedSettingsState'
import {
  DATA_TYPE_1_PARAM,
  DATA_TYPE_2_PARAM,
  MADLIB_PHRASE_PARAM,
  MADLIB_SELECTIONS_PARAM,
  MAP1_GROUP_PARAM,
  MAP2_GROUP_PARAM,
  SHOW_ONBOARDING_PARAM,
  getParameter,
  parseMls,
  psSubscribe,
  setParameter,
  setParameters,
  stringifyMls,
} from '../../utils/urlutils'
import DefaultHelperBox from './DefaultHelperBox'
import MadLibUI from './MadLibUI'
import TopicInfoModal from './TopicInfoModal'
import VoteDotOrgModal from './VoteDotOrgModal'

const Onboarding = lazy(async () => await import('./Onboarding'))

const EXPLORE_DATA_ID = 'main'

interface ExploreDataPageProps {
  isMobile: boolean
}

function ExploreDataPage(props: ExploreDataPageProps) {
  const location: any = useLocation()
  const [showVoteDotOrgBanner, setShowVoteDotOrgBanner] = useState(false)
  const [showIncarceratedChildrenAlert, setShowIncarceratedChildrenAlert] =
    useState(false)

  const dtId1: DataTypeId | undefined = useAtomValue(
    selectedDataTypeConfig1Atom,
  )?.dataTypeId
  const dtId2: DataTypeId | undefined = useAtomValue(
    selectedDataTypeConfig2Atom,
  )?.dataTypeId
  const showStickyLifeline = LIFELINE_IDS.some(
    (id) => id === dtId1 || id === dtId2,
  )

  // Set up initial mad lib values based on defaults and query params, redirecting from deprecated ones
  const params = useDeprecatedParamRedirects()

  // swap out old variable ids for backwards compatibility of outside links
  const foundIndex = MADLIB_LIST.findIndex(
    (madlib) => madlib.id === params[MADLIB_PHRASE_PARAM],
  )
  const initialIndex = foundIndex !== -1 ? foundIndex : 0
  const defaultValuesWithOverrides = MADLIB_LIST[initialIndex].defaultSelections
  if (params[MADLIB_SELECTIONS_PARAM]) {
    params[MADLIB_SELECTIONS_PARAM].split(',').forEach((override) => {
      const [phraseSegmentIndex, value] = override.split(':')
      const phraseSegments: PhraseSegment[] = MADLIB_LIST[initialIndex].phrase
      if (
        Object.keys(phraseSegments).includes(phraseSegmentIndex) &&
        Object.keys(phraseSegments[Number(phraseSegmentIndex)]).includes(value)
      ) {
        defaultValuesWithOverrides[Number(phraseSegmentIndex)] = value
      }
    })
  }

  const [madLib, setMadLib] = useState<MadLib>({
    ...MADLIB_LIST[initialIndex],
    activeSelections: defaultValuesWithOverrides,
  })

  const noTopicChosen = getSelectedConditions(madLib)?.length === 0

  useEffect(() => {
    const readParams = () => {
      const index = getParameter(MADLIB_PHRASE_PARAM, 0, (str) => {
        return MADLIB_LIST.findIndex((element) => element.id === str)
      })
      const selection = getParameter(
        MADLIB_SELECTIONS_PARAM,
        MADLIB_LIST[index].defaultSelections,
        parseMls,
      )

      setMadLib({
        ...MADLIB_LIST[index],
        activeSelections: selection,
      })
    }
    const psSub = psSubscribe(readParams, 'explore')

    readParams()

    return () => {
      if (psSub) {
        psSub.unsubscribe()
      }
    }
  }, [])

  const setMadLibWithParam = (ml: MadLib) => {
    // ONLY SOME TOPICS HAVE SUB DATA TYPES
    const var1HasDataTypes =
      isDropdownVarId(ml.activeSelections[1]) &&
      METRIC_CONFIG[ml.activeSelections[1]]?.length > 1
    const var2HasDataTypes =
      ml.id === 'comparevars' &&
      isDropdownVarId(ml.activeSelections[3]) &&
      METRIC_CONFIG[ml.activeSelections[3]]?.length > 1

    // DELETE DATA TYPE PARAM FROM URL IF NEW TOPIC(S) HAVE NO SUB DATA TYPES
    if (!var1HasDataTypes || !var2HasDataTypes) {
      const params = new URLSearchParams(window.location.search)
      !var1HasDataTypes && params.delete(DATA_TYPE_1_PARAM)
      !var2HasDataTypes && params.delete(DATA_TYPE_2_PARAM)
      history.replaceState(null, '', '?' + params + window.location.hash)
    }

    //  GET REMAINING PARAMS FROM URL
    const groupParam1 = getParameter(MAP1_GROUP_PARAM, ALL)
    const groupParam2 = getParameter(MAP2_GROUP_PARAM, ALL)
    const dtParam1 = getParameter(DATA_TYPE_1_PARAM, '')
    const dtParam2 = getParameter(DATA_TYPE_2_PARAM, '')

    // BUILD REPLACEMENT PARAMS
    const newParams = [
      {
        name: MADLIB_SELECTIONS_PARAM,
        value: stringifyMls(ml.activeSelections),
      },
      {
        name: MAP1_GROUP_PARAM,
        value: groupParam1,
      },
    ]

    // EITHER COMPARE MODE SHOULD STORE MAP2 GROUP IN URL
    ml.id !== 'disparity' &&
      newParams.push({
        name: MAP2_GROUP_PARAM,
        value: groupParam2,
      })

    // ONLY STORE DATA TYPES IN URL WHEN NEEDED
    var1HasDataTypes &&
      newParams.push({
        name: DATA_TYPE_1_PARAM,
        value: dtParam1,
      })
    var2HasDataTypes &&
      newParams.push({
        name: DATA_TYPE_2_PARAM,
        value: dtParam2,
      })

    // UPDATE URL
    setParameters(newParams)

    // UPDATE GEO/TOPIC IN MADLIB
    setMadLib(ml)
  }

  // Set up warm welcome onboarding behaviors
  let showOnboarding = false
  if (noTopicChosen) {
    if (params?.[SHOW_ONBOARDING_PARAM] === 'true') {
      showOnboarding = true
    }
    if (params?.[SHOW_ONBOARDING_PARAM] === 'false') {
      showOnboarding = false
    }
  }

  // if there is an incoming #hash; bypass the warm welcome entirely
  if (location.hash !== '') showOnboarding = false

  const [activelyOnboarding, setActivelyOnboarding] =
    useState<boolean>(showOnboarding)
  const onboardingCallback = (data: any) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status)) {
      setActivelyOnboarding(false)
      setParameter(SHOW_ONBOARDING_PARAM, 'false')
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

  // calculate page size to determine if mobile or not
  const isSingleColumn = madLib.id === 'disparity'

  function handleModeChange(mode: MadLibId) {
    const modeIndexMap: Record<MadLibId, number> = {
      disparity: 0,
      comparegeos: 1,
      comparevars: 2,
    }

    const modeIndex = modeIndexMap[mode]

    // Extract values from the current madlib
    const var1 = madLib.activeSelections[1]

    const geo1 =
      madLib.id === 'comparevars'
        ? madLib.activeSelections[5]
        : madLib.activeSelections[3]

    // default non-duplicate settings for compare modes
    const var2: DropdownVarId =
      var1 === 'poverty' ? 'health_insurance' : 'poverty'
    const geo2 = geo1 === '00' ? '13' : '00' // default to US or Georgia

    // Construct UPDATED madlib based on the future mode's Madlib shape
    let updatedMadLib: PhraseSelections = { 1: var1, 3: geo1 } // disparity "Investigate Rates"
    if (modeIndex === 1) updatedMadLib = { 1: var1, 3: geo1, 5: geo2 } // comparegeos "Compare Rates"
    if (modeIndex === 2) updatedMadLib = { 1: var1, 3: var2, 5: geo1 } // comparevars "Explore Relationships"

    setMadLib({
      ...MADLIB_LIST[modeIndex],
      activeSelections: updatedMadLib,
    })
    setParameters([
      {
        name: MADLIB_SELECTIONS_PARAM,
        value: stringifyMls(updatedMadLib),
      },
      {
        name: MADLIB_PHRASE_PARAM,
        value: MADLIB_LIST[modeIndex].id,
      },
    ])
    location.hash = ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* on any changes to the madlib settings */
  useEffect(() => {
    // A11y - create then delete an invisible alert that the report mode has changed
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
    ],
  )

  return (
    <>
      {/* Conditional Modals */}
      <TopicInfoModal />
      <VoteDotOrgModal />
      <Onboarding
        callback={onboardingCallback}
        activelyOnboarding={activelyOnboarding}
      />

      <h2 className='sr-only'>{getMadLibPhraseText(madLib)}</h2>
      <div
        id={EXPLORE_DATA_ID}
        tabIndex={-1}
        className={'h-full bg-exploreBgColor'}
      >
        <div
          ref={madlibRef}
          className={`z-stickyMadLib mb-1 bg-white p-4 shadow-raised-tighter md:top-0 md:w-full ${!noTopicChosen ? 'md:sticky' : ''}
          `}
          id='madlib-container'
        >
          <MadLibUI madLib={madLib} setMadLibWithParam={setMadLibWithParam} />

          {showStickyLifeline && isStickyEnabled && (
            <p className='flex justify-center '>
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
              setMadLib={setMadLibWithParam}
              isScrolledToTop={!isSticking}
              headerScrollMargin={headerScrollMargin}
              isMobile={props.isMobile}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default ExploreDataPage
