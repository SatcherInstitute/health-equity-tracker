import { Link } from 'react-router'
import { AgeAdjustedTableChart } from '../charts/AgeAdjustedTableChart'
import { generateChartTitle } from '../charts/utils'
import type { DropdownVarId } from '../data/config/DropDownIds'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type {
  DataTypeConfig,
  MetricConfig,
  MetricId,
} from '../data/config/MetricConfigTypes'
import {
  getMetricIdToConfigMap,
  metricConfigFromDtConfig,
} from '../data/config/MetricConfigUtils'
import { exclude } from '../data/query/BreakdownFilter'
import {
  Breakdowns,
  DEMOGRAPHIC_DISPLAY_TYPES,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import { MetricQuery } from '../data/query/MetricQuery'
import {
  AGE,
  ALL,
  MULTI_OR_OTHER_STANDARD_NH,
  NON_HISPANIC,
  RACE,
  type RaceAndEthnicityGroup,
  WHITE_NH,
} from '../data/utils/Constants'
import { splitIntoKnownsAndUnknowns } from '../data/utils/datasetutils'
import type { Fips } from '../data/utils/Fips'
import HetNotice from '../styles/HetComponents/HetNotice'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import { AGE_ADJUSTMENT_LINK } from '../utils/internalRoutes'
import CardWrapper from './CardWrapper'
import MissingDataAlert from './ui/MissingDataAlert'
import UnknownsAlert from './ui/UnknownsAlert'

/* minimize layout shift */
const PRELOAD_HEIGHT = 600

// choose demographic groups to exclude from the table
const exclusionList: RaceAndEthnicityGroup[] = [
  ALL,
  NON_HISPANIC,
  WHITE_NH,
  MULTI_OR_OTHER_STANDARD_NH,
]

interface AgeAdjustedTableCardProps {
  fips: Fips
  dataTypeConfig: DataTypeConfig
  demographicType: DemographicType
  dropdownVarId?: DropdownVarId
  reportTitle: string
}

export default function AgeAdjustedTableCard(props: AgeAdjustedTableCardProps) {
  const raceBreakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    RACE,
    exclude(...exclusionList),
  )

  const ageBreakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    AGE,
    exclude(...exclusionList),
  )

  const ageAdjustedRatioMetric = metricConfigFromDtConfig(
    'ratio',
    props.dataTypeConfig,
  )
  const metricPctShare = metricConfigFromDtConfig('share', props.dataTypeConfig)
  const metricConfigs: MetricConfig[] = []
  ageAdjustedRatioMetric && metricConfigs.push(ageAdjustedRatioMetric)
  metricPctShare && metricConfigs.push(metricPctShare)
  const metricIdToConfigMap = getMetricIdToConfigMap(metricConfigs)
  const metricIds = Object.keys(metricIdToConfigMap) as MetricId[]

  const raceQuery = new MetricQuery(
    /* metricIds */ metricIds,
    /* breakdowns */ raceBreakdowns,
    /* dataTypeId */ props.dataTypeConfig.dataTypeId,
    /* timeView */ 'current',
  )
  const ageQuery = new MetricQuery(
    /* metricIds */ metricIds,
    /* breakdowns */ ageBreakdowns,
    /* dataTypeId */ props.dataTypeConfig.dataTypeId,
    /* timeView */ 'current',
  )

  const queries = [raceQuery, ageQuery].filter(
    (query) => query.metricIds.length > 0,
  )
  const ratioId = metricIds[0]
  const ratioConfigs: MetricConfig[] = Object.values(
    metricIdToConfigMap,
  ).filter((config) => config.type === 'age_adjusted_ratio')

  const chartTitle = metricIdToConfigMap?.[ratioId]?.chartTitle
    ? generateChartTitle(metricIdToConfigMap[ratioId].chartTitle, props.fips)
    : `Age-adjusted Ratios for ${props.dataTypeConfig.fullDisplayName}`

  // collect data types from the currently selected condition that offer age-adjusted ratios
  const dropdownId: DropdownVarId | null = props.dropdownVarId ?? null
  const ageAdjustedDataTypes: DataTypeConfig[] = dropdownId
    ? METRIC_CONFIG[dropdownId]?.filter((dataType) => {
        // TODO: once every data type has a unique dataTypeId across all topics, we can simply check if that id is in the dataTypeLinkMap
        return dataType?.metrics?.age_adjusted_ratio
      })
    : []

  const HASH_ID: ScrollableHashId = 'age-adjusted-ratios'

  return (
    <CardWrapper
      downloadTitle={chartTitle}
      isCensusNotAcs={props.dropdownVarId === 'covid'}
      minHeight={PRELOAD_HEIGHT}
      queries={queries}
      scrollToHash={HASH_ID}
      reportTitle={props.reportTitle}
    >
      {(queries) => {
        if (queries.length < 2)
          return (
            <MissingDataAlert
              demographicTypeString={
                DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]
              }
              dataName={chartTitle}
              fips={props.fips}
            />
          )

        const [raceQueryResponse, ageQueryResponse] = queries

        // round ratios to 1 decimal place
        const roundedData = raceQueryResponse.data.map((row) => ({
          ...row,
          [ratioId]: row[ratioId]?.toFixed(1) ?? null,
        }))

        const [knownRaceData] = splitIntoKnownsAndUnknowns(roundedData, RACE)

        const demosShowingAgeAdjusted: DemographicType[] = [
          'age',
          'race_and_ethnicity',
        ]

        const isWrongDemographicType = !demosShowingAgeAdjusted.includes(
          props.demographicType,
        )
        const noRatios = knownRaceData.every(
          (row) => row[ratioId] === undefined,
        )

        return (
          <>
            {metricPctShare && (
              <UnknownsAlert
                metricConfig={metricPctShare}
                queryResponse={raceQueryResponse}
                demographicType={
                  props.demographicType === AGE ||
                  props.demographicType === RACE
                    ? RACE
                    : props.demographicType
                }
                ageQueryResponse={ageQueryResponse}
                displayType='table'
                known={true}
                overrideAndWithOr={props.demographicType === RACE}
                fips={props.fips}
              />
            )}

            {/* If TABLE can't display for any of these various reasons, show the missing data alert */}
            {(noRatios ||
              isWrongDemographicType ||
              raceQueryResponse.dataIsMissing() ||
              raceQueryResponse.shouldShowMissingDataMessage(metricIds)) && (
              <MissingDataAlert
                dataName={chartTitle}
                demographicTypeString={
                  DEMOGRAPHIC_DISPLAY_TYPES[props.demographicType]
                }
                ageAdjustedDataTypes={ageAdjustedDataTypes}
                fips={props.fips}
              />
            )}

            {/* values are present or partially null, implying we have at least some age-adjustments */}
            {!raceQueryResponse.dataIsMissing() &&
              !noRatios &&
              !isWrongDemographicType && (
                <AgeAdjustedTableChart
                  data={knownRaceData}
                  metricConfigs={ratioConfigs}
                  title={chartTitle}
                />
              )}
            {/* Always show info on what age-adj is */}
            <HetNotice>
              Age-adjustment is a statistical process applied to rates of
              disease, death, or other health outcomes that correlate with an
              individual's age. Adjusting for age allows for fairer comparison
              between populations, where age might be a confounding risk factor
              and the studied groups have different distributions of individuals
              per age group. By normalizing for age, we can paint a more
              accurate picture of undue burden of disease and death between
              populations. More details can be found in our{' '}
              <Link to={AGE_ADJUSTMENT_LINK}>age-adjustment methodology</Link>.
            </HetNotice>
          </>
        )
      }}
    </CardWrapper>
  )
}
