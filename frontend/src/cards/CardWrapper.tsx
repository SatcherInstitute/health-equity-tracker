import styles from './Card.module.scss'
import { CardContent, Card, CircularProgress } from '@mui/material'
import {
  type MetricQuery,
  type MetricQueryResponse,
} from '../data/query/MetricQuery'
import { WithMetadataAndMetrics } from '../data/react/WithLoadingOrErrorUI'
import { Sources } from './ui/Sources'
import { type MapOfDatasetMetadata } from '../data/utils/DatasetTypes'
import { type ScrollableHashId } from '../utils/hooks/useStepObserver'
import { useDownloadCardImage } from '../utils/hooks/useDownloadCardImage'
import CardOptionsMenu from './ui/CardOptionsMenu'

function CardWrapper(props: {
  // prevent layout shift as component loads
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
    geoData?: Record<string, any>
  ) => JSX.Element
  isCensusNotAcs?: boolean
  scrollToHash: ScrollableHashId
  reportTitle: string
  elementsToHide?: string[]
  expanded?: boolean
}) {
  const [screenshotTargetRef, downloadTargetScreenshot] = useDownloadCardImage(
    props.downloadTitle,
    props.elementsToHide,
    props.expanded,
    props.scrollToHash
  )

  const loadingComponent = (
    <Card
      className={styles.ChartCard}
      raised={true}
      style={{ minHeight: props.minHeight }}
    >
      <CardContent>
        <CircularProgress aria-label="loading" />
      </CardContent>
    </Card>
  )

  return (
    <WithMetadataAndMetrics
      loadGeographies={props.loadGeographies}
      loadingComponent={loadingComponent}
      queries={props.queries ?? []}
    >
      {(metadata, queryResponses, geoData) => {
        return (
          <Card
            className={styles.ChartCard}
            component={'article'}
            raised={true}
            ref={screenshotTargetRef}
          >
            <CardOptionsMenu
              downloadTargetScreenshot={downloadTargetScreenshot}
              reportTitle={props.reportTitle}
              scrollToHash={props.scrollToHash}
            />
            {props.children(queryResponses, metadata, geoData)}
            {!props.hideFooter && props.queries && (
              <CardContent className={styles.CardFooter} component={'footer'}>
                <Sources
                  hideNH={props.hideNH}
                  isCensusNotAcs={props.isCensusNotAcs}
                  metadata={metadata}
                  queryResponses={queryResponses}
                />
              </CardContent>
            )}
          </Card>
        )
      }}
    </WithMetadataAndMetrics>
  )
}

export default CardWrapper
