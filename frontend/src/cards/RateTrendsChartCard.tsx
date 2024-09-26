import { useState } from 'react'
import type { Fips } from '../data/utils/Fips'
import {
  Breakdowns,
  type DemographicType,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
} from '../data/query/Breakdowns'
import { MetricQuery } from '../data/query/MetricQuery'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import CardWrapper from './CardWrapper'
import { TrendsChart } from '../charts/trendsChart/Index'
import { exclude } from '../data/query/BreakdownFilter'
import {
  type DemographicGroup,
  NON_HISPANIC,
  AIAN_API,
  ALL,
} from '../data/utils/Constants'
import MissingDataAlert from './ui/MissingDataAlert'
import { splitIntoKnownsAndUnknowns } from '../data/utils/datasetutils'
import {
  getNestedData,
  getNestedUnknowns,
} from '../data/utils/DatasetTimeUtils'
import AltTableView from './ui/AltTableView'
import UnknownBubblesAlert from './ui/UnknownBubblesAlert'
import { reportProviderSteps } from '../reports/ReportProviderSteps'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import { CAWP_METRICS, getWomenRaceLabel } from '../data/providers/CawpProvider'
import type { HetRow } from '../data/utils/DatasetTypes'
import { hasNonZeroUnknowns } from '../charts/trendsChart/helpers'
import { HIV_METRICS } from '../data/providers/HivProvider'
import Hiv2020Alert from './ui/Hiv2020Alert'
import ChartTitle from './ChartTitle'
import type { ElementHashIdHiddenOnScreenshot } from '../utils/hooks/useDownloadCardImage'
import UnknownPctRateGradient from './UnknownPctRateGradient'
import { generateSubtitle } from '../charts/utils'

/* minimize layout shift */
const PRELOAD_HEIGHT = 668

interface RateTrendsChartCardProps {
  key?: string
  demographicType: DemographicType
  dataTypeConfig: DataTypeConfig
  fips: Fips
  isCompareCard?: boolean
  reportTitle: string
  className?: string
}

// Intentionally removed key wrapper found in other cards as 2N prefers card not re-render
// and instead D3 will handle updates to the data
export default function RateTrendsChartCard(props: RateTrendsChartCardProps) {
  // Manages which group filters user has applied
  const [selectedTableGroups, setSelectedTableGroups] = useState<
    DemographicGroup[]
  >([])

  const [a11yTableExpanded, setA11yTableExpanded] = useState(false)
  const [unknownsExpanded, setUnknownsExpanded] = useState(false)

  const metricConfigRates =
    props.dataTypeConfig.metrics?.per100k ??
    props.dataTypeConfig.metrics?.pct_rate ??
    props.dataTypeConfig.metrics?.index

  if (!metricConfigRates) return <></>

  const metricConfigPctShares =
    props.dataTypeConfig.metrics?.pct_share_unknown ??
    props.dataTypeConfig.metrics?.pct_share

  let hasUnknowns = Boolean(metricConfigPctShares)

  const isWisqarsByRace =
    props.dataTypeConfig.categoryId === 'community-safety' &&
    props.demographicType === 'race_and_ethnicity'

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.demographicType,
    exclude(NON_HISPANIC, AIAN_API),
  )

  const ratesQuery = new MetricQuery(
    metricConfigRates.metricId,
    breakdowns,
    /* dataTypeId */ props.dataTypeConfig.dataTypeId,
    /* timeView */ 'historical',
  )

  // get pct_share with unknown demographic for optional bubble chart
  const pctShareQuery =
    metricConfigPctShares &&
    new MetricQuery(
      metricConfigPctShares.metricId,
      breakdowns,
      /* dataTypeId */ props.dataTypeConfig.dataTypeId,
      /* timeView */ 'historical',
    )

  const queries = [ratesQuery]

  pctShareQuery && queries.push(pctShareQuery)

  function getTitleText() {
    return `${
      metricConfigRates?.trendsCardTitleName ??
      props.dataTypeConfig.fullDisplayName + ' over time '
    } in ${props.fips.getSentenceDisplayName()}`
  }

  const subtitle = generateSubtitle(
    ALL,
    props.demographicType,
    props.dataTypeConfig,
  )

  const isCawp = CAWP_METRICS.includes(metricConfigRates.metricId)
  const isCawpStateLeg = metricConfigRates.metricId === 'pct_share_of_state_leg'

  const isHIV = HIV_METRICS.includes(metricConfigRates.metricId)

  const HASH_ID: ScrollableHashId = 'rates-over-time'
  const cardHeaderTitle = reportProviderSteps[HASH_ID].label

  const elementsToHide: ElementHashIdHiddenOnScreenshot[] = [
    '#card-options-menu',
  ]

  return (
    <CardWrapper
      downloadTitle={getTitleText()}
      queries={queries}
      minHeight={PRELOAD_HEIGHT}
      scrollToHash={HASH_ID}
      reportTitle={props.reportTitle}
      elementsToHide={elementsToHide}
      expanded={a11yTableExpanded}
      className={props.className}
    >
      {([queryResponseRates, queryResponsePctShares]) => {
        const ratesData = queryResponseRates.getValidRowsForField(
          metricConfigRates.metricId,
        )

        const pctShareData = isCawp
          ? ratesData
          : metricConfigPctShares &&
            queryResponsePctShares.getValidRowsForField(
              metricConfigPctShares.metricId,
            )

        // swap race labels if applicable
        const ratesDataLabelled = isCawp
          ? ratesData.map((row: HetRow) => {
              const altRow = { ...row }
              altRow.race_and_ethnicity = getWomenRaceLabel(
                row.race_and_ethnicity,
              )
              return altRow
            })
          : ratesData

        // retrieve list of all present demographic groups
        const allDemographicGroups: DemographicGroup[] =
          queryResponseRates.getFieldValues(
            props.demographicType,
            metricConfigRates.metricId,
          ).withData

        const demographicGroups = isCawpStateLeg
          ? allDemographicGroups
          : allDemographicGroups.filter((group) => group !== 'Unknown race')

        const demographicGroupsLabelled = isCawp
          ? demographicGroups.map((race) => getWomenRaceLabel(race))
          : demographicGroups

        // we want to send Unknowns as Knowns for CAWP so we can plot as a line as well
        const [knownRatesData] = isCawp
          ? [ratesDataLabelled]
          : splitIntoKnownsAndUnknowns(ratesDataLabelled, props.demographicType)

        // rates for the unknown bubbles
        const [, unknownPctShareData] = splitIntoKnownsAndUnknowns(
          pctShareData,
          props.demographicType,
        )

        const nestedRatesData = getNestedData(
          knownRatesData,
          demographicGroupsLabelled,
          props.demographicType,
          metricConfigRates.metricId,
        )
        const nestedUnknownPctShareData = getNestedUnknowns(
          unknownPctShareData,
          isCawp ? metricConfigRates.metricId : metricConfigPctShares?.metricId,
        )

        hasUnknowns =
          nestedUnknownPctShareData != null &&
          hasNonZeroUnknowns(nestedUnknownPctShareData)

        return (
          <>
            {queryResponseRates.shouldShowMissingDataMessage([
              metricConfigRates.metricId,
            ]) || nestedRatesData?.length === 0 ? (
              <>
                {/* Chart Title Missing Data */}
                <ChartTitle title={'Graph unavailable: ' + getTitleText()} />
                <MissingDataAlert
                  dataName={`historical data for ${metricConfigRates.chartTitle}`}
                  demographicTypeString={
                    DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]
                  }
                  fips={props.fips}
                />
              </>
            ) : (
              <>
                {/* ensure we don't render two of these in compare mode */}
                {!props.isCompareCard && <UnknownPctRateGradient />}
                <TrendsChart
                  data={nestedRatesData}
                  chartTitle={getTitleText()}
                  chartSubTitle={subtitle}
                  unknown={nestedUnknownPctShareData}
                  axisConfig={{
                    type: metricConfigRates.type,
                    groupLabel:
                      DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[
                        props.demographicType
                      ],
                    yAxisLabel: `${metricConfigRates.shortLabel} ${
                      props.fips.isUsa() ? '' : 'from'
                    } ${
                      props.fips.isUsa()
                        ? ''
                        : props.fips.getSentenceDisplayName()
                    }`,
                    xAxisIsMonthly:
                      metricConfigRates.timeSeriesCadence === 'monthly',
                  }}
                  demographicType={props.demographicType}
                  setSelectedTableGroups={setSelectedTableGroups}
                  isCompareCard={props.isCompareCard ?? false}
                  expanded={unknownsExpanded}
                  setExpanded={setUnknownsExpanded}
                  hasUnknowns={hasUnknowns}
                />
                {isWisqarsByRace && (
                  <MissingDataAlert
                    dataName={`single-race historical data earlier than 2018 for ${metricConfigRates.chartTitle}`}
                    demographicTypeString={
                      DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[
                        props.demographicType
                      ]
                    }
                    fips={props.fips}
                  />
                )}
                {hasUnknowns && (
                  <UnknownBubblesAlert
                    demographicType={props.demographicType}
                    fullDisplayName={
                      props.dataTypeConfig.fullDisplayNameInline ??
                      props.dataTypeConfig.fullDisplayName
                    }
                    expanded={unknownsExpanded}
                    setExpanded={setUnknownsExpanded}
                  />
                )}

                <AltTableView
                  expanded={a11yTableExpanded}
                  setExpanded={setA11yTableExpanded}
                  expandBoxLabel={`${cardHeaderTitle.toLowerCase()} table`}
                  tableCaption={`${getTitleText()} by ${
                    DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]
                  }`}
                  knownsData={knownRatesData}
                  unknownsData={unknownPctShareData}
                  demographicType={props.demographicType}
                  knownMetricConfig={metricConfigRates}
                  unknownMetricConfig={metricConfigPctShares}
                  selectedGroups={selectedTableGroups}
                  hasUnknowns={isCawp ? false : hasUnknowns}
                  isCompareCard={props.isCompareCard}
                />
              </>
            )}
            {isHIV && <Hiv2020Alert />}
          </>
        )
      }}
    </CardWrapper>
  )
}
