import { CircularProgress } from '@mui/material'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import type {
  MetricQuery,
  MetricQueryResponse,
} from '../data/query/MetricQuery'
import { WithMetadataAndMetrics } from '../data/react/WithLoadingOrErrorUI'
import type { MapOfDatasetMetadata } from '../data/utils/DatasetTypes'
import type { Fips } from '../data/utils/Fips'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
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
}) {
  const loadingComponent = (
    <div
      className={`relative m-2 flex justify-center rounded bg-alt-white p-3 shadow-raised ${props.className}`}
      style={{ minHeight: props.minHeight }}
      tabIndex={-1}
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
        }
      : null

  return (
    <WithMetadataAndMetrics
      loadGeographies={props.loadGeographies}
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

        return (
          <article
            className={`relative m-2 rounded-sm bg-alt-white p-3 shadow-raised ${props.className}`}
          >
            <div className='absolute top-2 right-2 flex items-center'>
              {cardHasData && insightProps && (
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
              {insightProps && (
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
