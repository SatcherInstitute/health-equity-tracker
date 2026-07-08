import CompareBubbleChart from '../charts/CompareBubbleChart'
import type {
  DataTypeConfig,
  MetricConfig,
  MetricId,
} from '../data/config/MetricConfigTypes'
import { exclude } from '../data/query/BreakdownFilter'
import { Breakdowns, type DemographicType } from '../data/query/Breakdowns'
import { MetricQuery } from '../data/query/MetricQuery'
import { AIAN_API, NON_HISPANIC, UNKNOWN_RACE } from '../data/utils/Constants'
import type { Fips } from '../data/utils/Fips'
import { SHOW_CORRELATION_CARD } from '../featureFlags'
import { useGuessPreloadHeight } from '../utils/hooks/useGuessPreloadHeight'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import CardWrapper from './CardWrapper'
import ChartTitle, { getChartTitleId } from './ChartTitle'

interface CompareBubbleChartCardProps {
  fips1: Fips
  dataTypeConfig1: DataTypeConfig
  dataTypeConfig2: DataTypeConfig
  rateConfig1: MetricConfig
  rateConfig2: MetricConfig
  demographicType: DemographicType
  reportTitle: string
  className?: string
}

const defaultClasses = 'shadow-raised bg-alt-white'

export default function CompareBubbleChartCard(
  props: CompareBubbleChartCardProps,
) {
  const preloadHeight = useGuessPreloadHeight([750, 1050])

  const breakdowns = Breakdowns.forChildrenFips(props.fips1).addBreakdown(
    props.demographicType,
    exclude(NON_HISPANIC, AIAN_API, UNKNOWN_RACE),
  )

  const rateIdX = props.rateConfig1?.metricId
  const xIdsToFetch: MetricId[] = []
  if (rateIdX) xIdsToFetch.push(rateIdX)
  const queryX = new MetricQuery(
    xIdsToFetch,
    breakdowns,
    /* dataTypeId */ undefined,
    /* timeView */ 'current',
  )

  const yIdsToFetch: MetricId[] = []
  const rateIdY = props.rateConfig2?.metricId
  if (rateIdY) yIdsToFetch.push(rateIdY)
  const queryY = new MetricQuery(
    yIdsToFetch,
    breakdowns,
    /* dataTypeId */ props.dataTypeConfig2?.dataTypeId,
    /* timeView */ 'current',
  )

  const breakdownsPop = Breakdowns.forChildrenFips(props.fips1)

  const popIdToFetch: MetricId[] = ['population']
  const queryPop = new MetricQuery(
    popIdToFetch,
    breakdownsPop,
    /* dataTypeId */ undefined,
    /* timeView */ 'current',
  )

  const queries = [queryX, queryY, queryPop]

  let chartTitle = `Correlation between rates of ${props.rateConfig1?.chartTitle} and ${props.rateConfig2?.chartTitle} in ${props.fips1.getSentenceDisplayName()}`

  if (SHOW_CORRELATION_CARD) chartTitle = 'PREVIEW MODE: ' + chartTitle

  return (
    <CardWrapper
      downloadTitle={''}
      queries={queries}
      minHeight={preloadHeight}
      scrollToHash={'compare-bubble-chart' as ScrollableHashId}
      reportTitle={props.reportTitle}
      className={`relative m-2 rounded-sm p-3 ${defaultClasses} ${props.className}`}
    >
      {(queryResponses) => {
        const rateQueryResponseRateX = queryResponses[0]
        const rateQueryResponseRateY = queryResponses[1]
        const rateQueryResponsePop = queryResponses[2]

        const dataTopicX = rateQueryResponseRateX
          .getValidRowsForField(props.rateConfig1.metricId)
          .filter(
            (row) =>
              row[props.demographicType] !== 'Unknown' &&
              row[props.demographicType] !== 'All',
          )

        const dataTopicY = rateQueryResponseRateY
          .getValidRowsForField(props.rateConfig2.metricId)
          .filter(
            (row) =>
              row[props.demographicType] !== 'Unknown' &&
              row[props.demographicType] !== 'All',
          )

        const dataPopRadius = rateQueryResponsePop.data

        const yIndex = new Map(
          dataTopicY.map((row) => [
            row.fips +
              row.fips_name +
              String(row[props.demographicType] ?? '').replace(' (NH)', ''),
            row,
          ]),
        )
        const mergedXY = dataTopicX.flatMap((rowX) => {
          const key =
            rowX.fips +
            rowX.fips_name +
            String(rowX[props.demographicType] ?? '').replace(' (NH)', '')
          const rowY = yIndex.get(key)
          return rowY ? [{ ...rowX, ...rowY }] : []
        })

        const popIndex = new Map(
          dataPopRadius.map((row) => [row.fips + row.fips_name, row]),
        )
        const mergedArray = mergedXY.flatMap((row) => {
          const rowPop = popIndex.get(row.fips + row.fips_name)
          return rowPop ? [{ ...row, ...rowPop }] : []
        })

        const validXData = mergedArray.map((row) => ({
          fips: row.fips,
          fips_name: row.fips_name,
          [props.demographicType]: row[props.demographicType].replace(
            ' (NH)',
            '',
          ),
          [props.rateConfig1.metricId]: row[props.rateConfig1.metricId],
        }))

        const validYData = mergedArray.map((row) => ({
          fips: row.fips,
          fips_name: row.fips_name,
          [props.demographicType]: row[props.demographicType].replace(
            ' (NH)',
            '',
          ),
          [props.rateConfig2.metricId]: row[props.rateConfig2.metricId],
        }))

        const validRadiusData = mergedArray.map((row) => ({
          population: row.population,
          fips: row.fips,
          fips_name: row.fips_name,
          [props.demographicType]: row[props.demographicType].replace(
            ' (NH)',
            '',
          ),
        }))

        return (
          <>
            <ChartTitle
              id={getChartTitleId('compare-bubble-chart' as ScrollableHashId)}
              title={chartTitle}
              subtitle={''}
            />

            <CompareBubbleChart
              chartTitleId={getChartTitleId(
                'compare-bubble-chart' as ScrollableHashId,
              )}
              xData={validXData}
              xMetricConfig={props.rateConfig1}
              yData={validYData}
              yMetricConfig={props.rateConfig2}
              radiusData={validRadiusData}
              radiusMetricConfig={{
                chartTitle: 'Population',
                metricId: 'population',
                shortLabel: 'Population',
                type: 'count',
              }}
            />
          </>
        )
      }}
    </CardWrapper>
  )
}
