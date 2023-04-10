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

function CardWrapper(props: {
  // prevent layout shift as component loads
  minHeight?: number
  // To have an info icon that opens additional info, pass a Popover such as <RaceInfoPopoverContent />
  infoPopover?: JSX.Element
  hideFooter?: boolean
  hideNH?: boolean
  queries?: MetricQuery[]
  // Whether to load the geographies dataset for this card.
  loadGeographies?: boolean
  children: (
    queryResponses: MetricQueryResponse[],
    metadata: MapOfDatasetMetadata,
    geoData?: Record<string, any>
  ) => JSX.Element
  isAgeAdjustedTable?: boolean
  isPopulationCard?: boolean
  scrollToHash: ScrollableHashId
}) {
  const queries = props.queries ? props.queries : []

  const loadingComponent = (
    <Card
      raised={true}
      className={styles.ChartCard}
      style={{ minHeight: props.minHeight }}
    >
      <CardContent>
        <CircularProgress aria-label="loading" />
      </CardContent>
    </Card>
  )

  return (
    <WithMetadataAndMetrics
      queries={queries}
      loadingComponent={loadingComponent}
      loadGeographies={props.loadGeographies}
    >
      {(metadata, queryResponses, geoData) => {
        return (
          <Card
            raised={true}
            className={styles.ChartCard}
            component={'article'}
          >
            {props.children(queryResponses, metadata, geoData)}
            {!props.hideFooter && props.queries && (
              <CardContent className={styles.CardFooter} component={'footer'}>
                <Sources
                  isAgeAdjustedTable={props.isAgeAdjustedTable}
                  isPopulationCard={props.isPopulationCard}
                  queryResponses={queryResponses}
                  metadata={metadata}
                  hideNH={props.hideNH}
                  scrollToHash={props.scrollToHash}
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
