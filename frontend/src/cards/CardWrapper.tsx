import { AutoAwesome } from '@mui/icons-material'
import { CircularProgress } from '@mui/material'
import { useAtomValue } from 'jotai'
import type {
  MetricQuery,
  MetricQueryResponse,
} from '../data/query/MetricQuery'
import { WithMetadataAndMetrics } from '../data/react/WithLoadingOrErrorUI'
import type { MapOfDatasetMetadata } from '../data/utils/DatasetTypes'
import { SHOW_INSIGHT_GENERATION } from '../featureFlags'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import {
  cardInsightOpenAtom,
  cardInsightsAtom,
  selectedDataTypeConfig1Atom,
  selectedDemographicTypeAtom,
  selectedFipsAtom,
} from '../utils/sharedSettingsState'
import CardOptionsMenu from './ui/CardOptionsMenu'
import InsightVisualizationButton from './ui/InsightVisualizationButton'
import InsightVisualizationCard from './ui/InsightVisualizationCard'
import { Sources } from './ui/Sources'

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
    setHasData?: (hasData: boolean) => void,
  ) => React.ReactNode
  isCensusNotAcs?: boolean
  scrollToHash: ScrollableHashId
  reportTitle: string
  expanded?: boolean
  isCompareCard?: boolean
  className?: string
  hasIntersectionalAllCompareBar?: boolean
}) {
  const cardInsights = useAtomValue(cardInsightsAtom)
  const dataTypeConfig = useAtomValue(selectedDataTypeConfig1Atom)
  const fips = useAtomValue(selectedFipsAtom)
  const demographicType = useAtomValue(selectedDemographicTypeAtom)
  const isInsightOpen =
    useAtomValue(cardInsightOpenAtom)[props.scrollToHash] ?? false
  const cacheKey = `${props.scrollToHash}-${dataTypeConfig?.dataTypeId ?? ''}-${fips?.code ?? ''}-${demographicType ?? ''}`
  const hasInsight =
    SHOW_INSIGHT_GENERATION && isInsightOpen && Boolean(cardInsights[cacheKey])

  const loadingComponent = (
    <div
      className={`relative m-2 flex justify-center rounded bg-white p-3 shadow-raised ${props.className}`}
      style={{ minHeight: props.minHeight }}
      tabIndex={-1}
    >
      <CircularProgress aria-label='loading' />
    </div>
  )

  return (
    <WithMetadataAndMetrics
      loadGeographies={props.loadGeographies}
      loadingComponent={loadingComponent}
      queries={props.queries ?? []}
    >
      {(metadata, queryResponses, geoData) => {
        // Default: check if any query has non-missing data for its metrics
        let hasData = queryResponses.some(
          (response, i) =>
            !response.shouldShowMissingDataMessage(
              props.queries[i]?.metricIds ?? [],
            ),
        )

        // Evaluate children first so cards can override via setHasData
        const setHasData = (value: boolean) => {
          hasData = value
        }
        const childContent = props.children(
          queryResponses,
          metadata,
          geoData,
          setHasData,
        )

        return (
          <article
            className={`relative m-2 rounded-sm bg-white p-3 shadow-raised ${props.className}`}
          >
            {hasInsight && (
              <span className='absolute mb-1 flex items-center gap-1 p-3 font-semibold text-alt-green text-smallest uppercase tracking-wide'>
                <AutoAwesome fontSize='small' />
                AI Insight
              </span>
            )}
            <InsightVisualizationButton
              scrollToHash={props.scrollToHash}
              hasData={hasData}
            />
            <CardOptionsMenu
              reportTitle={props.reportTitle}
              scrollToHash={props.scrollToHash}
            />
            <InsightVisualizationCard
              scrollToHash={props.scrollToHash}
              queryResponses={queryResponses}
            />
            {childContent}
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
