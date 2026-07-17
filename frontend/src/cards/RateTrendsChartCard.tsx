import { useState } from 'react'
import { hasNonZeroUnknowns } from '../charts/trendsChart/helpers'
import { TrendsChart } from '../charts/trendsChart/Index'
import type { AxisConfig } from '../charts/trendsChart/types'
import { generateSubtitle } from '../charts/utils'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import { CAWP_METRICS, getWomenRaceLabel } from '../data/providers/CawpProvider'
import { HIV_METRICS } from '../data/providers/HivProvider'
import { exclude } from '../data/query/BreakdownFilter'
import {
  Breakdowns,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import { MetricQuery } from '../data/query/MetricQuery'
import {
  AIAN_API,
  ALL,
  type DemographicGroup,
  NON_HISPANIC,
  TIME_PERIOD,
} from '../data/utils/Constants'
import {
  getNestedData,
  getNestedUnknowns,
} from '../data/utils/DatasetTimeUtils'
import type { HetRow } from '../data/utils/DatasetTypes'
import { splitIntoKnownsAndUnknowns } from '../data/utils/datasetutils'
import type { Fips } from '../data/utils/Fips'
import { reportProviderSteps } from '../reports/ReportProviderSteps'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import CardWrapper from './CardWrapper'
import ChartTitle, { getChartTitleId } from './ChartTitle'
import UnknownPctRateGradient from './UnknownPctRateGradient'
import AllsFallbackAlert from './ui/AllsFallbackAlert'
import AltTableView from './ui/AltTableView'
import Hiv2020Alert from './ui/Hiv2020Alert'
import MissingDataAlert from './ui/MissingDataAlert'
import UnknownBubblesAlert from './ui/UnknownBubblesAlert'

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
    /* scrollToHashId */ 'rates-over-time',
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

  const rateComparisonConfig = metricConfigRates?.rateComparisonMetricForAlls

  const queries = [ratesQuery]

  pctShareQuery && queries.push(pctShareQuery)

  // For intersectional topics (e.g. HIV prevalence for Black women), fetch a
  // second historical series for the reference "All" population so the trend
  // chart can show both lines, mirroring what the rate bar card already does.
  const allsQueryIndex = queries.length
  if (rateComparisonConfig && props.dataTypeConfig.rateComparisonDataTypeId) {
    const breakdownsForAlls = Breakdowns.forFips(props.fips).addBreakdown(
      'sex',
      exclude('Male', 'Female'),
    )
    const allsRateQuery = new MetricQuery(
      [rateComparisonConfig.metricId],
      breakdownsForAlls,
      props.dataTypeConfig.rateComparisonDataTypeId,
      'historical',
    )
    queries.push(allsRateQuery)
  }

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

  return (
    <CardWrapper
      downloadTitle={getTitleText()}
      queries={queries}
      minHeight={PRELOAD_HEIGHT}
      scrollToHash={HASH_ID}
      reportTitle={props.reportTitle}
      expanded={a11yTableExpanded}
      className={props.className}
      isCompareCard={props.isCompareCard}
      fips={props.fips}
      dataTypeConfig={props.dataTypeConfig}
      demographicType={props.demographicType}
      selectedGroups={selectedTableGroups}
    >
      {(queryResponses, _metadata, _geoData, overrideCardHasData) => {
        const [queryResponseRates, queryResponsePctShares] = queryResponses
        const queryResponseRatesAlls = rateComparisonConfig
          ? queryResponses[allsQueryIndex]
          : undefined

        let ratesData = queryResponseRates.getValidRowsForField(
          metricConfigRates.metricId,
        )

        // For intersectional topics, rename the "All" group in the main data
        // (e.g. "All" → "All Black Women Ages 13+") and prepend a reference
        // "All" people series from the comparison dataset, giving two lines.
        if (rateComparisonConfig && queryResponseRatesAlls) {
          ratesData = ratesData.map((row) =>
            row[props.demographicType] === ALL
              ? {
                  ...row,
                  [props.demographicType]: rateComparisonConfig.shortLabel,
                }
              : row,
          )
          const allsRows = queryResponseRatesAlls.getValidRowsForField(
            rateComparisonConfig.metricId,
          )
          const referenceRows: HetRow[] = allsRows.map((allsRow) => ({
            fips: allsRow.fips,
            fips_name: allsRow.fips_name,
            [TIME_PERIOD]: allsRow[TIME_PERIOD],
            [props.demographicType]: ALL,
            [metricConfigRates.metricId]:
              allsRow[rateComparisonConfig.metricId],
          }))
          ratesData = [...referenceRows, ...ratesData]
        }

        // TODO: this is a stop-gap to deal with sketchy data. we should solve a different way
        if (
          props.dataTypeConfig.dataTypeId === 'preventable_hospitalizations'
        ) {
          ratesData = ratesData.filter((row) => row[TIME_PERIOD] >= 2016)
        }

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

        // retrieve list of all present demographic groups; for intersectional
        // topics the merged ratesData already contains both "All" and the
        // renamed label, so derive groups from the data rather than the response.
        const allDemographicGroups: DemographicGroup[] = rateComparisonConfig
          ? [
              ...new Set(
                ratesData
                  .map((row) => row[props.demographicType] as DemographicGroup)
                  .filter(Boolean),
              ),
            ]
          : queryResponseRates.getFieldValues(
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

        const keepOnlyElectionYears =
          metricConfigRates.timeSeriesCadence === 'fourYearly'

        const nestedRatesData = getNestedData(
          knownRatesData,
          demographicGroupsLabelled,
          props.demographicType,
          metricConfigRates.metricId,
          keepOnlyElectionYears,
        )

        const nestedUnknownPctShareData = getNestedUnknowns(
          unknownPctShareData,
          isCawp ? metricConfigRates.metricId : metricConfigPctShares?.metricId,
        )

        hasUnknowns =
          nestedUnknownPctShareData != null &&
          hasNonZeroUnknowns(nestedUnknownPctShareData)

        const axesConfig: AxisConfig = {
          type: metricConfigRates.type,
          groupLabel:
            DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType],
          yAxisLabel: `${metricConfigRates.shortLabel} ${
            props.fips.isUsa() ? '' : 'from'
          } ${props.fips.isUsa() ? '' : props.fips.getSentenceDisplayName()}`,
          xAxisTimeSeriesCadence: metricConfigRates.timeSeriesCadence,
        }

        const shouldShowMissingData =
          queryResponseRates.shouldShowMissingDataMessage([
            metricConfigRates.metricId,
          ]) || nestedRatesData?.length === 0

        overrideCardHasData?.(!shouldShowMissingData)

        return (
          <>
            {shouldShowMissingData ? (
              <>
                {/* Chart Title Missing Data */}
                <ChartTitle
                  id={getChartTitleId(HASH_ID, props.isCompareCard)}
                  title={'Graph unavailable: ' + getTitleText()}
                />
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
                {queryResponseRates.usedAllsFallback && (
                  <AllsFallbackAlert
                    dataName={props.dataTypeConfig.fullDisplayName}
                    demographicType={props.demographicType}
                  />
                )}
                <TrendsChart
                  chartTitleId={getChartTitleId(HASH_ID, props.isCompareCard)}
                  data={nestedRatesData}
                  chartTitle={getTitleText()}
                  chartSubTitle={subtitle}
                  unknown={nestedUnknownPctShareData}
                  axisConfig={axesConfig}
                  demographicType={props.demographicType}
                  setSelectedTableGroups={setSelectedTableGroups}
                  isCompareCard={props.isCompareCard ?? false}
                  expanded={unknownsExpanded}
                  setExpanded={setUnknownsExpanded}
                  hasUnknowns={hasUnknowns}
                  keepOnlyElectionYears={keepOnlyElectionYears}
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
