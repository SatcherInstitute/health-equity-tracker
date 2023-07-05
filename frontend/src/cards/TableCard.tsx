import { TableChart } from '../charts/TableChart'
import CardWrapper from './CardWrapper'
import { MetricQuery } from '../data/query/MetricQuery'
import { type Fips } from '../data/utils/Fips'
import {
  Breakdowns,
  type BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from '../data/query/Breakdowns'
import { CardContent } from '@mui/material'
import {
  METRIC_CONFIG,
  type MetricConfig,
  type MetricId,
  type DataTypeConfig,
  getRateAndPctShareMetrics,
} from '../data/config/MetricConfig'
import { exclude } from '../data/query/BreakdownFilter'
import { ALL, RACE } from '../data/utils/Constants'
import MissingDataAlert from './ui/MissingDataAlert'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import { urlMap } from '../utils/externalUrls'
import {
  getExclusionList,
  shouldShowAltPopCompare,
} from '../data/utils/datasetutils'
import styles from './Card.module.scss'
import { INCARCERATION_IDS } from '../data/providers/IncarcerationProvider'
import IncarceratedChildrenShortAlert from './ui/IncarceratedChildrenShortAlert'
import { type Row } from '../data/utils/DatasetTypes'
import { useGuessPreloadHeight } from '../utils/hooks/useGuessPreloadHeight'
import { type ScrollableHashId } from '../utils/hooks/useStepObserver'
import { CAWP_DATA_TYPES } from '../data/providers/CawpProvider'

// We need to get this property, but we want to show it as
// part of the "population_pct" column, and not as its own column
export const NEVER_SHOW_PROPERTIES = [
  METRIC_CONFIG.covid_vaccinations[0]?.metrics?.pct_share
    ?.secondaryPopulationComparisonMetric,
]

export interface TableCardProps {
  fips: Fips
  breakdownVar: BreakdownVar
  dataTypeConfig: DataTypeConfig
  reportTitle: string
}

export function TableCard(props: TableCardProps) {
  const preloadHeight = useGuessPreloadHeight(
    [700, 1500],
    props.breakdownVar === 'sex'
  )

  const metrics = getRateAndPctShareMetrics(props.dataTypeConfig)

  const isCawp = CAWP_DATA_TYPES.includes(props.dataTypeConfig.dataTypeId)

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    exclude(
      ...getExclusionList(props.dataTypeConfig, props.breakdownVar, props.fips)
    )
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
    props.dataTypeConfig.dataTypeId
  )

  const metricIds = Object.keys(metricConfigs) as MetricId[]
  isIncarceration && metricIds.push('total_confined_children')
  const query = new MetricQuery(
    metricIds,
    breakdowns,
    /* dataTypeId */ props.dataTypeConfig.dataTypeId,
    /* timeView */ isCawp ? 'cross_sectional' : undefined
  )

  const displayingCovidData = metrics
    .map((config) => config.metricId)
    .some((metricId) => metricId.includes('covid_'))

  const HASH_ID: ScrollableHashId = 'data-table'

  return (
    <CardWrapper
      downloadTitle={`Table card for ${
        props.dataTypeConfig.fullDisplayName
      } in ${props.fips.getSentenceDisplayName()}`}
      minHeight={preloadHeight}
      queries={[query]}
      scrollToHash={HASH_ID}
      reportTitle={props.reportTitle}
    >
      {([queryResponse]) => {
        let data = queryResponse.data
        if (shouldShowAltPopCompare(props)) data = fillInAltPops(data)
        let normalMetricIds = metricIds

        // revert metric ids to normal data structure, and revert "displayed" rows to exclude ALLs
        if (isIncarceration) {
          normalMetricIds = metricIds.filter(
            (id) => id !== 'total_confined_children'
          )
          data = data.filter((row: Row) => row[props.breakdownVar] !== ALL)
        }

        const showMissingDataAlert =
          queryResponse.shouldShowMissingDataMessage(normalMetricIds) ||
          data.length <= 0

        return (
          <>
            {!queryResponse.dataIsMissing() && data.length > 0 && (
              <div className={styles.TableChart}>
                <TableChart
                  data={data}
                  breakdownVar={props.breakdownVar}
                  metrics={Object.values(metricConfigs).filter(
                    (colName) => !NEVER_SHOW_PROPERTIES.includes(colName)
                  )}
                  dataTypeId={props.dataTypeConfig.dataTypeId}
                  fips={props.fips}
                  dataTableTitle={
                    props.dataTypeConfig.dataTableTitle ?? 'Breakdown Summary'
                  }
                />
              </div>
            )}

            {isIncarceration && (
              <IncarceratedChildrenShortAlert
                fips={props.fips}
                queryResponse={queryResponse}
                breakdownVar={props.breakdownVar}
              />
            )}

            {showMissingDataAlert && (
              <CardContent>
                <MissingDataAlert
                  dataName={props.dataTypeConfig.fullDisplayName + ' '}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar]
                  }
                  fips={props.fips}
                />
              </CardContent>
            )}
            {!queryResponse.dataIsMissing() &&
              displayingCovidData &&
              props.breakdownVar === RACE && (
                <>
                  <CardContent>
                    <Alert severity="warning" role="note" id="AIAN-alert">
                      Share of COVID-19 cases reported for American Indian,
                      Alaska Native, Native Hawaiian and Pacific Islander are
                      underrepresented at the national level and in many states
                      because these racial categories are often not recorded.
                      The Urban Indian Health Institute publishes{' '}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={urlMap.uihiBestPractice}
                      >
                        guidelines for American Indian and Alaska Native Data
                        Collection
                      </a>
                      .
                    </Alert>
                  </CardContent>
                  <Divider />
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
