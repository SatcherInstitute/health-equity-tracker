import type { CountColsMap } from '../charts/mapGlobals'
import { TableChart } from '../charts/TableChart'
import { generateSubtitle } from '../charts/utils'
import { COVID_DISEASE_METRICS } from '../data/config/MetricConfigCovidCategory'
import type {
  DataTypeConfig,
  MetricConfig,
  MetricId,
} from '../data/config/MetricConfigTypes'
import {
  getMetricIdToConfigMap,
  metricConfigFromDtConfig,
} from '../data/config/MetricConfigUtils'
import {
  DATATYPES_NEEDING_13PLUS,
  GENDER_METRICS,
} from '../data/providers/HivProvider'
import { INCARCERATION_IDS } from '../data/providers/IncarcerationProvider'
import { exclude } from '../data/query/BreakdownFilter'
import {
  Breakdowns,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import { MetricQuery } from '../data/query/MetricQuery'
import { sortByIncome } from '../data/sorting/IncomeSorterStrategy'
import { ALL, RACE, SEX } from '../data/utils/Constants'
import type { HetRow } from '../data/utils/DatasetTypes'
import {
  getExclusionList,
  shouldShowAltPopCompare,
} from '../data/utils/datasetutils'
import type { Fips } from '../data/utils/Fips'
import HetDivider from '../styles/HetComponents/HetDivider'
import HetNotice from '../styles/HetComponents/HetNotice'
import { urlMap } from '../utils/externalUrls'
import { useGuessPreloadHeight } from '../utils/hooks/useGuessPreloadHeight'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import CardWrapper from './CardWrapper'
import GenderDataShortAlert from './ui/GenderDataShortAlert'
import IncarceratedChildrenShortAlert from './ui/IncarceratedChildrenShortAlert'
import MissingDataAlert from './ui/MissingDataAlert'

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

  const rateConfig = metricConfigFromDtConfig('rate', props.dataTypeConfig)
  const shareConfig = metricConfigFromDtConfig('share', props.dataTypeConfig)
  const initialMetricConfigs: MetricConfig[] = []
  rateConfig && initialMetricConfigs.push(rateConfig)
  shareConfig && initialMetricConfigs.push(shareConfig)

  const metricIdToConfigMap = getMetricIdToConfigMap(initialMetricConfigs)
  const metricIds = Object.keys(metricIdToConfigMap) as MetricId[]
  const metricConfigs = Object.values(metricIdToConfigMap)

  const isIncarceration = INCARCERATION_IDS.includes(
    props.dataTypeConfig.dataTypeId,
  )
  const isHIV = DATATYPES_NEEDING_13PLUS.includes(
    props.dataTypeConfig.dataTypeId,
  )
  isIncarceration && metricIds.push('confined_children_estimated_total')

  if (isHIV) {
    metricIds.push(...GENDER_METRICS)
  }

  const countColsMap: CountColsMap = {
    numeratorConfig: rateConfig?.rateNumeratorMetric,
    denominatorConfig: rateConfig?.rateDenominatorMetric,
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

  const displayingCovidData = COVID_DISEASE_METRICS.includes(
    props.dataTypeConfig,
  )

  const HASH_ID: ScrollableHashId = 'data-table'

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
      className={props.className}
    >
      {([queryResponse]) => {
        let data = queryResponse.data
        if (shouldShowAltPopCompare(props)) data = fillInAltPops(data)
        let normalMetricIds = metricIds

        // revert metric ids to normal data structure, and revert "displayed" rows to exclude ALLs
        if (isIncarceration) {
          normalMetricIds = metricIds.filter(
            (id) => id !== 'confined_children_estimated_total',
          )
          data = data.filter(
            (row: HetRow) => row[props.demographicType] !== ALL,
          )
        }

        const showMissingDataAlert =
          queryResponse.shouldShowMissingDataMessage(normalMetricIds) ||
          data.length <= 0

        if (props.demographicType === 'income') {
          data = sortByIncome(data)
        }

        return (
          <>
            {!queryResponse.dataIsMissing() && data.length > 0 && (
              <TableChart
                countColsMap={countColsMap}
                data={data}
                demographicType={props.demographicType}
                metricConfigs={metricConfigs}
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
