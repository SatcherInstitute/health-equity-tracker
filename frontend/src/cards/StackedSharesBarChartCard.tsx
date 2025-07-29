import { StackedBarChart } from '../charts/stackedSharesBarChart/Index'
import { generateChartTitle, generateSubtitle } from '../charts/utils'
import type { DataTypeConfig, MetricId } from '../data/config/MetricConfigTypes'
import { getMetricIdToConfigMap } from '../data/config/MetricConfigUtils'
import { ALL_AHR_METRICS } from '../data/providers/AhrProvider'
import { CAWP_METRICS } from '../data/providers/CawpProvider'
import { exclude } from '../data/query/BreakdownFilter'
import {
  Breakdowns,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import { MetricQuery } from '../data/query/MetricQuery'
import {
  AGE,
  ALL,
  HISPANIC,
  NON_HISPANIC,
  RACE,
  SEX,
} from '../data/utils/Constants'
import type { Fips } from '../data/utils/Fips'
import { splitIntoKnownsAndUnknowns } from '../data/utils/datasetutils'
import HetNotice from '../styles/HetComponents/HetNotice'
import { useGuessPreloadHeight } from '../utils/hooks/useGuessPreloadHeight'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import CardWrapper from './CardWrapper'
import ChartTitle from './ChartTitle'
import CAWPOverlappingRacesAlert from './ui/CAWPOverlappingRacesAlert'
import MissingDataAlert from './ui/MissingDataAlert'
import UnknownsAlert from './ui/UnknownsAlert'

interface StackedSharesBarChartCardProps {
  key?: string
  demographicType: DemographicType
  dataTypeConfig: DataTypeConfig
  fips: Fips
  reportTitle: string
  className?: string
}

export default function StackedSharesBarChartCard(
  props: StackedSharesBarChartCardProps,
) {
  const preloadHeight = useGuessPreloadHeight(
    [700, 1000],
    props.demographicType === SEX,
  )

  const shareConfig = props.dataTypeConfig.metrics?.pct_share
  if (!shareConfig) return <></>
  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.demographicType,
    exclude(ALL, NON_HISPANIC),
  )

  // Population Comparison Metric is required
  // If MetricConfig supports known breakdown metric, prefer this metric.
  const metricIdToConfigMap = getMetricIdToConfigMap([shareConfig])
  const metricIds = Object.keys(metricIdToConfigMap) as MetricId[]

  const query = new MetricQuery(
    metricIds,
    breakdowns,
    /* dataTypeId */ props.dataTypeConfig.dataTypeId,
    /* timeView */ 'current',
  )

  const chartTitle = generateChartTitle(
    /* chartTitle: */
    shareConfig?.populationComparisonMetric?.chartTitle ??
      shareConfig.chartTitle,
    /* fips:  */ props.fips,
  )

  const subtitle = generateSubtitle(
    ALL,
    props.demographicType,
    props.dataTypeConfig,
  )

  const HASH_ID: ScrollableHashId = 'population-vs-distribution'

  return (
    <CardWrapper
      downloadTitle={chartTitle}
      queries={[query]}
      scrollToHash={HASH_ID}
      minHeight={preloadHeight}
      reportTitle={props.reportTitle}
      className={props.className}
      shareConfig={shareConfig}
      metricIds={metricIds}
    >
      {([queryResponse]) => {
        const validData = queryResponse.getValidRowsForField(
          shareConfig.metricId,
        )

        const [knownData] = splitIntoKnownsAndUnknowns(
          validData,
          props.demographicType,
        )

        const isCawp = CAWP_METRICS.includes(shareConfig.metricId)

        const showAHRPopulationWarning =
          ALL_AHR_METRICS.includes(shareConfig.metricId) &&
          props.demographicType === AGE

        // include a note about percents adding to over 100%
        // if race options include hispanic twice (eg "White" and "Hispanic" can both include Hispanic people)
        // also require at least some data to be available to avoid showing info on suppressed/undefined states
        const shouldShowDoesntAddUpMessage =
          !isCawp &&
          props.demographicType === RACE &&
          queryResponse.data.every(
            (row) =>
              !row[props.demographicType].includes('(NH)') ||
              row[props.demographicType] === HISPANIC,
          ) &&
          queryResponse.data.some((row) => row[shareConfig.metricId])

        const dataAvailable =
          knownData.length > 0 &&
          !queryResponse.shouldShowMissingDataMessage([shareConfig.metricId])

        return (
          <>
            {dataAvailable && knownData.length !== 0 && (
              <>
                <ChartTitle title={chartTitle} subtitle={subtitle} />

                <StackedBarChart
                  fips={props.fips}
                  data={knownData}
                  lightMetric={
                    shareConfig.populationComparisonMetric ?? shareConfig
                  }
                  darkMetric={
                    shareConfig.knownBreakdownComparisonMetric ?? shareConfig
                  }
                  demographicType={props.demographicType}
                  metricDisplayName={shareConfig.shortLabel}
                  filename={chartTitle}
                />
              </>
            )}

            {/* Display either UnknownsAlert OR MissingDataAlert */}
            {dataAvailable ? (
              <UnknownsAlert
                metricConfig={shareConfig}
                queryResponse={queryResponse}
                demographicType={props.demographicType}
                displayType='chart'
                known={true}
                overrideAndWithOr={props.demographicType === RACE}
                fips={props.fips}
              />
            ) : (
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
            )}

            {shouldShowDoesntAddUpMessage && (
              <HetNotice>
                Population percentages on this graph add up to over 100% because
                the racial categories reported for {chartTitle} in{' '}
                {props.fips.getSentenceDisplayName()} include Hispanic
                individuals in each racial category. As a result, Hispanic
                individuals are counted twice.
              </HetNotice>
            )}
            {isCawp && (
              <CAWPOverlappingRacesAlert
                dataTypeConfig={props.dataTypeConfig}
              />
            )}
            {showAHRPopulationWarning && (
              <HetNotice kind='data-integrity'>
                Percent share values on this report measure the share of{' '}
                <em>adult</em> cases, whereas the comparison population percent
                shares displayed are for the entire population (all ages). Use
                caution when comparing an age group's share of cases to their
                share of the population.
              </HetNotice>
            )}
          </>
        )
      }}
    </CardWrapper>
  )
}
