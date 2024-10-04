import { CircularProgress } from '@mui/material'
import type {
  MetricQuery,
  MetricQueryResponse,
} from '../data/query/MetricQuery'
import { WithMetadataAndMetrics } from '../data/react/WithLoadingOrErrorUI'
import type { MapOfDatasetMetadata } from '../data/utils/DatasetTypes'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import CardOptionsMenu from './ui/CardOptionsMenu'
import { Sources } from './ui/Sources'

function CardWrapper(props: {
  // prevent layout shift as component loads
  minHeight?: number
  downloadTitle: string
  infoPopover?: JSX.Element
  hideFooter?: boolean
  hideNH?: boolean
  queries: MetricQuery[]
  loadGeographies?: boolean
  children: (
    queryResponses: MetricQueryResponse[],
    metadata: MapOfDatasetMetadata,
    geoData?: Record<string, any>,
  ) => JSX.Element
  isCensusNotAcs?: boolean
  scrollToHash: ScrollableHashId
  reportTitle: string
  expanded?: boolean
  isCompareCard?: boolean
  className?: string
  hasIntersectionalAllCompareBar?: boolean
}) {
  const loadingComponent = (
    <div
      className={`rounded relative m-2 p-3 shadow-raised bg-white flex justify-center ${props.className}`}
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
        return (
          <article
            className={`rounded-sm relative m-2 p-3 shadow-raised bg-white ${props.className}`}
            tabIndex={-1}
          >
            <CardOptionsMenu
              reportTitle={props.reportTitle}
              scrollToHash={props.scrollToHash}
            />
            {props.children(queryResponses, metadata, geoData)}
            {!props.hideFooter && props.queries && (
              <Sources
                isCensusNotAcs={props.isCensusNotAcs}
                metadata={metadata}
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
