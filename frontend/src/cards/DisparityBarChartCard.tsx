import { DisparityBarChart } from '../charts/disparityBarChart/Index'
import type { Fips } from '../data/utils/Fips'
import {
  Breakdowns,
  type DemographicType,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
} from '../data/query/Breakdowns'
import { MetricQuery } from '../data/query/MetricQuery'
import type { MetricId, DataTypeConfig } from '../data/config/MetricConfig'
import CardWrapper from './CardWrapper'
import MissingDataAlert from './ui/MissingDataAlert'
import { exclude } from '../data/query/BreakdownFilter'
import {
  NON_HISPANIC,
  ALL,
  RACE,
  HISPANIC,
  SEX,
  AGE,
} from '../data/utils/Constants'
import UnknownsAlert from './ui/UnknownsAlert'
import {
  shouldShowAltPopCompare,
  splitIntoKnownsAndUnknowns,
} from '../data/utils/datasetutils'
import { CAWP_METRICS } from '../data/providers/CawpProvider'
import { useGuessPreloadHeight } from '../utils/hooks/useGuessPreloadHeight'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import CAWPOverlappingRacesAlert from './ui/CAWPOverlappingRacesAlert'
import ChartTitle from './ChartTitle'
import { generateChartTitle, generateSubtitle } from '../charts/utils'
import type { ElementHashIdHiddenOnScreenshot } from '../utils/hooks/useDownloadCardImage'
import HetNotice from '../styles/HetComponents/HetNotice'
import { ALL_AHR_METRICS } from '../data/providers/AhrProvider'

interface DisparityBarChartCardProps {
  key?: string
  demographicType: DemographicType
  dataTypeConfig: DataTypeConfig
  fips: Fips
  reportTitle: string
}

// This wrapper ensures the proper key is set to create a new instance when
// required rather than relying on the card caller.
export default function DisparityBarChartCard(
  props: DisparityBarChartCardProps,
) {
  return (
    <DisparityBarChartCardWithKey
      key={props.dataTypeConfig.dataTypeId + props.demographicType}
      {...props}
    />
  )
}

function DisparityBarChartCardWithKey(props: DisparityBarChartCardProps) {
  const preloadHeight = useGuessPreloadHeight(
    [700, 1000],
    props.demographicType === SEX,
  )

  const metricConfig = props.dataTypeConfig.metrics?.pct_share
  if (!metricConfig) return <></>
  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.demographicType,
    exclude(ALL, NON_HISPANIC),
  )

  // Population Comparison Metric is required for the Disparity Bar Chart.
  // If MetricConfig supports known breakdown metric, prefer this metric.
  const metricIds = [metricConfig.metricId]
  const popCompareId: MetricId | null =
    metricConfig?.populationComparisonMetric?.metricId ?? null
  if (popCompareId) {
    metricIds.push(popCompareId)
  }
  if (metricConfig.knownBreakdownComparisonMetric) {
    metricIds.push(metricConfig.knownBreakdownComparisonMetric.metricId)
  }
  if (metricConfig.secondaryPopulationComparisonMetric) {
    metricIds.push(metricConfig.secondaryPopulationComparisonMetric.metricId)
  }

  const query = new MetricQuery(
    metricIds,
    breakdowns,
    /* dataTypeId */ props.dataTypeConfig.dataTypeId,
    /* timeView */ 'current',
  )

  const chartTitle = generateChartTitle(
    /* chartTitle: */
    metricConfig?.populationComparisonMetric?.chartTitle ??
      metricConfig.chartTitle,
    /* fips:  */ props.fips,
  )

  const subtitle = generateSubtitle(
    ALL,
    props.demographicType,
    props.dataTypeConfig,
  )

  const HASH_ID: ScrollableHashId = 'population-vs-distribution'

  const elementsToHide: ElementHashIdHiddenOnScreenshot[] = [
    '#card-options-menu',
  ]

  return (
    <CardWrapper
      downloadTitle={chartTitle}
      queries={[query]}
      scrollToHash={HASH_ID}
      minHeight={preloadHeight}
      reportTitle={props.reportTitle}
      elementsToHide={elementsToHide}
    >
      {([queryResponse]) => {
        const validData = queryResponse.getValidRowsForField(
          metricConfig.metricId,
        )

        const [knownData] = splitIntoKnownsAndUnknowns(
          validData,
          props.demographicType,
        )

        const isCawp = CAWP_METRICS.includes(metricConfig.metricId)

        const showAHRPopulationWarning =
          ALL_AHR_METRICS.includes(metricConfig.metricId) &&
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
          queryResponse.data.some((row) => row[metricConfig.metricId])

        const dataAvailable =
          knownData.length > 0 &&
          !queryResponse.shouldShowMissingDataMessage([metricConfig.metricId])

        return (
          <>
            {dataAvailable && knownData.length !== 0 && (
              <>
                <ChartTitle title={chartTitle} subtitle={subtitle} />

                <DisparityBarChart
                  data={knownData}
                  lightMetric={
                    metricConfig.populationComparisonMetric ?? metricConfig
                  }
                  darkMetric={
                    metricConfig.knownBreakdownComparisonMetric ?? metricConfig
                  }
                  demographicType={props.demographicType}
                  metricDisplayName={metricConfig.shortLabel}
                  filename={chartTitle}
                  showAltPopCompare={shouldShowAltPopCompare(props)}
                />
              </>
            )}

            {/* Display either UnknownsAlert OR MissingDataAlert */}
            {dataAvailable ? (
              <UnknownsAlert
                metricConfig={metricConfig}
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
