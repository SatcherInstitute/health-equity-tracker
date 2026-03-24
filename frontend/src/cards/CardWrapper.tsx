import { CircularProgress } from '@mui/material'
import type {
  MetricQuery,
  MetricQueryResponse
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
    knownData?: Record<string, any>,
  ) => React.ReactNode
  isCensusNotAcs?: boolean
  scrollToHash: ScrollableHashId
  reportTitle: string
  expanded?: boolean
  isCompareCard?: boolean
  className?: string
  hasIntersectionalAllCompareBar?: boolean
  metricIds?: any
  fips?: Fips
}) {
  const loadingComponent = (
    <div
      className={`relative m-2 rounded bg-white p-3 shadow-raised ${props.className}`}
      style={{ minHeight: props.minHeight }}
      tabIndex={-1}
    >
      <div className='flex justify-center'>
        <CircularProgress aria-label='loading' />
      </div>
    </div>
  )

  return (
    <WithMetadataAndMetrics
      loadGeographies={props.loadGeographies}
      loadingComponent={loadingComponent}
      queries={props.queries ?? []}
    >
      {(metadata, queryResponses, geoData) => {
        return (
          <article
            className={`relative m-2 rounded-sm bg-white p-3 shadow-raised ${props.className}`}
          >
            <InsightVisualizationButton scrollToHash={props.scrollToHash} />
            <CardOptionsMenu
              reportTitle={props.reportTitle}
              scrollToHash={props.scrollToHash}
            />
            <InsightVisualizationCard scrollToHash={props.scrollToHash} />
            {props.children(queryResponses, metadata, geoData)}
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
