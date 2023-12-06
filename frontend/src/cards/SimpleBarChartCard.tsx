import { SimpleHorizontalBarChart } from '../charts/SimpleHorizontalBarChart'
import { type Fips } from '../data/utils/Fips'
import {
  Breakdowns,
  type DemographicType,
  DEMOGRAPHIC_DISPLAY_TYPES,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
} from '../data/query/Breakdowns'
import { MetricQuery } from '../data/query/MetricQuery'
import {
  isPctType,
  type MetricId,
  type DataTypeConfig,
} from '../data/config/MetricConfig'
import CardWrapper from './CardWrapper'
import { exclude } from '../data/query/BreakdownFilter'
import { AIAN_API, NON_HISPANIC, UNKNOWN_RACE } from '../data/utils/Constants'
import MissingDataAlert from './ui/MissingDataAlert'
import { INCARCERATION_IDS } from '../data/providers/IncarcerationProvider'

import IncarceratedChildrenShortAlert from './ui/IncarceratedChildrenShortAlert'
import { type ScrollableHashId } from '../utils/hooks/useStepObserver'
import ChartTitle from './ChartTitle'
import { generateChartTitle } from '../charts/utils'
import GenderDataShortAlert from './ui/GenderDataShortAlert'
import {
  DATATYPES_NEEDING_13PLUS,
  GENDER_METRICS,
} from '../data/providers/HivProvider'
import { type ElementHashIdHiddenOnScreenshot } from '../utils/hooks/useDownloadCardImage'

/* minimize layout shift */
const PRELOAD_HEIGHT = 668

interface SimpleBarChartCardProps {
  key?: string
  demographicType: DemographicType
  dataTypeConfig: DataTypeConfig
  fips: Fips
  reportTitle: string
}

// This wrapper ensures the proper key is set to create a new instance when
// required rather than relying on the card caller.
export default function SimpleBarChartCard(props: SimpleBarChartCardProps) {
  return (
    <SimpleBarChartCardWithKey
      key={props.dataTypeConfig.dataTypeId + props.demographicType}
      {...props}
    />
  )
}

function SimpleBarChartCardWithKey(props: SimpleBarChartCardProps) {
  const metricConfig =
    props.dataTypeConfig.metrics?.per100k ??
    props.dataTypeConfig.metrics?.pct_rate ??
    props.dataTypeConfig.metrics?.index

  if (!metricConfig) return <></>

  const isIncarceration = INCARCERATION_IDS.includes(
    props.dataTypeConfig.dataTypeId
  )
  const isHIV = DATATYPES_NEEDING_13PLUS.includes(
    props.dataTypeConfig.dataTypeId
  )

  const metricIdsToFetch: MetricId[] = []
  metricIdsToFetch.push(metricConfig.metricId)
  isIncarceration && metricIdsToFetch.push('total_confined_children')

  if (isHIV) {
    metricIdsToFetch.push(...GENDER_METRICS)
  }

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.demographicType,
    exclude(NON_HISPANIC, AIAN_API, UNKNOWN_RACE)
  )

  const query = new MetricQuery(
    metricIdsToFetch,
    breakdowns,
    /* dataTypeId */ props.dataTypeConfig.dataTypeId,
    /* timeView */ 'current'
  )

  const chartTitle = generateChartTitle(
    /* chartTitle: */ metricConfig.chartTitle,
    /* fips: */ props.fips
  )
  const filename = `${chartTitle}, by ${
    DEMOGRAPHIC_DISPLAY_TYPES[props.demographicType]
  }`

  const HASH_ID: ScrollableHashId = 'rate-chart'

  const elementsToHide: ElementHashIdHiddenOnScreenshot[] = [
    '#card-options-menu',
  ]

  return (
    <CardWrapper
      downloadTitle={filename}
      queries={[query]}
      minHeight={PRELOAD_HEIGHT}
      scrollToHash={HASH_ID}
      reportTitle={props.reportTitle}
      elementsToHide={elementsToHide}
    >
      {([queryResponse]) => {
        const data = queryResponse.getValidRowsForField(metricConfig.metricId)

        const hideChart =
          data.length === 0 ||
          queryResponse.shouldShowMissingDataMessage([metricConfig.metricId])

        return (
          <>
            {hideChart ? (
              <>
                <ChartTitle title={'Graph unavailable: ' + chartTitle} />

                <MissingDataAlert
                  dataName={chartTitle}
                  demographicTypeString={
                    DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]
                  }
                  fips={props.fips}
                />
              </>
            ) : (
              <>
                <ChartTitle title={chartTitle} />

                <SimpleHorizontalBarChart
                  data={data}
                  demographicType={props.demographicType}
                  metric={metricConfig}
                  filename={filename}
                  usePercentSuffix={isPctType(metricConfig.type)}
                />
                {isIncarceration && (
                  <IncarceratedChildrenShortAlert
                    fips={props.fips}
                    queryResponse={queryResponse}
                    demographicType={props.demographicType}
                  />
                )}
                {isHIV && breakdowns.demographicBreakdowns.sex.enabled && (
                  <GenderDataShortAlert
                    fips={props.fips}
                    queryResponse={queryResponse}
                    demographicType={props.demographicType}
                    dataTypeId={props.dataTypeConfig.dataTypeId}
                  />
                )}
              </>
            )}
          </>
        )
      }}
    </CardWrapper>
  )
}
