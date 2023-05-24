import { DisparityBarChart } from '../charts/disparityBarChart/Index'
import { CardContent, Alert } from '@mui/material'
import { type Fips } from '../data/utils/Fips'
import {
  Breakdowns,
  type BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from '../data/query/Breakdowns'
import { MetricQuery } from '../data/query/MetricQuery'
import { type MetricId, type VariableConfig } from '../data/config/MetricConfig'
import CardWrapper from './CardWrapper'
import MissingDataAlert from './ui/MissingDataAlert'
import { exclude } from '../data/query/BreakdownFilter'
import { NON_HISPANIC, ALL, RACE, HISPANIC } from '../data/utils/Constants'
import UnknownsAlert from './ui/UnknownsAlert'
import {
  shouldShowAltPopCompare,
  splitIntoKnownsAndUnknowns,
} from '../data/utils/datasetutils'
import { CAWP_DETERMINANTS } from '../data/variables/CawpProvider'
import { useGuessPreloadHeight } from '../utils/hooks/useGuessPreloadHeight'
import { type ScrollableHashId } from '../utils/hooks/useStepObserver'
import CAWPOverlappingRacesAlert from './ui/CAWPOverlappingRacesAlert'
import ChartTitle from './ChartTitle'
import { generateChartTitle } from '../charts/utils'

export interface DisparityBarChartCardProps {
  key?: string
  breakdownVar: BreakdownVar
  variableConfig: VariableConfig
  fips: Fips
  reportTitle: string
}

// This wrapper ensures the proper key is set to create a new instance when
// required rather than relying on the card caller.
export function DisparityBarChartCard(props: DisparityBarChartCardProps) {
  return (
    <DisparityBarChartCardWithKey
      key={props.variableConfig.variableId + props.breakdownVar}
      {...props}
    />
  )
}

function DisparityBarChartCardWithKey(props: DisparityBarChartCardProps) {
  const preloadHeight = useGuessPreloadHeight(
    [700, 1000],
    props.breakdownVar === 'sex'
  )

  const metricConfig = props.variableConfig.metrics.pct_share
  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    exclude(ALL, NON_HISPANIC)
  )

  const isCawp = CAWP_DETERMINANTS.includes(metricConfig.metricId)

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
    /* variableId */ props.variableConfig.variableId,
    /* timeView */ isCawp ? 'cross_sectional' : undefined
  )

  const chartTitle = generateChartTitle({
    chartTitle:
      metricConfig?.populationComparisonMetric?.chartTitle ??
      metricConfig.chartTitle,
    fips: props.fips,
  })

  const HASH_ID: ScrollableHashId = 'population-vs-distribution'

  return (
    <CardWrapper
      downloadTitle={chartTitle}
      queries={[query]}
      scrollToHash={HASH_ID}
      minHeight={preloadHeight}
      reportTitle={props.reportTitle}
    >
      {([queryResponse]) => {
        const validData = queryResponse.getValidRowsForField(
          metricConfig.metricId
        )

        const [knownData] = splitIntoKnownsAndUnknowns(
          validData,
          props.breakdownVar
        )

        const isCawp = CAWP_DETERMINANTS.includes(metricConfig.metricId)

        // include a note about percents adding to over 100%
        // if race options include hispanic twice (eg "White" and "Hispanic" can both include Hispanic people)
        // also require at least some data to be available to avoid showing info on suppressed/undefined states
        const shouldShowDoesntAddUpMessage =
          !isCawp &&
          props.breakdownVar === RACE &&
          queryResponse.data.every(
            (row) =>
              !row[props.breakdownVar].includes('(NH)') ||
              row[props.breakdownVar] === HISPANIC
          ) &&
          queryResponse.data.some((row) => row[metricConfig.metricId])

        const dataAvailable =
          knownData.length > 0 &&
          !queryResponse.shouldShowMissingDataMessage([metricConfig.metricId])

        return (
          <>
            <CardContent>
              <ChartTitle title={chartTitle} />
              {dataAvailable && knownData.length !== 0 && (
                <DisparityBarChart
                  data={knownData}
                  lightMetric={
                    metricConfig.populationComparisonMetric ?? metricConfig
                  }
                  darkMetric={
                    metricConfig.knownBreakdownComparisonMetric ?? metricConfig
                  }
                  breakdownVar={props.breakdownVar}
                  metricDisplayName={metricConfig.shortLabel}
                  filename={chartTitle}
                  showAltPopCompare={shouldShowAltPopCompare(props)}
                />
              )}
            </CardContent>

            {/* Display either UnknownsAlert OR MissingDataAlert */}
            {dataAvailable ? (
              <UnknownsAlert
                metricConfig={metricConfig}
                queryResponse={queryResponse}
                breakdownVar={props.breakdownVar}
                displayType="chart"
                known={true}
                overrideAndWithOr={props.breakdownVar === RACE}
                fips={props.fips}
              />
            ) : (
              <CardContent>
                <MissingDataAlert
                  dataName={chartTitle}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar]
                  }
                  fips={props.fips}
                />
              </CardContent>
            )}

            {shouldShowDoesntAddUpMessage && (
              <CardContent>
                <Alert severity="info" role="note">
                  Population percentages on this graph add up to over 100%
                  because the racial categories reported for {chartTitle} in{' '}
                  {props.fips.getSentenceDisplayName()} include Hispanic
                  individuals in each racial category. As a result, Hispanic
                  individuals are counted twice.
                </Alert>
              </CardContent>
            )}
            {isCawp && (
              <CAWPOverlappingRacesAlert
                variableConfig={props.variableConfig}
              />
            )}
          </>
        )
      }}
    </CardWrapper>
  )
}
