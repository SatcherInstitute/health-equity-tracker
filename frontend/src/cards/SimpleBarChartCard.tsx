import { RateBarChart } from '../charts/RateBarChart'
import { addComparisonAllsRowToIntersectionalData } from '../charts/simpleBarHelperFunctions'
import { SimpleHorizontalBarChart } from '../charts/SimpleHorizontalBarChart'
import { generateChartTitle, generateSubtitle } from '../charts/utils'
import type { DataTypeConfig, MetricId } from '../data/config/MetricConfigTypes'
import { isPctType } from '../data/config/MetricConfigUtils'
import { GUN_VIOLENCE_DATATYPES } from '../data/providers/GunViolenceProvider'
import {
  DATATYPES_NEEDING_13PLUS,
  GENDER_METRICS,
} from '../data/providers/HivProvider'
import { INCARCERATION_IDS } from '../data/providers/IncarcerationProvider'
import { exclude } from '../data/query/BreakdownFilter'
import {
  Breakdowns,
  DEMOGRAPHIC_DISPLAY_TYPES,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import { MetricQuery } from '../data/query/MetricQuery'
import {
  AIAN_API,
  ALL,
  NON_HISPANIC,
  UNKNOWN_RACE,
} from '../data/utils/Constants'
import type { Fips } from '../data/utils/Fips'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import CardWrapper from './CardWrapper'
import ChartTitle from './ChartTitle'
import GenderDataShortAlert from './ui/GenderDataShortAlert'
import IncarceratedChildrenShortAlert from './ui/IncarceratedChildrenShortAlert'
import LawEnforcementAlert from './ui/LawEnforcementAlert'
import MissingDataAlert from './ui/MissingDataAlert'

/* minimize layout shift */
const PRELOAD_HEIGHT = 668

interface SimpleBarChartCardProps {
  key?: string
  demographicType: DemographicType
  dataTypeConfig: DataTypeConfig
  fips: Fips
  reportTitle: string
  className?: string
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
  const rateConfig =
    props.dataTypeConfig.metrics?.per100k ??
    props.dataTypeConfig.metrics?.pct_rate ??
    props.dataTypeConfig.metrics?.index

  if (!rateConfig) return <></>

  const isIncarceration = INCARCERATION_IDS.includes(
    props.dataTypeConfig.dataTypeId,
  )
  const isHIV = DATATYPES_NEEDING_13PLUS.includes(
    props.dataTypeConfig.dataTypeId,
  )

  const isGunDeaths = GUN_VIOLENCE_DATATYPES.includes(
    props.dataTypeConfig.dataTypeId,
  )

  const metricIdsToFetch: MetricId[] = []
  metricIdsToFetch.push(rateConfig.metricId)
  isIncarceration && metricIdsToFetch.push('confined_children_estimated_total')

  if (isHIV) {
    metricIdsToFetch.push(...GENDER_METRICS)
  }

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.demographicType,
    exclude(NON_HISPANIC, AIAN_API, UNKNOWN_RACE),
  )

  const query = new MetricQuery(
    metricIdsToFetch,
    breakdowns,
    /* dataTypeId */ props.dataTypeConfig.dataTypeId,
    /* timeView */ 'current',
  )

  const queries = [query]

  const chartTitle = generateChartTitle(
    /* chartTitle: */ rateConfig.chartTitle,
    /* fips: */ props.fips,
  )

  const subtitle = generateSubtitle(
    ALL,
    props.demographicType,
    props.dataTypeConfig,
  )
  const filename = `${chartTitle}, by ${
    DEMOGRAPHIC_DISPLAY_TYPES[props.demographicType]
  }`

  const HASH_ID: ScrollableHashId = 'rate-chart'

  const rateComparisonConfig = rateConfig?.rateComparisonMetricForAlls

  if (rateComparisonConfig) {
    // fetch the ALL rate to embed against intersectional breakdowns
    const breakdownsForAlls = Breakdowns.forFips(props.fips).addBreakdown(
      'sex',
      exclude('Male', 'Female'),
    )

    const allsRateQuery = new MetricQuery(
      [rateComparisonConfig.metricId],
      breakdownsForAlls,
      /* dataTypeId */ props.dataTypeConfig.rateComparisonDataTypeId,
      /* timeView */ 'current',
    )

    queries.push(allsRateQuery)
  }

  return (
    <CardWrapper
      downloadTitle={filename}
      queries={queries}
      minHeight={PRELOAD_HEIGHT}
      scrollToHash={HASH_ID}
      reportTitle={props.reportTitle}
      className={props.className}
      hasIntersectionalAllCompareBar={rateComparisonConfig !== undefined}
    >
      {([rateQueryResponseRate, rateQueryResponseRateAlls], metadata) => {
        // for consistency, filter out any 'Unknown' rows that might have rates (like PHRMA)
        let data = rateQueryResponseRate
          .getValidRowsForField(rateConfig.metricId)
          .filter((row) => row[props.demographicType] !== 'Unknown')

        if (rateComparisonConfig) {
          data = addComparisonAllsRowToIntersectionalData(
            data,
            props.demographicType,
            rateConfig,
            rateComparisonConfig,
            rateQueryResponseRateAlls,
          )
        }

        const hideChart =
          data.length === 0 ||
          rateQueryResponseRate.shouldShowMissingDataMessage([
            rateConfig.metricId,
          ])

        const comparisonAllSubGroup = props.dataTypeConfig.ageSubPopulationLabel

        return (
          <>
            {hideChart ? (
              <>
                <ChartTitle
                  title={'Graph unavailable: ' + chartTitle}
                  subtitle={subtitle}
                />

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
                <ChartTitle title={chartTitle} subtitle={subtitle} />

                <SimpleHorizontalBarChart
                  data={data}
                  demographicType={props.demographicType}
                  metric={rateConfig}
                  filename={filename}
                  usePercentSuffix={isPctType(rateConfig.type)}
                  fips={props.fips}
                  useIntersectionalComparisonAlls={!!rateComparisonConfig}
                  comparisonAllSubGroup={comparisonAllSubGroup}
                />
                <RateBarChart
                  data={data}
                  demographicType={props.demographicType}
                  metric={rateConfig}
                  filename={filename}
                  usePercentSuffix={isPctType(rateConfig.type)}
                  fips={props.fips}
                  useIntersectionalComparisonAlls={!!rateComparisonConfig}
                  comparisonAllSubGroup={comparisonAllSubGroup}
                />
                {isIncarceration && (
                  <IncarceratedChildrenShortAlert
                    fips={props.fips}
                    queryResponse={rateQueryResponseRate}
                    demographicType={props.demographicType}
                  />
                )}
                {isHIV && breakdowns.demographicBreakdowns.sex.enabled && (
                  <GenderDataShortAlert
                    fips={props.fips}
                    queryResponse={rateQueryResponseRate}
                    demographicType={props.demographicType}
                    dataTypeId={props.dataTypeConfig.dataTypeId}
                  />
                )}
                {isGunDeaths && (
                  <LawEnforcementAlert
                    fips={props.fips}
                    demographicType={props.demographicType}
                    metadata={metadata}
                    queryResponse={rateQueryResponseRate}
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
