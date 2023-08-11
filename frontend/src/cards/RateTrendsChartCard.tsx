import { useState } from 'react'
import { CardContent } from '@mui/material'
import { type Fips } from '../data/utils/Fips'
import {
  Breakdowns,
  type DemographicType,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
} from '../data/query/Breakdowns'
import { MetricQuery } from '../data/query/MetricQuery'
import { type DataTypeConfig } from '../data/config/MetricConfig'
import CardWrapper from './CardWrapper'
import { TrendsChart } from '../charts/trendsChart/Index'
import { exclude } from '../data/query/BreakdownFilter'
import {
  type DemographicGroup,
  TIME_SERIES,
  NON_HISPANIC,
  AIAN_API,
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
import { type ScrollableHashId } from '../utils/hooks/useStepObserver'
import {
  CAWP_DETERMINANTS,
  getWomenRaceLabel,
} from '../data/providers/CawpProvider'
import { type Row } from '../data/utils/DatasetTypes'
import { hasNonZeroUnknowns } from '../charts/trendsChart/helpers'
import styles from '../charts/trendsChart/Trends.module.scss'
import { HIV_DETERMINANTS } from '../data/providers/HivProvider'
import Hiv2020Alert from './ui/Hiv2020Alert'

/* minimize layout shift */
const PRELOAD_HEIGHT = 668

export interface RateTrendsChartCardProps {
  key?: string
  demographicType: DemographicType
  dataTypeConfig: DataTypeConfig
  fips: Fips
  isCompareCard?: boolean
  reportTitle: string
}

// Intentionally removed key wrapper found in other cards as 2N prefers card not re-render
// and instead D3 will handle updates to the data
export function RateTrendsChartCard(props: RateTrendsChartCardProps) {
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

  const metricConfigPctShares = props.dataTypeConfig.metrics.pct_share

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.demographicType,
    exclude(NON_HISPANIC, AIAN_API)
  )

  const ratesQuery = new MetricQuery(
    metricConfigRates.metricId,
    breakdowns,
    /* dataTypeId */ props.dataTypeConfig.dataTypeId,
    /* timeView */ TIME_SERIES
  )
  const pctShareQuery = new MetricQuery(
    metricConfigPctShares.metricId,
    breakdowns,
    /* dataTypeId */ props.dataTypeConfig.dataTypeId,
    /* timeView */ TIME_SERIES
  )

  function getTitleText() {
    return `${
      metricConfigRates?.trendsCardTitleName ?? 'Data'
    } in ${props.fips.getSentenceDisplayName()}`
  }

  const isCawp = CAWP_DETERMINANTS.includes(metricConfigRates.metricId)
  const isCawpStateLeg = metricConfigRates.metricId === 'pct_share_of_state_leg'

  const isHIV = HIV_DETERMINANTS.includes(metricConfigRates.metricId)

  const HASH_ID: ScrollableHashId = 'rates-over-time'
  const cardHeaderTitle = reportProviderSteps[HASH_ID].label

  const elementsToHide = ['#card-options-menu']

  return (
    <CardWrapper
      downloadTitle={getTitleText()}
      queries={[ratesQuery, pctShareQuery]}
      minHeight={PRELOAD_HEIGHT}
      scrollToHash={HASH_ID}
      reportTitle={props.reportTitle}
      elementsToHide={elementsToHide}
      expanded={a11yTableExpanded}
    >
      {([queryResponseRates, queryResponsePctShares]) => {
        const ratesData = queryResponseRates.getValidRowsForField(
          metricConfigRates.metricId
        )

        const pctShareData = isCawp
          ? ratesData
          : queryResponsePctShares.getValidRowsForField(
              metricConfigPctShares.metricId
            )

        // swap race labels if applicable
        const ratesDataLabelled = isCawp
          ? ratesData.map((row: Row) => {
              const altRow = { ...row }
              altRow.race_and_ethnicity = getWomenRaceLabel(
                row.race_and_ethnicity
              )
              return altRow
            })
          : ratesData

        // retrieve list of all present demographic groups
        const allDemographicGroups: DemographicGroup[] =
          queryResponseRates.getFieldValues(
            props.demographicType,
            metricConfigRates.metricId
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
          props.demographicType
        )

        const nestedRatesData = getNestedData(
          knownRatesData,
          demographicGroupsLabelled,
          props.demographicType,
          metricConfigRates.metricId
        )
        const nestedUnknownPctShareData = getNestedUnknowns(
          unknownPctShareData,
          isCawp ? metricConfigRates.metricId : metricConfigPctShares.metricId
        )

        const hasUnknowns = hasNonZeroUnknowns(nestedUnknownPctShareData)

        return (
          <>
            <CardContent sx={{ pt: 0 }}>
              {queryResponseRates.shouldShowMissingDataMessage([
                metricConfigRates.metricId,
              ]) || nestedRatesData.length === 0 ? (
                <>
                  <MissingDataAlert
                    dataName={`historical data for ${metricConfigRates.chartTitle}`}
                    demographicTypeString={
                      DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[
                        props.demographicType
                      ]
                    }
                    fips={props.fips}
                  />
                </>
              ) : (
                <>
                  {/* ensure we don't render two of these in compare mode */}
                  {!props.isCompareCard && (
                    <svg
                      height="0"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <linearGradient id="gradient">
                        <stop className={styles.GradientMainStop} offset="0%" />
                        <stop className={styles.GradientAltStop} offset="20%" />
                        <stop
                          className={styles.GradientMainStop}
                          offset="30%"
                        />
                        <stop className={styles.GradientAltStop} offset="40%" />
                        <stop
                          className={styles.GradientMainStop}
                          offset="50%"
                        />
                        <stop className={styles.GradientAltStop} offset="60%" />
                        <stop
                          className={styles.GradientMainStop}
                          offset="70%"
                        />
                        <stop className={styles.GradientAltStop} offset="80%" />
                        <stop
                          className={styles.GradientMainStop}
                          offset="90%"
                        />
                        <stop
                          className={styles.GradientAltStop}
                          offset="100%"
                        />
                      </linearGradient>
                    </svg>
                  )}
                  <TrendsChart
                    data={nestedRatesData}
                    chartTitle={getTitleText()}
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
                      xAxisIsMonthly: metricConfigRates.isMonthly,
                    }}
                    demographicType={props.demographicType}
                    setSelectedTableGroups={setSelectedTableGroups}
                    isCompareCard={props.isCompareCard ?? false}
                    expanded={unknownsExpanded}
                    setExpanded={setUnknownsExpanded}
                    hasUnknowns={hasUnknowns}
                  />
                  {hasUnknowns && (
                    <CardContent>
                      <UnknownBubblesAlert
                        demographicType={props.demographicType}
                        fullDisplayName={
                          props.dataTypeConfig.fullDisplayNameInline ??
                          props.dataTypeConfig.fullDisplayName
                        }
                        expanded={unknownsExpanded}
                        setExpanded={setUnknownsExpanded}
                      />
                    </CardContent>
                  )}

                  <AltTableView
                    expanded={a11yTableExpanded}
                    setExpanded={setA11yTableExpanded}
                    expandBoxLabel={cardHeaderTitle.toLowerCase()}
                    tableCaption={`${getTitleText()} by ${
                      DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[
                        props.demographicType
                      ]
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
            </CardContent>
            {isHIV && <Hiv2020Alert />}
          </>
        )
      }}
    </CardWrapper>
  )
}
