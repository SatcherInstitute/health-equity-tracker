import { useState } from 'react'
import { HashLink } from 'react-router-hash-link'
import { hasNonZeroUnknowns } from '../charts/trendsChart/helpers'
import { TrendsChart } from '../charts/trendsChart/Index'
import { generateChartTitle, generateSubtitle } from '../charts/utils'
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
  ALL,
  type DemographicGroup,
  NON_HISPANIC,
  UNKNOWN_LABELS,
} from '../data/utils/Constants'
import {
  getNestedData,
  getNestedUnknowns,
} from '../data/utils/DatasetTimeUtils'
import type { HetRow } from '../data/utils/DatasetTypes'
import { splitIntoKnownsAndUnknowns } from '../data/utils/datasetutils'
import type { Fips } from '../data/utils/Fips'
import { reportProviderSteps } from '../reports/ReportProviderSteps'
import HetNotice from '../styles/HetComponents/HetNotice'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import { METHODOLOGY_PAGE_LINK } from '../utils/internalRoutes'
import CardWrapper from './CardWrapper'
import ChartTitle from './ChartTitle'
import AltTableView from './ui/AltTableView'
import Hiv2020Alert from './ui/Hiv2020Alert'
import MissingDataAlert from './ui/MissingDataAlert'
import UnknownBubblesAlert from './ui/UnknownBubblesAlert'

/* minimize layout shift */
const PRELOAD_HEIGHT = 668

interface ShareTrendsChartCardProps {
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
export default function ShareTrendsChartCard(props: ShareTrendsChartCardProps) {
  // Manages which group filters user has applied
  const [selectedTableGroups, setSelectedTableGroups] = useState<
    DemographicGroup[]
  >([])

  const [a11yTableExpanded, setA11yTableExpanded] = useState(false)
  const [unknownsExpanded, setUnknownsExpanded] = useState(false)

  const metricConfigInequitable =
    props.dataTypeConfig.metrics.pct_relative_inequity
  const metricConfigPctShares = props.dataTypeConfig.metrics.pct_share

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.demographicType,
    exclude(NON_HISPANIC, ALL),
  )

  const inequityQuery = metricConfigInequitable?.metricId
    ? new MetricQuery(
        metricConfigInequitable.metricId,
        breakdowns,
        /* dataTypeId */ props.dataTypeConfig.dataTypeId,
        /* timeView */ 'historical',
      )
    : null

  const pctShareQuery =
    metricConfigPctShares &&
    new MetricQuery(
      metricConfigPctShares.metricId,
      breakdowns,
      /* dataTypeId */ props.dataTypeConfig.dataTypeId,
      /* timeView */ 'historical',
    )

  const chartTitle = generateChartTitle(
    /* chartTitle: */ metricConfigInequitable?.chartTitle ?? '',
    /* fips: */ props.fips,
  )

  const subtitle = generateSubtitle(
    ALL,
    props.demographicType,
    props.dataTypeConfig,
  )
  const HASH_ID: ScrollableHashId = 'inequities-over-time'
  const cardHeaderTitle = reportProviderSteps[HASH_ID].label

  const isCawp =
    metricConfigInequitable?.metricId &&
    CAWP_METRICS.includes(metricConfigInequitable.metricId)

  const isHIV =
    metricConfigInequitable?.metricId &&
    HIV_METRICS.includes(metricConfigInequitable.metricId)

  if (!inequityQuery || !metricConfigInequitable?.metricId) return <></>

  const queries = [inequityQuery]
  pctShareQuery && queries.push(pctShareQuery)

  return (
    <CardWrapper
      downloadTitle={chartTitle}
      queries={queries}
      minHeight={PRELOAD_HEIGHT}
      scrollToHash={HASH_ID}
      reportTitle={props.reportTitle}
      expanded={a11yTableExpanded}
      className={props.className}
    >
      {([queryResponseInequity, queryResponsePctShares]) => {
        const inequityData = queryResponseInequity.getValidRowsForField(
          metricConfigInequitable.metricId,
        )

        // swap race labels if applicable
        const inequityDataLabelled = isCawp
          ? inequityData.map((row: HetRow) => {
              const altRow = { ...row }
              altRow.race_and_ethnicity = getWomenRaceLabel(
                row.race_and_ethnicity,
              )
              return altRow
            })
          : inequityData

        const [knownInequityData] = isCawp
          ? [inequityDataLabelled]
          : splitIntoKnownsAndUnknowns(
              inequityDataLabelled,
              props.demographicType,
            )

        const pctShareData =
          metricConfigPctShares &&
          queryResponsePctShares.getValidRowsForField(
            metricConfigPctShares.metricId,
          )

        const [, unknownPctShareData] = splitIntoKnownsAndUnknowns(
          pctShareData,
          props.demographicType,
        )

        // retrieve list of all present demographic groups
        const demographicGroups: DemographicGroup[] = queryResponseInequity
          .getFieldValues(
            props.demographicType,
            metricConfigInequitable.metricId,
          )
          .withData.filter(
            (group: DemographicGroup) => !UNKNOWN_LABELS.includes(group),
          )

        const demographicGroupsLabelled = isCawp
          ? demographicGroups.map((group: DemographicGroup) =>
              getWomenRaceLabel(group),
            )
          : demographicGroups

        const nestedInequityData = getNestedData(
          knownInequityData,
          demographicGroupsLabelled,
          props.demographicType,
          metricConfigInequitable.metricId,
        )

        const nestedUnknowns = getNestedUnknowns(
          unknownPctShareData,
          metricConfigPctShares?.metricId,
        )

        const hasUnknowns = hasNonZeroUnknowns(nestedUnknowns)

        const shouldShowMissingData: boolean =
          queryResponseInequity.shouldShowMissingDataMessage([
            metricConfigInequitable.metricId,
          ]) || nestedInequityData.length === 0

        return (
          <>
            {shouldShowMissingData ? (
              <>
                {/* Chart Title Missing Data */}
                <ChartTitle title={'Graph unavailable: ' + chartTitle} />
                <MissingDataAlert
                  dataName={chartTitle}
                  demographicTypeString={
                    DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]
                  }
                  fips={props.fips}
                />
              </>
            ) : (
              <>
                <TrendsChart
                  data={nestedInequityData}
                  chartTitle={chartTitle}
                  chartSubTitle={subtitle}
                  unknown={nestedUnknowns}
                  axisConfig={{
                    type: metricConfigInequitable.type,
                    groupLabel:
                      DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[
                        props.demographicType
                      ],
                    xAxisTimeSeriesCadence:
                      metricConfigInequitable.timeSeriesCadence,
                  }}
                  demographicType={props.demographicType}
                  setSelectedTableGroups={setSelectedTableGroups}
                  isCompareCard={props.isCompareCard ?? false}
                  expanded={unknownsExpanded}
                  setExpanded={setUnknownsExpanded}
                  hasUnknowns={hasUnknowns}
                />

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
                  tableCaption={`${chartTitle} by ${
                    DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]
                  }`}
                  knownsData={knownInequityData}
                  unknownsData={unknownPctShareData}
                  demographicType={props.demographicType}
                  knownMetricConfig={metricConfigInequitable}
                  unknownMetricConfig={metricConfigPctShares}
                  selectedGroups={selectedTableGroups}
                  hasUnknowns={isCawp ? false : hasUnknowns}
                  isCompareCard={props.isCompareCard}
                />
              </>
            )}
            {isHIV && <Hiv2020Alert />}
            {!shouldShowMissingData && (
              <HetNotice>
                This graph visualizes the disproportionate share of{' '}
                {props.dataTypeConfig.fullDisplayName} as experienced by
                different demographic groups compared to their relative shares
                of the total population. Read more about this calculation in our{' '}
                <HashLink to={`${METHODOLOGY_PAGE_LINK}#metrics`}>
                  methodology
                </HashLink>
                .
              </HetNotice>
            )}
          </>
        )
      }}
    </CardWrapper>
  )
}
