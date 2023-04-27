import { CardContent, useMediaQuery, useTheme } from '@mui/material'
import { ChoroplethMap } from '../charts/ChoroplethMap'
import { Fips } from '../data/utils/Fips'
import { type MetricId, type VariableConfig } from '../data/config/MetricConfig'
import { type Row } from '../data/utils/DatasetTypes'
import CardWrapper from './CardWrapper'
import { MetricQuery } from '../data/query/MetricQuery'
import MissingDataAlert from './ui/MissingDataAlert'
import {
  Breakdowns,
  type BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from '../data/query/Breakdowns'
import {
  UNKNOWN,
  UNKNOWN_RACE,
  UNKNOWN_ETHNICITY,
  ALL,
  RACE,
} from '../data/utils/Constants'
import Alert from '@mui/material/Alert'
import UnknownsAlert from './ui/UnknownsAlert'
import { useGuessPreloadHeight } from '../utils/hooks/useGuessPreloadHeight'
import { useLocation } from 'react-router-dom'
import { type ScrollableHashId } from '../utils/hooks/useStepObserver'
import { useCreateChartTitle } from '../utils/hooks/useCreateChartTitle'
import { CAWP_DATA_TYPES } from '../data/variables/CawpProvider'
import TerritoryCircles from './ui/TerritoryCircles'

export interface UnknownsMapCardProps {
  // Variable the map will evaluate for unknowns
  variableConfig: VariableConfig
  // Breakdown value to evaluate for unknowns
  currentBreakdown: BreakdownVar
  // Geographic region of maps
  fips: Fips
  // Updates the madlib
  updateFipsCallback: (fips: Fips) => void
  // replaces race AND ethnicity with race OR ethnicity on unknowns map title and alerts
  overrideAndWithOr?: boolean
}

// This wrapper ensures the proper key is set to create a new instance when required (when
// the props change and the state needs to be reset) rather than relying on the card caller.
export function UnknownsMapCard(props: UnknownsMapCardProps) {
  return (
    <UnknownsMapCardWithKey
      key={props.currentBreakdown + props.variableConfig.variableId}
      {...props}
    />
  )
}

function UnknownsMapCardWithKey(props: UnknownsMapCardProps) {
  const preloadHeight = useGuessPreloadHeight([700, 1000])
  const metricConfig = props.variableConfig.metrics.pct_share
  const currentBreakdown = props.currentBreakdown
  const breakdownString = `with unknown ${BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[currentBreakdown]}`
  const isCawp = CAWP_DATA_TYPES.includes(props.variableConfig.variableId)
  const location = useLocation()
  const locationPhrase = `in ${props.fips.getSentenceDisplayName()}`

  const signalListeners: any = {
    click: (...args: any) => {
      const clickedData = args[1]
      if (clickedData?.id) {
        props.updateFipsCallback(new Fips(clickedData.id))
        location.hash = `#unknown-demographic-map`
      }
    },
  }

  const theme = useTheme()
  const pageIsSmall = useMediaQuery(theme.breakpoints.down('sm'))
  const isCompareMode = window.location.href.includes('compare')
  const mapIsWide = !pageIsSmall && !isCompareMode

  // TODO Debug why onlyInclude(UNKNOWN, UNKNOWN_RACE) isn't working
  const mapGeoBreakdowns = Breakdowns.forParentFips(props.fips).addBreakdown(
    currentBreakdown
  )
  const alertBreakdown = Breakdowns.forFips(props.fips).addBreakdown(
    currentBreakdown
  )

  const mapQuery = new MetricQuery(
    [metricConfig.metricId],
    mapGeoBreakdowns,
    /* variableId */ props.variableConfig.variableId,
    /* timeView */ isCawp ? 'cross_sectional' : undefined
  )
  const alertQuery = new MetricQuery(
    [metricConfig.metricId],
    alertBreakdown,
    /* variableId */ props.variableConfig.variableId,
    /* timeView */ isCawp ? 'cross_sectional' : undefined
  )

  const { chartTitle, dataName, filename } = useCreateChartTitle(
    metricConfig,
    locationPhrase,
    breakdownString
  )

  const isCawpStateLeg =
    props.variableConfig.variableId === 'women_in_state_legislature'
  const isCawpCongress =
    props.variableConfig.variableId === 'women_in_us_congress'

  let countColsToAdd: MetricId[] = []
  if (isCawpCongress) countColsToAdd = ['women_this_race_us_congress_count']
  if (isCawpStateLeg) countColsToAdd = ['women_this_race_state_leg_count']

  const HASH_ID: ScrollableHashId = 'unknown-demographic-map'

  return (
    <CardWrapper
      downloadTitle={filename}
      queries={[mapQuery, alertQuery]}
      loadGeographies={true}
      minHeight={preloadHeight}
      scrollToHash={HASH_ID}
    >
      {([mapQueryResponse, alertQueryResponse], metadata, geoData) => {
        // MOST of the items rendered in the card refer to the unknowns at the CHILD geo level,
        //  e.g. if you look at the United States, we are dealing with the Unknown pct_share at the state level
        // the exception is the <UnknownsAlert /> which presents the amount of unknown demographic at the SELECTED level
        const unknownRaces: Row[] = mapQueryResponse
          .getValidRowsForField(currentBreakdown)
          .filter(
            (row: Row) =>
              row[currentBreakdown] === UNKNOWN_RACE ||
              row[currentBreakdown] === UNKNOWN
          )

        const unknownEthnicities: Row[] = mapQueryResponse
          .getValidRowsForField(currentBreakdown)
          .filter((row: Row) => row[currentBreakdown] === UNKNOWN_ETHNICITY)

        // If a state provides both unknown race and ethnicity numbers
        // use the higher one
        const unknowns =
          unknownEthnicities.length === 0
            ? unknownRaces
            : unknownRaces.map((unknownRaceRow, index) => {
                return unknownRaceRow[metricConfig.metricId] >
                  unknownEthnicities[index][metricConfig.metricId] ||
                  unknownEthnicities[index][metricConfig.metricId] == null
                  ? unknownRaceRow
                  : unknownEthnicities[index]
              })

        const dataIsMissing = mapQueryResponse.dataIsMissing()
        const unknownsArrayEmpty = unknowns.length === 0

        // there is some data but only for ALL but not by demographic groups
        const noDemographicInfo =
          mapQueryResponse
            .getValidRowsForField(currentBreakdown)
            .filter((row: Row) => row[currentBreakdown] !== ALL).length === 0 &&
          mapQueryResponse
            .getValidRowsForField(currentBreakdown)
            .filter((row: Row) => row[currentBreakdown] === ALL).length > 0

        // when suppressing states with too low COVID numbers
        const unknownsUndefined =
          unknowns.length > 0 &&
          unknowns.every(
            (unknown: Row) => unknown[metricConfig.metricId] === undefined
          )

        // for data sets where some geos might contain `0` for every unknown pct_share, like CAWP US Congress National
        const unknownsAllZero =
          unknowns.length > 0 &&
          unknowns.every((unknown: Row) => unknown[metricConfig.metricId] === 0)

        // show MISSING DATA ALERT if we expect the unknowns array to be empty (breakdowns/data unavailable),
        // or if the unknowns are undefined (eg COVID suppressed states)
        const showMissingDataAlert =
          (unknownsArrayEmpty && dataIsMissing) ||
          (!unknownsArrayEmpty && unknownsUndefined) ||
          noDemographicInfo

        // show NO UNKNOWNS INFO BOX for an expected empty array of UNKNOWNS (eg the AHR data)
        const showNoUnknownsInfo =
          unknownsArrayEmpty &&
          !dataIsMissing &&
          !unknownsUndefined &&
          !noDemographicInfo

        // show the UNKNOWNS MAP when there is unknowns data and it's not undefined/suppressed
        const showingVisualization =
          !unknownsArrayEmpty && !unknownsUndefined && !unknownsAllZero

        const hasChildGeo = props.fips.getChildFipsTypeDisplayName() !== ''

        return (
          <>
            {showingVisualization && (
              <CardContent>
                <ChoroplethMap
                  titles={{ chartTitle }}
                  isUnknownsMap={true}
                  signalListeners={signalListeners}
                  metric={metricConfig}
                  legendTitle={metricConfig?.unknownsVegaLabel ?? ''}
                  data={unknowns}
                  showCounties={!props.fips.isUsa()}
                  fips={props.fips}
                  hideLegend={
                    mapQueryResponse.dataIsMissing() || unknowns.length <= 1
                  }
                  hideActions={true}
                  geoData={geoData}
                  filename={filename}
                  countColsToAdd={countColsToAdd}
                />
                {props.fips.isUsa() && unknowns.length > 0 && (
                  <TerritoryCircles
                    mapIsWide={mapIsWide}
                    data={unknowns}
                    countColsToAdd={countColsToAdd}
                    metricConfig={metricConfig}
                    signalListeners={signalListeners}
                    geoData={geoData}
                    isUnknownsMap={true}
                  />
                )}
              </CardContent>
            )}
            {/* PERCENT REPORTING UNKNOWN ALERT - contains its own logic and divider/styling */}
            {!unknownsAllZero && (
              <UnknownsAlert
                queryResponse={alertQueryResponse}
                metricConfig={metricConfig}
                breakdownVar={currentBreakdown}
                displayType="map"
                known={false}
                overrideAndWithOr={currentBreakdown === RACE}
                raceEthDiffMap={
                  mapQueryResponse
                    .getValidRowsForField(currentBreakdown)
                    .filter(
                      (row: Row) => row[currentBreakdown] === UNKNOWN_ETHNICITY
                    ).length !== 0
                }
                noDemographicInfoMap={noDemographicInfo}
                showingVisualization={showingVisualization}
                fips={props.fips}
              />
            )}

            {/* MISSING DATA ALERT */}
            {showMissingDataAlert && (
              <CardContent>
                <MissingDataAlert
                  dataName={dataName}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[currentBreakdown]
                  }
                  isMapCard={true}
                  fips={props.fips}
                />
              </CardContent>
            )}

            {/* NO UNKNOWNS INFO BOX */}
            {(showNoUnknownsInfo || unknownsAllZero) && (
              <CardContent>
                <Alert severity="info" role="note">
                  No unknown values for{' '}
                  {BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[currentBreakdown]}{' '}
                  reported in this dataset
                  {hasChildGeo && (
                    <>
                      {' '}
                      at the {props.fips.getChildFipsTypeDisplayName()} level
                    </>
                  )}
                  {'.'}
                </Alert>
              </CardContent>
            )}
          </>
        )
      }}
    </CardWrapper>
  )
}
