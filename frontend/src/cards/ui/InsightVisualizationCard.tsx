import { Button, CircularProgress } from '@mui/material'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useReducer } from 'react'
import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import type { DemographicGroup } from '../../data/utils/Constants'
import type { Fips } from '../../data/utils/Fips'
import { FLAGS } from '../../featureFlags'
import HetHighlightedText from '../../styles/HetComponents/HetHighlightedText'
import type {
  InsightDataStatus,
  InsightPeerConfig,
  PeerComparison,
} from '../../utils/generateVisualizationInsight'
import {
  buildInsightFocusSuffix,
  generateCardInsight,
  summarizePeerComparison,
} from '../../utils/generateVisualizationInsight'
import { getDataManager } from '../../utils/globals'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import { parseSingleInsight } from '../../utils/insightPayload'
import {
  cardInsightOpenAtom,
  cardInsightsAtom,
} from '../../utils/sharedSettingsState'
import FlagInsightButton from './FlagInsightButton'

// One status at a time, so the render is a switch rather than a chain of
// independent booleans that can contradict each other.
export type InsightStatus =
  | 'idle'
  | 'loadingPeers'
  | 'peersErrored'
  | 'peersInsufficient'
  | 'generating'
  | 'errored'
  | 'unavailable'

export interface InsightState {
  status: InsightStatus
  // Peer ranking for single-region maps. Null until it resolves, and always null
  // in the modes that never fetch one.
  peerComparison: PeerComparison | null
  error: string | null
  // The exact server cache key used, captured so the flag button targets this insight.
  serverCacheKey: string | null
}

type InsightAction =
  | { type: 'reset' }
  | { type: 'peersRequested' }
  | { type: 'peersLoaded'; peerComparison: PeerComparison }
  | { type: 'peersInsufficient' }
  | { type: 'peersFailed' }
  | { type: 'generationStarted' }
  | { type: 'generationSucceeded'; serverCacheKey: string | null }
  | { type: 'generationFailed'; serverCacheKey: string | null; error: string }
  | { type: 'generationUnavailable'; serverCacheKey: string | null }

export const initialInsightState: InsightState = {
  status: 'idle',
  peerComparison: null,
  error: null,
  serverCacheKey: null,
}

export function insightReducer(
  state: InsightState,
  action: InsightAction,
): InsightState {
  switch (action.type) {
    case 'reset':
      // Clears the terminal states that would block generation for the new cache
      // key, plus the cache key itself so FlagInsightButton cannot submit the
      // previous insight's key. peerComparison is deliberately kept: it is scoped
      // to the region, not the cache key, and the peer effect only refetches when
      // peerQueryKey changes, so clearing it here would strand peer-mode cards
      // with no way to reload.
      return {
        ...state,
        status:
          state.status === 'errored' || state.status === 'unavailable'
            ? 'idle'
            : state.status,
        error: null,
        serverCacheKey: null,
      }
    case 'peersRequested':
      return { ...state, status: 'loadingPeers', peerComparison: null }
    case 'peersLoaded':
      return { ...state, status: 'idle', peerComparison: action.peerComparison }
    case 'peersInsufficient':
      return { ...state, status: 'peersInsufficient', peerComparison: null }
    case 'peersFailed':
      return { ...state, status: 'peersErrored', peerComparison: null }
    case 'generationStarted':
      return { ...state, status: 'generating', error: null }
    case 'generationSucceeded':
      return { ...state, status: 'idle', serverCacheKey: action.serverCacheKey }
    case 'generationFailed':
      return {
        ...state,
        status: 'errored',
        error: action.error,
        serverCacheKey: action.serverCacheKey,
      }
    case 'generationUnavailable':
      return {
        ...state,
        status: 'unavailable',
        serverCacheKey: action.serverCacheKey,
      }
  }
}

interface InsightVisualizationCardProps {
  scrollToHash: ScrollableHashId
  queryResponses: MetricQueryResponse[]
  fips: Fips
  dataTypeConfig: DataTypeConfig
  demographicType: DemographicType
  isCompareCard?: boolean
  activeDemographicGroup?: DemographicGroup
  selectedGroups?: DemographicGroup[]
  // How much comparison this insight has to work with (see getInsightDataStatus).
  dataStatus: InsightDataStatus
  // Supplied for single-region maps: lets this card lazily fetch the region's
  // same-level peers and rank against them instead of hiding.
  peerConfig?: InsightPeerConfig
  // The selected region's own overall rate, resolved by CardWrapper.
  regionRate?: { label: string; value: number; shortLabel: string }
}

export default function InsightVisualizationCard({
  scrollToHash,
  queryResponses,
  fips,
  dataTypeConfig,
  demographicType,
  isCompareCard,
  activeDemographicGroup,
  selectedGroups,
  dataStatus,
  peerConfig,
  regionRate,
}: InsightVisualizationCardProps) {
  const [cardInsights, setCardInsights] = useAtom(cardInsightsAtom)
  const openKey = `${scrollToHash}${isCompareCard ? '-2' : ''}`
  const isOpen = useAtomValue(cardInsightOpenAtom)[openKey] ?? false
  const [state, dispatch] = useReducer(insightReducer, initialInsightState)
  const { status, peerComparison, serverCacheKey } = state

  // Single-region maps rank the region against its same-level peers. The peer
  // file is fetched here, lazily, and only once the insight is actually opened —
  // so multi-region maps and unopened insights never trigger the extra load.
  const peerMode =
    dataStatus === 'single-region' && Boolean(peerConfig) && Boolean(regionRate)
  // Controlled fetch (not useMetrics): the shared hook retains its prior value
  // across query-array changes, so toggling the query on open left it stuck on
  // the stale empty result. Loading the peer query directly through the
  // DataManager (LRU-cached) gives an explicit, reliable loading→ready state.
  const peerQueryKey = peerConfig?.peerQuery.getUniqueKey()
  useEffect(() => {
    if (!(peerMode && isOpen && peerConfig && regionRate)) return
    let cancelled = false
    dispatch({ type: 'peersRequested' })
    getDataManager()
      .loadMetrics(peerConfig.peerQuery)
      .then((response: MetricQueryResponse) => {
        if (cancelled) return
        const comparison: PeerComparison = {
          regionLabel: regionRate.label,
          regionValue: regionRate.value,
          peerNoun: peerConfig.peerNoun,
          peerValues: peerConfig.getPeerValues([response]),
          shortLabel: regionRate.shortLabel,
        }
        // Peers loaded, but too few report the measure to rank against honestly.
        if (summarizePeerComparison(comparison) === null) {
          dispatch({ type: 'peersInsufficient' })
        } else {
          dispatch({ type: 'peersLoaded', peerComparison: comparison })
        }
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'peersFailed' })
      })
    return () => {
      cancelled = true
    }
    // peerConfig.peerQuery is a fresh object each render; peerQueryKey identifies it.
  }, [peerMode, isOpen, peerQueryKey])

  // A stable suffix so the insight regenerates when the user changes which
  // group(s) the chart is focused on (highlighted map group / selected trend
  // legend lines) — those change the data the model sees. This in-session memo
  // key is read before a prompt exists, so it describes the view rather than
  // hashing the prompt the way the server key does.
  const focusSuffix = buildInsightFocusSuffix({
    activeDemographicGroup,
    selectedGroups,
  })
  const cacheKey = `${scrollToHash}-${dataTypeConfig.dataTypeId}-${fips.code}-${demographicType}${isCompareCard ? '-2' : ''}${focusSuffix ? `-${focusSuffix}` : ''}`
  const insight = cardInsights[cacheKey]

  const handleGenerate = useCallback(async () => {
    dispatch({ type: 'generationStarted' })
    try {
      const result = await generateCardInsight(
        scrollToHash,
        dataTypeConfig,
        demographicType,
        fips,
        queryResponses,
        isCompareCard,
        {
          activeDemographicGroup,
          selectedGroups,
          peerComparison: peerComparison ?? undefined,
        },
      )
      const resultCacheKey = result.cacheKey ?? null
      if (result.rateLimited) {
        dispatch({
          type: 'generationFailed',
          serverCacheKey: resultCacheKey,
          error: 'Too many requests. Please wait a moment and try again.',
        })
      } else if (result.unavailable) {
        dispatch({
          type: 'generationUnavailable',
          serverCacheKey: resultCacheKey,
        })
      } else if (result.error) {
        dispatch({
          type: 'generationFailed',
          serverCacheKey: resultCacheKey,
          error: 'Unable to generate insight. Please try again.',
        })
      } else {
        setCardInsights((prev) => ({
          ...prev,
          [cacheKey]: parseSingleInsight(result.content),
        }))
        dispatch({
          type: 'generationSucceeded',
          serverCacheKey: resultCacheKey,
        })
      }
    } catch {
      // Without this the status would stay 'generating' forever and the card
      // would spin with no way back.
      dispatch({
        type: 'generationFailed',
        serverCacheKey: null,
        error: 'Unable to generate insight. Please try again.',
      })
    }
  }, [
    cacheKey,
    dataTypeConfig,
    demographicType,
    fips,
    isCompareCard,
    queryResponses,
    scrollToHash,
    setCardInsights,
    activeDemographicGroup,
    selectedGroups,
    peerComparison,
  ])

  const handleFlagged = () => {
    // Drop the cached insight so a fresh one regenerates in its place. Flagging records
    // the bad output for review but does not hide this data combination — clearing the
    // entry makes the auto-generate effect below fire again for a new insight.
    setCardInsights((prev) => {
      const next = { ...prev }
      delete next[cacheKey]
      return next
    })
  }

  // Reset error state when the cacheKey changes (user switched demographic,
  // fips, etc.) — otherwise stale state from old params would block generation
  // for the new ones.
  useEffect(() => {
    dispatch({ type: 'reset' })
  }, [cacheKey])

  // Only 'idle' generates: every other status is either already in flight or a
  // terminal state the user must act on, so a failed call is never auto-retried.
  // Clearing the insight (e.g. after flagging) re-fires this effect. In peer mode
  // a null comparison means peers are still loading, failed, or too sparse to
  // rank against, all of which must block generation.
  useEffect(() => {
    if (!isOpen || insight || status !== 'idle') return
    if (peerMode && !peerComparison) return
    void handleGenerate()
  }, [
    isOpen,
    insight,
    status,
    cacheKey,
    handleGenerate,
    peerMode,
    peerComparison,
  ])

  const renderBody = () => {
    switch (status) {
      case 'loadingPeers':
        return (
          <div className='flex items-center gap-2 py-1'>
            <CircularProgress size={14} className='shrink-0' />
            <p className='m-0 text-alt-dark text-small'>
              Gathering peer comparison data...
            </p>
          </div>
        )
      case 'generating':
        return (
          <div className='flex items-center gap-2 py-1'>
            <CircularProgress size={14} className='shrink-0' />
            <p className='m-0 text-alt-dark text-small'>
              Analyzing health equity data with AI...
            </p>
          </div>
        )
      case 'peersErrored':
        return (
          <p className='m-0 text-red-orange text-small'>
            Unable to load comparison data. Please try again later.
          </p>
        )
      case 'peersInsufficient':
        return (
          <p className='m-0 text-alt-dark text-small'>
            Not enough comparable places report this measure to generate an
            insight.
          </p>
        )
      case 'errored':
        return (
          <div className='flex flex-col gap-1'>
            <p className='m-0 text-red-orange text-small'>{state.error}</p>
            <Button size='small' onClick={handleGenerate}>
              Try again
            </Button>
          </div>
        )
      // Also the resting state after a successful generation, where the text is
      // read back out of the shared cache rather than held here.
      case 'idle':
        return insight ? (
          <>
            <p className='m-0 font-bold text-alt-dark leading-snug'>
              <HetHighlightedText section={insight} />
            </p>
            <p className='m-0 mt-2 text-alt-dark text-smallest'>
              AI-generated. Verify with chart data.{' '}
              <FlagInsightButton
                cacheKey={serverCacheKey ?? undefined}
                content={insight.text}
                topic={dataTypeConfig.dataTypeId}
                onFlagged={handleFlagged}
              />
            </p>
          </>
        ) : null
      case 'unavailable':
        return null
      default: {
        // Forces a compile error if a status is added without a case here.
        const unhandled: never = status
        return unhandled
      }
    }
  }

  // When generation is unavailable the section renders nothing at all, rather
  // than an empty container or an error the reader can do nothing about.
  if (
    !FLAGS.VITE_SHOW_INSIGHT_GENERATION ||
    !isOpen ||
    status === 'unavailable'
  ) {
    return null
  }

  return (
    <div
      role='status'
      className='mb-3 animate-expand-down rounded-md bg-footer-color p-3'
    >
      {renderBody()}
    </div>
  )
}
