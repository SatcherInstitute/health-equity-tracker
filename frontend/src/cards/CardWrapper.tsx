import { CircularProgress } from '@mui/material'
import type {
  MetricQuery,
  MetricQueryResponse,
} from '../data/query/MetricQuery'
import { WithMetadataAndMetrics } from '../data/react/WithLoadingOrErrorUI'
import { Sources } from './ui/Sources'
import type { MapOfDatasetMetadata } from '../data/utils/DatasetTypes'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import {
  type ElementHashIdHiddenOnScreenshot,
  useDownloadCardImage,
} from '../utils/hooks/useDownloadCardImage'
import CardOptionsMenu from './ui/CardOptionsMenu'

function CardWrapper(props: {
  // prevent layout shift as component  loads
  minHeight?: number
  downloadTitle: string
  // To have an info icon that opens additional info, pass a Popover such as <RaceInfoPopoverContent />
  infoPopover?: JSX.Element
  hideFooter?: boolean
  hideNH?: boolean
  queries: MetricQuery[]
  // Whether to load the geographies dataset for this card.
  loadGeographies?: boolean
  children: (
    queryResponses: MetricQueryResponse[],
    metadata: MapOfDatasetMetadata,
    geoData?: Record<string, any>,
  ) => JSX.Element
  isCensusNotAcs?: boolean
  scrollToHash: ScrollableHashId
  reportTitle: string
  elementsToHide?: ElementHashIdHiddenOnScreenshot[]
  expanded?: boolean
  isCompareCard?: boolean
}) {
  const [screenshotTargetRef, downloadTargetScreenshot] = useDownloadCardImage(
    props.downloadTitle,
    props.elementsToHide,
    props.scrollToHash,
    props.expanded,
  )

  const loadingComponent = (
    <div
      className='rounded relative m-2 bg-white p-3 shadow-raised'
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
            className='rounded relative m-2  bg-white p-3 shadow-raised'
            ref={screenshotTargetRef}
            tabIndex={-1}
          >
            <CardOptionsMenu
              downloadTargetScreenshot={downloadTargetScreenshot}
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
              />
            )}
          </article>
        )
      }}
    </WithMetadataAndMetrics>
  )
}

export default CardWrapper
