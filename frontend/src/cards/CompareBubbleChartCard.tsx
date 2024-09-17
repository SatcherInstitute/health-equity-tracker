import { queries } from '@testing-library/react'
import CompareBubbleChart from '../charts/CompareBubbleChart'
import type {
  DataTypeConfig,
  MetricConfig,
} from '../data/config/MetricConfigTypes'
import {
  Breakdowns,
  DEMOGRAPHIC_DISPLAY_TYPES,
  type DemographicType,
} from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'
import CardWrapper from './CardWrapper'
import ChartTitle from './ChartTitle'
import { exclude } from '../data/query/BreakdownFilter'
import { MetricQuery } from '../data/query/MetricQuery'
import {
  NON_HISPANIC,
  AIAN_API,
  UNKNOWN_RACE,
  ALL,
} from '../data/utils/Constants'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import { generateChartTitle, generateSubtitle } from '../charts/utils'
import { DataFrame } from 'data-forge'

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

const defaultClasses = 'shadow-raised bg-white'

export default function CompareBubbleChartCard(
  props: CompareBubbleChartCardProps,
) {
  const breakdowns = Breakdowns.forChildrenFips(props.fips1).addBreakdown(
    props.demographicType,
    exclude(NON_HISPANIC, AIAN_API, UNKNOWN_RACE),
  )

  const queryX = new MetricQuery(
    [props.rateConfig1?.metricId],
    breakdowns,
    /* dataTypeId */ props.dataTypeConfig1?.dataTypeId,
    /* timeView */ 'current',
  )

  const queryY = new MetricQuery(
    [props.rateConfig2?.metricId],
    breakdowns,
    /* dataTypeId */ props.dataTypeConfig2?.dataTypeId,
    /* timeView */ 'current',
  )

  const queries = [queryX, queryY]

  const chartTitle = `Correlation between rates of ${props.rateConfig1?.chartTitle} and ${props.rateConfig2?.chartTitle} in ${props.fips1.getSentenceDisplayName()}`

  return (
    <CardWrapper
      downloadTitle={''}
      queries={queries}
      minHeight={800}
      scrollToHash={'compare-bubble-chart' as ScrollableHashId}
      reportTitle={props.reportTitle}
      className={`rounded-sm relative m-2 p-3 ${defaultClasses} ${props.className}`}
    >
      {([rateQueryResponseRateX, rateQueryResponseRateY]) => {
        const dataTopicX = rateQueryResponseRateX
          .getValidRowsForField(props.rateConfig1.metricId)
          .filter((row) => row[props.demographicType] !== 'Unknown')

        const dataTopicY = rateQueryResponseRateY
          .getValidRowsForField(props.rateConfig2.metricId)
          .filter((row) => row[props.demographicType] !== 'Unknown')

        // Create DataFrames from your arrays
        const df1 = new DataFrame(dataTopicX)
        const df2 = new DataFrame(dataTopicY)

        // Merge the DataFrames based on "fips" and "race_and_ethnicity"
        const mergedData = df1.join(
          df2,
          (rowX) => rowX.fips + rowX.race_and_ethnicity,
          (rowY) => rowY.fips + rowY.race_and_ethnicity,
          (leftRow, rightRow) => ({
            ...leftRow, // Merge fields from df1
            ...rightRow, // Merge fields from df2
          }),
        )

        // Convert the merged DataFrame back to an array of objects
        const mergedArray = mergedData.toArray()

        const validXData = mergedArray.map((row) => ({
          fips: row.fips,
          [props.demographicType]: row[props.demographicType].replace(
            ' (NH)',
            '',
          ),
          [props.rateConfig1.metricId]: row[props.rateConfig1.metricId],
        }))

        const validYData = mergedArray.map((row) => ({
          fips: row.fips,
          [props.demographicType]: row[props.demographicType].replace(
            ' (NH)',
            '',
          ),
          [props.rateConfig2.metricId]: row[props.rateConfig2.metricId],
        }))

        // TODO hook up this value to a metric like population or SVI
        const radiusData = validXData.map((row) => ({
          [props.rateConfig1.metricId]: 10,
          fips: row.fips,
          // fips_name: row.fips_name,
          [props.demographicType]: row[props.demographicType].replace(
            ' (NH)',
            '',
          ),
        }))

        return (
          <>
            <ChartTitle title={chartTitle} subtitle={''} />

            <CompareBubbleChart
              xData={validXData}
              xMetricConfig={props.rateConfig1}
              yData={validYData}
              yMetricConfig={props.rateConfig2}
              radiusData={radiusData}
            />
          </>
        )
      }}
    </CardWrapper>
  )
}
