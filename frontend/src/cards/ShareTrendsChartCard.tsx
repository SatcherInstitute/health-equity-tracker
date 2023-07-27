import { useState } from 'react'
import { CardContent, Alert } from '@mui/material'
import { type Fips } from '../data/utils/Fips'
import {
  Breakdowns,
  type BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from '../data/query/Breakdowns'
import { MetricQuery } from '../data/query/MetricQuery'
import { type DataTypeConfig } from '../data/config/MetricConfig'
import CardWrapper from './CardWrapper'
import { TrendsChart } from '../charts/trendsChart/Index'
import { exclude } from '../data/query/BreakdownFilter'
import {
  ALL,
  type DemographicGroup,
  TIME_SERIES,
  NON_HISPANIC,
  UNKNOWN_LABELS,
} from '../data/utils/Constants'
import MissingDataAlert from './ui/MissingDataAlert'
import { splitIntoKnownsAndUnknowns } from '../data/utils/datasetutils'
import {
  getNestedData,
  getNestedUnknowns,
} from '../data/utils/DatasetTimeUtils'
import { HashLink } from 'react-router-hash-link'
import { METHODOLOGY_TAB_LINK } from '../utils/internalRoutes'
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
import { generateChartTitle } from '../charts/utils'

/* minimize layout shift */
const PRELOAD_HEIGHT = 668

export interface ShareTrendsChartCardProps {
  key?: string
  breakdownVar: BreakdownVar
  dataTypeConfig: DataTypeConfig
  fips: Fips
  isCompareCard?: boolean
  reportTitle: string
}

// Intentionally removed key wrapper found in other cards as 2N prefers card not re-render
// and instead D3 will handle updates to the data
export function ShareTrendsChartCard(props: ShareTrendsChartCardProps) {
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
    props.breakdownVar,
    exclude(NON_HISPANIC, ALL)
  )

  const inequityQuery = metricConfigInequitable?.metricId
    ? new MetricQuery(
        metricConfigInequitable.metricId,
        breakdowns,
        /* dataTypeId */ props.dataTypeConfig.dataTypeId,
        /* timeView */ TIME_SERIES
      )
    : null

  const pctShareQuery = new MetricQuery(
    metricConfigPctShares.metricId,
    breakdowns,
    /* dataTypeId */ props.dataTypeConfig.dataTypeId,
    /* timeView */ TIME_SERIES
  )

  const chartTitle = generateChartTitle(
    /* chartTitle: */ metricConfigInequitable?.chartTitle ?? '',
    /* fips: */ props.fips
  )

  const HASH_ID: ScrollableHashId = 'inequities-over-time'
  const cardHeaderTitle = reportProviderSteps[HASH_ID].label

  const isCawp =
    metricConfigInequitable?.metricId &&
    CAWP_DETERMINANTS.includes(metricConfigInequitable.metricId)

  if (!inequityQuery || !metricConfigInequitable?.metricId) return <></>

  const elementsToHide = ['#card-options-menu']

  return (
    <CardWrapper
      downloadTitle={chartTitle}
      queries={[inequityQuery, pctShareQuery]}
      minHeight={PRELOAD_HEIGHT}
      scrollToHash={HASH_ID}
      reportTitle={props.reportTitle}
      elementsToHide={elementsToHide}
      expanded={a11yTableExpanded}
    >
      {([queryResponseInequity, queryResponsePctShares]) => {
        const inequityData = queryResponseInequity.getValidRowsForField(
          metricConfigInequitable.metricId
        )
        const [knownData] = splitIntoKnownsAndUnknowns(
          inequityData,
          props.breakdownVar
        )

        // swap race labels if applicable
        const knownInequityData = isCawp
          ? knownData.map((row: Row) => {
              const altRow = { ...row }
              altRow.race_and_ethnicity = getWomenRaceLabel(
                row.race_and_ethnicity
              )
              return altRow
            })
          : knownData

        const pctShareData = queryResponsePctShares.getValidRowsForField(
          metricConfigPctShares.metricId
        )

        const [, unknownPctShareData] = splitIntoKnownsAndUnknowns(
          pctShareData,
          props.breakdownVar
        )

        // retrieve list of all present demographic groups
        const demographicGroups: DemographicGroup[] = queryResponseInequity
          .getFieldValues(props.breakdownVar, metricConfigInequitable.metricId)
          .withData.filter(
            (group: DemographicGroup) => !UNKNOWN_LABELS.includes(group)
          )

        const demographicGroupsLabelled = isCawp
          ? demographicGroups.map((group: DemographicGroup) =>
              getWomenRaceLabel(group)
            )
          : demographicGroups

        const nestedInequityData = getNestedData(
          knownInequityData,
          demographicGroupsLabelled,
          props.breakdownVar,
          metricConfigInequitable.metricId
        )

        const nestedUnknowns = getNestedUnknowns(
          unknownPctShareData,
          metricConfigPctShares.metricId
        )

        const hasUnknowns = hasNonZeroUnknowns(nestedUnknowns)

        const shouldShowMissingData: boolean =
          queryResponseInequity.shouldShowMissingDataMessage([
            metricConfigInequitable.metricId,
          ]) || nestedInequityData.length === 0

        return (
          <>
            <CardContent sx={{ pt: 0 }}>
              {shouldShowMissingData ? (
                <MissingDataAlert
                  dataName={chartTitle}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar]
                  }
                  fips={props.fips}
                />
              ) : (
                <>
                  <TrendsChart
                    data={nestedInequityData}
                    chartTitle={chartTitle}
                    unknown={nestedUnknowns}
                    axisConfig={{
                      type: metricConfigInequitable.type,
                      groupLabel:
                        BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[
                          props.breakdownVar
                        ],
                      xAxisIsMonthly: metricConfigInequitable.isMonthly,
                    }}
                    breakdownVar={props.breakdownVar}
                    setSelectedTableGroups={setSelectedTableGroups}
                    isCompareCard={props.isCompareCard ?? false}
                    expanded={unknownsExpanded}
                    setExpanded={setUnknownsExpanded}
                    hasUnknowns={hasUnknowns}
                  />

                  {hasUnknowns && (
                    <CardContent>
                      <UnknownBubblesAlert
                        breakdownVar={props.breakdownVar}
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
                    tableCaption={`${chartTitle} by ${
                      BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar]
                    }`}
                    knownsData={inequityData}
                    unknownsData={unknownPctShareData}
                    breakdownVar={props.breakdownVar}
                    knownMetricConfig={metricConfigInequitable}
                    unknownMetricConfig={metricConfigPctShares}
                    selectedGroups={selectedTableGroups}
                    hasUnknowns={hasUnknowns}
                    isCompareCard={props.isCompareCard}
                  />
                </>
              )}
            </CardContent>
            {!shouldShowMissingData && (
              <CardContent>
                <Alert severity="info" role="note">
                  This graph visualizes the disproportionate share of{' '}
                  {props.dataTypeConfig.fullDisplayName} as experienced by
                  different demographic groups compared to their relative shares
                  of the total population. Read more about this calculation in
                  our{' '}
                  <HashLink to={`${METHODOLOGY_TAB_LINK}#metrics`}>
                    methodology
                  </HashLink>
                  .
                </Alert>
              </CardContent>
            )}
          </>
        )
      }}
    </CardWrapper>
  )
}
