import { useLocation } from 'react-router-dom'
import type { Topology } from 'topojson-specification'
import ChoroplethMap from '../charts/choroplethMap/index'
import type { DataPoint } from '../charts/choroplethMap/types'
import { MAP_SCHEMES } from '../charts/mapGlobals'
import { generateChartTitle, generateSubtitle } from '../charts/utils'
import type {
  DataTypeConfig,
  MapConfig,
} from '../data/config/MetricConfigTypes'
import {
  Breakdowns,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import { MetricQuery } from '../data/query/MetricQuery'
import {
  ALL,
  RACE,
  UNKNOWN,
  UNKNOWN_ETHNICITY,
  UNKNOWN_RACE,
} from '../data/utils/Constants'
import type { HetRow } from '../data/utils/DatasetTypes'
import { Fips } from '../data/utils/Fips'
import { het } from '../styles/DesignTokens'
import HetNotice from '../styles/HetComponents/HetNotice'
import { useGuessPreloadHeight } from '../utils/hooks/useGuessPreloadHeight'
import { useIsBreakpointAndUp } from '../utils/hooks/useIsBreakpointAndUp'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import CardWrapper from './CardWrapper'
import ChartTitle from './ChartTitle'
import MissingDataAlert from './ui/MissingDataAlert'
import UnknownsAlert from './ui/UnknownsAlert'

interface UnknownsMapCardProps {
  // Variable the map will evaluate for unknowns
  dataTypeConfig: DataTypeConfig
  // Breakdown value to evaluate for unknowns
  demographicType: DemographicType
  // Geographic region of maps
  fips: Fips
  // Updates the madlib
  updateFipsCallback: (fips: Fips) => void
  // replaces race AND ethnicity with race OR ethnicity on unknowns map title and alerts
  overrideAndWithOr?: boolean
  reportTitle: string
}

// This wrapper ensures the proper key is set to create a new instance when required (when
// the props change and the state needs to be reset) rather than relying on the card caller.
export default function UnknownsMapCard(props: UnknownsMapCardProps) {
  return (
    <UnknownsMapCardWithKey
      key={props.demographicType + props.dataTypeConfig.dataTypeId}
      {...props}
    />
  )
}

function UnknownsMapCardWithKey(props: UnknownsMapCardProps) {
  const preloadHeight = useGuessPreloadHeight([700, 1000])
  const metricConfig =
    props.dataTypeConfig.metrics?.pct_share_unknown ??
    props.dataTypeConfig.metrics?.pct_share

  if (!metricConfig) return <></>
  const demographicType = props.demographicType
  const location = useLocation()

  const signalListeners: any = {
    click: (...args: any) => {
      const clickedData = args[1]
      if (clickedData?.id) {
        props.updateFipsCallback(new Fips(clickedData.id))
        location.hash = `#unknown-demographic-map`
      }
    },
  }

  const isSm = useIsBreakpointAndUp('sm')
  const isCompareMode = window.location.href.includes('compare')
  const mapIsWide = !isSm && !isCompareMode

  // TODO: Debug why onlyInclude(UNKNOWN, UNKNOWN_RACE) isn't working
  const mapGeoBreakdowns = Breakdowns.forParentFips(props.fips).addBreakdown(
    demographicType,
  )
  const alertBreakdown = Breakdowns.forFips(props.fips).addBreakdown(
    demographicType,
  )

  const mapQuery = new MetricQuery(
    [metricConfig.metricId],
    mapGeoBreakdowns,
    /* dataTypeId */ props.dataTypeConfig.dataTypeId,
    /* timeView */ 'current',
  )
  const alertQuery = new MetricQuery(
    [metricConfig.metricId],
    alertBreakdown,
    /* dataTypeId */ props.dataTypeConfig.dataTypeId,
    /* timeView */ 'current',
  )

  const chartTitle = generateChartTitle(
    /* chartTitle:  */ metricConfig.chartTitle,
    /* fips: */ props.fips,
    demographicType,
  )

  const subtitle = generateSubtitle(
    ALL,
    props.demographicType,
    props.dataTypeConfig,
  )

  const HASH_ID: ScrollableHashId = 'unknown-demographic-map'

  const unknownMapConfig: MapConfig = {
    scheme: MAP_SCHEMES.unknown,
    min: het.unknownMapLeast,
    mid: het.unknownMapMid,
  }

  return (
    <CardWrapper
      downloadTitle={chartTitle}
      queries={[mapQuery, alertQuery]}
      loadGeographies={true}
      minHeight={preloadHeight}
      scrollToHash={HASH_ID}
      reportTitle={props.reportTitle}
    >
      {([mapQueryResponse, alertQueryResponse], metadata, geoData) => {
        // MOST of the items rendered in the card refer to the unknowns at the CHILD geo level,
        //  e.g. if you look at the United States, we are dealing with the Unknown pct_share at the state level
        // the exception is the <UnknownsAlert /> which presents the amount of unknown demographic at the SELECTED level
        const unknownRaces: HetRow[] = mapQueryResponse
          .getValidRowsForField(demographicType)
          .filter(
            (row: HetRow) =>
              row[demographicType] === UNKNOWN_RACE ||
              row[demographicType] === UNKNOWN,
          )

        const unknownEthnicities: HetRow[] = mapQueryResponse
          .getValidRowsForField(demographicType)
          .filter((row: HetRow) => row[demographicType] === UNKNOWN_ETHNICITY)

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
            .getValidRowsForField(demographicType)
            .filter((row: HetRow) => row[demographicType] !== ALL).length ===
            0 &&
          mapQueryResponse
            .getValidRowsForField(demographicType)
            .filter((row: HetRow) => row[demographicType] === ALL).length > 0

        // when suppressing states with too low COVID numbers
        const unknownsUndefined =
          unknowns.length > 0 &&
          unknowns.every(
            (unknown: HetRow) => unknown[metricConfig.metricId] === undefined,
          )

        // for data sets where some geos might contain `0` for every unknown pct_share, like CAWP US Congress National
        const unknownsAllZero =
          unknowns.length > 0 &&
          unknowns.every(
            (unknown: HetRow) =>
              unknown[metricConfig.metricId] === 0 ||
              unknown[metricConfig.metricId] == null,
          )

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
            <ChartTitle title={chartTitle} subtitle={subtitle} />
            {showingVisualization && (
              <div
                className={
                  props.fips.isUsa() ? 'mr-2 md:mr-16 xl:mr-24' : 'm-2'
                }
              >
                <ChoroplethMap
                  activeDemographicGroup={UNKNOWN}
                  countColsMap={{}}
                  data={unknowns as DataPoint[]}
                  demographicType={demographicType}
                  extremesMode={false}
                  filename={chartTitle}
                  fips={props.fips}
                  geoData={geoData as Topology}
                  isUnknownsMap={true}
                  legendTitle={metricConfig?.unknownsVegaLabel ?? ''}
                  mapConfig={unknownMapConfig}
                  metric={metricConfig}
                  showCounties={!props.fips.isUsa()}
                  signalListeners={signalListeners}
                />
              </div>
            )}
            {/* PERCENT REPORTING UNKNOWN ALERT - contains its own logic and divider/styling */}
            {!unknownsAllZero && (
              <UnknownsAlert
                queryResponse={alertQueryResponse}
                metricConfig={metricConfig}
                demographicType={demographicType}
                displayType='map'
                known={false}
                overrideAndWithOr={demographicType === RACE}
                raceEthDiffMap={
                  mapQueryResponse
                    .getValidRowsForField(demographicType)
                    .filter(
                      (row: HetRow) =>
                        row[demographicType] === UNKNOWN_ETHNICITY,
                    ).length !== 0
                }
                noDemographicInfoMap={noDemographicInfo}
                showingVisualization={showingVisualization}
                fips={props.fips}
              />
            )}

            {/* MISSING DATA ALERT */}
            {showMissingDataAlert && (
              <MissingDataAlert
                dataName={chartTitle}
                demographicTypeString={
                  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]
                }
                isMapCard={true}
                fips={props.fips}
              />
            )}

            {/* NO UNKNOWNS INFO BOX */}
            {(showNoUnknownsInfo || unknownsAllZero) && (
              <HetNotice>
                No unknown values for{' '}
                {DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]} reported
                in this dataset
                {hasChildGeo && (
                  <> at the {props.fips.getChildFipsTypeDisplayName()} level</>
                )}
                {'.'}
              </HetNotice>
            )}
          </>
        )
      }}
    </CardWrapper>
  )
}
