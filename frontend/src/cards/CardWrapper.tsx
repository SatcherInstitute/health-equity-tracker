import { CircularProgress } from '@mui/material'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import type {
  MetricQuery,
  MetricQueryResponse,
} from '../data/query/MetricQuery'
import { WithMetadataAndMetrics } from '../data/react/WithLoadingOrErrorUI'
import type { DemographicGroup } from '../data/utils/Constants'
import type { MapOfDatasetMetadata } from '../data/utils/DatasetTypes'
import { getGeographiesDatasetId } from '../data/utils/datasetutils'
import type { Fips } from '../data/utils/Fips'
import { useCompareMode } from '../reports/CompareModeContext'
import { reportProviderSteps } from '../reports/ReportProviderSteps'
import { hasEnoughDataForInsight } from '../utils/generateVisualizationInsight'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import { cardQueryResponsesAtom } from '../utils/sharedSettingsState'
import { getChartTitleId } from './ChartTitle'
import CardOptionsMenu from './ui/CardOptionsMenu'
import InsightVisualizationButton from './ui/InsightVisualizationButton'
import InsightVisualizationCard from './ui/InsightVisualizationCard'
import { Sources } from './ui/Sources'

// Publishes this card's queryResponses to the shared atom so the row-level
// contrast insight can consume them without re-fetching.
function CardQueryResponsesWriter({
  cacheKey,
  queryResponses,
}: {
  cacheKey: string
  queryResponses: MetricQueryResponse[]
}) {
  const setCardQueryResponses = useSetAtom(cardQueryResponsesAtom)
  useEffect(() => {
    setCardQueryResponses((prev) => ({ ...prev, [cacheKey]: queryResponses }))
  }, [cacheKey, queryResponses, setCardQueryResponses])
  return null
}

function CardWrapper(props: {
  // prevent layout shift as component loads
  minHeight?: number
  downloadTitle: string
  infoPopover?: React.ReactNode
  hideFooter?: boolean
  hideNH?: boolean
  queries: MetricQuery[]
  loadGeographies?: boolean
  children: (
    queryResponses: MetricQueryResponse[],
    metadata: MapOfDatasetMetadata,
    geoData?: Record<string, any>,
    overrideCardHasData?: (value: boolean) => void,
  ) => React.ReactNode
  isCensusNotAcs?: boolean
  scrollToHash: ScrollableHashId
  reportTitle: string
  expanded?: boolean
  isCompareCard?: boolean
  className?: string
  hasIntersectionalAllCompareBar?: boolean
  // Card-scoped values used to generate an AI insight for this specific card.
  // Required for cards that participate in insight generation.
  fips?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  // The demographic group currently highlighted on a map. Steers the insight
  // prompt so it leads with that group's story.
  activeDemographicGroup?: DemographicGroup
  // The subset of groups the user has focused a trend chart on (via the legend).
  // Filters the insight data so it describes only the visible lines.
  selectedGroups?: DemographicGroup[]
}) {
  const loadingComponent = (
    <div
      className={`relative m-2 flex justify-center rounded bg-alt-white p-3 shadow-raised ${props.className}`}
      style={{ minHeight: props.minHeight }}
    >
      <CircularProgress aria-label='loading' />
    </div>
  )

  const insightProps =
    props.fips && props.dataTypeConfig && props.demographicType
      ? {
          fips: props.fips,
          dataTypeConfig: props.dataTypeConfig,
          demographicType: props.demographicType,
          isCompareCard: props.isCompareCard,
          activeDemographicGroup: props.activeDemographicGroup,
          selectedGroups: props.selectedGroups,
        }
      : null

  // In compare mode, the per-card insight UI is hidden — the row-level contrast
  // insight takes over. Sourced from context, not `props.isCompareCard`, because
  // the policy page passes `isCompareCard={false}` outside any real compare context.
  const inCompareMode = useCompareMode()

  // Cache key for cardQueryResponsesAtom — same shape as cardInsightsAtom so
  // ContrastInsightSection can compute it from the same inputs.
  const cardDataCacheKey = insightProps
    ? `${props.scrollToHash}-${insightProps.dataTypeConfig.dataTypeId}-${insightProps.fips.code}-${insightProps.demographicType}${insightProps.isCompareCard ? '-2' : ''}`
    : null

  return (
    <WithMetadataAndMetrics
      geographiesDataset={
        props.loadGeographies && props.fips
          ? getGeographiesDatasetId(props.fips)
          : undefined
      }
      loadingComponent={loadingComponent}
      queries={props.queries ?? []}
    >
      {(metadata, queryResponses, geoData) => {
        // Default: check if any query has non-missing data for its metrics
        let cardHasData = queryResponses.some(
          (response, i) =>
            !response.shouldShowMissingDataMessage(
              (props.queries ?? [])[i]?.metricIds ?? [],
            ),
        )

        // Evaluate children first so cards can override via overrideCardHasData
        const overrideCardHasData = (value: boolean) => {
          cardHasData = value
        }
        const childContent = props.children(
          queryResponses,
          metadata,
          geoData,
          overrideCardHasData,
        )

        // Only offer a per-card insight when there are at least two values to compare.
        // A single group or region has no disparity to describe.
        const showInsight =
          insightProps != null &&
          !inCompareMode &&
          hasEnoughDataForInsight(
            props.scrollToHash,
            insightProps.dataTypeConfig,
            insightProps.demographicType,
            queryResponses,
            insightProps.selectedGroups,
          )

        // In compare mode, show the sparkle only for sections that have a ContrastInsightSection.
        const showContrastInsightButton =
          inCompareMode &&
          cardHasData &&
          insightProps != null &&
          (reportProviderSteps[props.scrollToHash]?.hasContrastSection ?? false)

        return (
          <article
            aria-labelledby={getChartTitleId(
              props.scrollToHash,
              props.isCompareCard,
            )}
            className={`relative m-2 rounded-sm bg-alt-white p-3 shadow-raised ${props.className}`}
          >
            {cardDataCacheKey && (
              <CardQueryResponsesWriter
                cacheKey={cardDataCacheKey}
                queryResponses={queryResponses}
              />
            )}
            <div className='absolute top-2 right-2 flex items-center'>
              {(showInsight || showContrastInsightButton) && insightProps && (
                <InsightVisualizationButton
                  scrollToHash={props.scrollToHash}
                  isCompareCard={insightProps.isCompareCard}
                />
              )}
              <CardOptionsMenu
                reportTitle={props.reportTitle}
                scrollToHash={props.scrollToHash}
              />
            </div>
            <div className='pt-8'>
              {showInsight && insightProps && (
                <InsightVisualizationCard
                  scrollToHash={props.scrollToHash}
                  queryResponses={queryResponses}
                  {...insightProps}
                />
              )}
              {childContent}
            </div>
            {!props.hideFooter && props.queries && (
              <Sources
                isCensusNotAcs={props.isCensusNotAcs}
                metadata={metadata}
                hideNH={props.hideNH}
                queryResponses={queryResponses}
                showDefinition={props.scrollToHash === 'rate-map'}
                isCompareCard={props.isCompareCard}
                hasIntersectionalAllCompareBar={
                  props.hasIntersectionalAllCompareBar
                }
              />
            )}
          </article>
        )
      }}
    </WithMetadataAndMetrics>
  )
}

export default CardWrapper
