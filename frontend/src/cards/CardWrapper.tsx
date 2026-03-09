import { AutoAwesome, DeleteForever } from '@mui/icons-material'
import { CircularProgress } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import { useState } from 'react'
import type {
  MetricQuery,
  MetricQueryResponse
} from '../data/query/MetricQuery'
import { WithMetadataAndMetrics } from '../data/react/WithLoadingOrErrorUI'
import type { MapOfDatasetMetadata } from '../data/utils/DatasetTypes'
import { splitIntoKnownsAndUnknowns } from '../data/utils/datasetutils'
import type { Fips } from '../data/utils/Fips'
import { SHOW_INSIGHT_GENERATION } from '../featureFlags'
import { generateCardInsight } from '../utils/generateCardInsight'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import CardOptionsMenu from './ui/CardOptionsMenu'
import InsightCard from './ui/InsightCard'
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
  shareConfig?: any
  demographicType?: any
  metricIds?: any
  fips?: Fips
}) {
  const [insight, setInsight] = useState<string>('')
  const [isGeneratingInsight, setIsGeneratingInsight] = useState<boolean>(false)
  const [rateLimitReached, setRateLimitReached] = useState<boolean>(false)

  const loadingComponent = (
    <div
      className={`relative m-2 flex justify-center rounded bg-white p-3 shadow-raised ${props.className}`}
      style={{ minHeight: props.minHeight }}
      tabIndex={-1}
    >
      <CircularProgress aria-label='loading' />
    </div>
  )

  const shouldShowInsightDisplay = SHOW_INSIGHT_GENERATION && props.shareConfig
  const showInsightButton = shouldShowInsightDisplay && !rateLimitReached

  return (
    <WithMetadataAndMetrics
      loadGeographies={props.loadGeographies}
      loadingComponent={loadingComponent}
      queries={props.queries ?? []}
    >
      {(metadata, queryResponses, geoData) => {
        const queryResponse = queryResponses[0]

        const handleGenerateInsight = async () => {
          if (!props.shareConfig || !props.metricIds?.length) return

          const validData = queryResponse.getValidRowsForField(
            props.shareConfig.metricId,
          )
          const [knownData] = splitIntoKnownsAndUnknowns(
            validData,
            props.demographicType,
          )
          if (!knownData.length) return

          setIsGeneratingInsight(true)
          try {
            const result = await generateCardInsight(
              { knownData, metricIds: props.metricIds },
              props.scrollToHash,
              props.fips,
            )
            if (result.rateLimited) {
              setRateLimitReached(true)
            } else {
              setInsight(result.content)
            }
          } finally {
            setIsGeneratingInsight(false)
          }
        }

        const handleClearInsight = () => setInsight('')

        return (
          <article
            className={`relative m-2 rounded-sm bg-white p-3 shadow-raised ${props.className}`}
          >
            {shouldShowInsightDisplay && (
              <InsightCard
                demographicType={props.demographicType}
                metricIds={props.metricIds}
                queryResponses={queryResponses}
                shareConfig={props.shareConfig}
                hashId={props.scrollToHash}
                fips={props.fips}
                insight={insight}
                isGeneratingInsight={isGeneratingInsight}
              />
            )}
            <div className='absolute top-2 right-2 z-10 flex items-center gap-1'>
              {showInsightButton && (
                <IconButton
                  aria-label={insight ? 'Clear insight' : 'Generate insight'}
                  onClick={insight ? handleClearInsight : handleGenerateInsight}
                  disabled={isGeneratingInsight}
                  size='small'
                >
                  {isGeneratingInsight ? (
                    <CircularProgress size={20} />
                  ) : insight ? (
                    <DeleteForever fontSize='small' />
                  ) : (
                    <AutoAwesome fontSize='small' />
                  )}
                </IconButton>
              )}
              <CardOptionsMenu
                reportTitle={props.reportTitle}
                scrollToHash={props.scrollToHash}
              />
            </div>

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
