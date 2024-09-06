import { TableChart } from '../charts/TableChart'
import CardWrapper from './CardWrapper'
import { MetricQuery } from '../data/query/MetricQuery'
import type { Fips } from '../data/utils/Fips'
import {
  Breakdowns,
  type DemographicType,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
} from '../data/query/Breakdowns'
import {
  METRIC_CONFIG,
  type MetricConfig,
  type MetricId,
  type DataTypeConfig,
  getRateAndPctShareMetrics,
} from '../data/config/MetricConfig'
import { exclude } from '../data/query/BreakdownFilter'
import { ALL, RACE, SEX } from '../data/utils/Constants'
import MissingDataAlert from './ui/MissingDataAlert'
import { urlMap } from '../utils/externalUrls'
import {
  getExclusionList,
  shouldShowAltPopCompare,
} from '../data/utils/datasetutils'
import { INCARCERATION_IDS } from '../data/providers/IncarcerationProvider'
import IncarceratedChildrenShortAlert from './ui/IncarceratedChildrenShortAlert'
import type { Row } from '../data/utils/DatasetTypes'
import { useGuessPreloadHeight } from '../utils/hooks/useGuessPreloadHeight'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import {
  DATATYPES_NEEDING_13PLUS,
  GENDER_METRICS,
} from '../data/providers/HivProvider'
import GenderDataShortAlert from './ui/GenderDataShortAlert'
import type { ElementHashIdHiddenOnScreenshot } from '../utils/hooks/useDownloadCardImage'
import type { CountColsMap } from '../charts/mapGlobals'
import HetNotice from '../styles/HetComponents/HetNotice'
import { generateSubtitle } from '../charts/utils'
import HetDivider from '../styles/HetComponents/HetDivider'

// We need to get this property, but we want to show it as
// part of the "population_pct" column, and not as its own column
export const NEVER_SHOW_PROPERTIES = [
  METRIC_CONFIG.covid_vaccinations[0]?.metrics?.pct_share
    ?.secondaryPopulationComparisonMetric,
]

interface TableCardProps {
  fips: Fips
  demographicType: DemographicType
  dataTypeConfig: DataTypeConfig
  reportTitle: string
  className?: string
}

export default function TableCard(props: TableCardProps) {
  const preloadHeight = useGuessPreloadHeight(
    [700, 1500],
    props.demographicType === SEX,
  )

  const metrics = getRateAndPctShareMetrics(props.dataTypeConfig)

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.demographicType,
    exclude(
      ...getExclusionList(
        props.dataTypeConfig,
        props.demographicType,
        props.fips,
      ),
    ),
  )

  const metricConfigs: Partial<Record<MetricId, MetricConfig>> = {}
  metrics.forEach((metricConfig) => {
    // We prefer known breakdown metric if available.
    if (metricConfig.knownBreakdownComparisonMetric) {
      metricConfigs[metricConfig.knownBreakdownComparisonMetric.metricId] =
        metricConfig.knownBreakdownComparisonMetric
    } else {
      metricConfigs[metricConfig.metricId] = metricConfig
    }

    if (metricConfig.populationComparisonMetric) {
      metricConfigs[metricConfig.populationComparisonMetric.metricId] =
        metricConfig.populationComparisonMetric
    }

    if (metricConfig.secondaryPopulationComparisonMetric) {
      metricConfigs[metricConfig.secondaryPopulationComparisonMetric.metricId] =
        metricConfig.secondaryPopulationComparisonMetric
    }
  })
  const isIncarceration = INCARCERATION_IDS.includes(
    props.dataTypeConfig.dataTypeId,
  )
  const isHIV = DATATYPES_NEEDING_13PLUS.includes(
    props.dataTypeConfig.dataTypeId,
  )
  const metricIds = Object.keys(metricConfigs) as MetricId[]
  isIncarceration && metricIds.push('total_confined_children')

  if (isHIV) {
    metricIds.push(...GENDER_METRICS)
  }

  const countColsMap: CountColsMap = {
    numeratorConfig: metrics[0]?.rateNumeratorMetric,
    denominatorConfig: metrics[0]?.rateDenominatorMetric,
  }
  countColsMap?.numeratorConfig &&
    metricIds.push(countColsMap.numeratorConfig.metricId)
  countColsMap?.denominatorConfig &&
    metricIds.push(countColsMap.denominatorConfig.metricId)

  const query = new MetricQuery(
    metricIds,
    breakdowns,
    /* dataTypeId */ props.dataTypeConfig.dataTypeId,
    /* timeView */ 'current',
  )

  const displayingCovidData = metrics
    .map((config) => config.metricId)
    .some((metricId) => metricId.includes('covid_'))

  const HASH_ID: ScrollableHashId = 'data-table'

  const elementsToHide: ElementHashIdHiddenOnScreenshot[] = [
    '#card-options-menu',
  ]

  const subtitle = generateSubtitle(
    ALL,
    props.demographicType,
    props.dataTypeConfig,
  )

  return (
    <CardWrapper
      downloadTitle={`Table card for ${
        props.dataTypeConfig.fullDisplayName
      } in ${props.fips.getSentenceDisplayName()}`}
      minHeight={preloadHeight}
      queries={[query]}
      scrollToHash={HASH_ID}
      reportTitle={props.reportTitle}
      elementsToHide={elementsToHide}
      className={props.className}
    >
      {([queryResponse]) => {
        let data = queryResponse.data
        if (shouldShowAltPopCompare(props)) data = fillInAltPops(data)
        let normalMetricIds = metricIds

        // revert metric ids to normal data structure, and revert "displayed" rows to exclude ALLs
        if (isIncarceration) {
          normalMetricIds = metricIds.filter(
            (id) => id !== 'total_confined_children',
          )
          data = data.filter((row: Row) => row[props.demographicType] !== ALL)
        }

        const showMissingDataAlert =
          queryResponse.shouldShowMissingDataMessage(normalMetricIds) ||
          data.length <= 0

        return (
          <>
            {!queryResponse.dataIsMissing() && data.length > 0 && (
              <TableChart
                countColsMap={countColsMap}
                data={data}
                demographicType={props.demographicType}
                metrics={Object.values(metricConfigs).filter(
                  (colName) => !NEVER_SHOW_PROPERTIES.includes(colName),
                )}
                dataTypeId={props.dataTypeConfig.dataTypeId}
                fips={props.fips}
                dataTableTitle={
                  props.dataTypeConfig.dataTableTitle ?? 'Summary'
                }
                subtitle={subtitle}
              />
            )}

            {isIncarceration && (
              <IncarceratedChildrenShortAlert
                fips={props.fips}
                queryResponse={queryResponse}
                demographicType={props.demographicType}
              />
            )}
            {isHIV && (
              <GenderDataShortAlert
                fips={props.fips}
                queryResponse={queryResponse}
                demographicType={props.demographicType}
                dataTypeId={props.dataTypeConfig.dataTypeId}
              />
            )}
            {showMissingDataAlert && (
              <MissingDataAlert
                dataName={props.dataTypeConfig.fullDisplayName + ' '}
                demographicTypeString={
                  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]
                }
                fips={props.fips}
              />
            )}
            {!queryResponse.dataIsMissing() &&
              displayingCovidData &&
              props.demographicType === RACE && (
                <>
                  <HetNotice kind='data-integrity' id='AIAN-alert'>
                    Share of COVID-19 cases reported for American Indian, Alaska
                    Native, Native Hawaiian and Pacific Islander are
                    underrepresented at the national level and in many states
                    because these racial categories are often not recorded. The
                    Urban Indian Health Institute publishes{' '}
                    <a
                      target='_blank'
                      rel='noopener noreferrer'
                      href={urlMap.uihiBestPractice}
                    >
                      guidelines for American Indian and Alaska Native Data
                      Collection
                    </a>
                    .
                  </HetNotice>
                  <HetDivider />
                </>
              )}
          </>
        )
      }}
    </CardWrapper>
  )
}

function fillInAltPops(data: any[]) {
  // This should only happen in the vaccine kff state case
  return data.map((item) => {
    const { vaccinatedPopPct, acsVaccinatedPopPct, ...restOfItem } = item
    return {
      vaccinated_pop_pct: vaccinatedPopPct || acsVaccinatedPopPct,
      ...restOfItem,
    }
  })
}
