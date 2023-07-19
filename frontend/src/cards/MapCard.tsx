import {
  Button,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import { ChoroplethMap } from '../charts/ChoroplethMap'
import { type MetricId, type DataTypeConfig } from '../data/config/MetricConfig'
import { exclude } from '../data/query/BreakdownFilter'
import {
  Breakdowns,
  type BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
  type BreakdownVarDisplayName,
} from '../data/query/Breakdowns'
import {
  MetricQuery,
  type MetricQueryResponse,
} from '../data/query/MetricQuery'
import { AgeSorterStrategy } from '../data/sorting/AgeSorterStrategy'
import {
  ALL,
  NON_HISPANIC,
  UNKNOWN,
  UNKNOWN_RACE,
  UNKNOWN_ETHNICITY,
  type DemographicGroup,
  RACE,
} from '../data/utils/Constants'
import { type Row } from '../data/utils/DatasetTypes'
import { getExtremeValues } from '../data/utils/datasetutils'
import { Fips } from '../data/utils/Fips'
import {
  COMBINED_INCARCERATION_STATES_LIST,
  COMBINED_QUALIFIER,
  PRIVATE_JAILS_QUALIFIER,
} from '../data/providers/IncarcerationProvider'
import {
  CAWP_CONGRESS_COUNTS,
  CAWP_DETERMINANTS,
  CAWP_STLEG_COUNTS,
} from '../data/providers/CawpProvider'
import { useAutoFocusDialog } from '../utils/hooks/useAutoFocusDialog'
import styles from './Card.module.scss'
import CardWrapper from './CardWrapper'
import DropDownMenu from './ui/DropDownMenu'
import { HighestLowestList } from './ui/HighestLowestList'
import MissingDataAlert from './ui/MissingDataAlert'
import { MultiMapDialog } from './ui/MultiMapDialog'
import { MultiMapLink } from './ui/MultiMapLink'
import { findVerboseRating } from './ui/SviAlert'
import { useGuessPreloadHeight } from '../utils/hooks/useGuessPreloadHeight'
import { generateChartTitle, generateSubtitle } from '../charts/utils'
import { useLocation } from 'react-router-dom'
import { type ScrollableHashId } from '../utils/hooks/useStepObserver'
import { useState } from 'react'
import {
  RATE_MAP_SCALE,
  getHighestLowestGroupsByFips,
  getMapScheme,
} from '../charts/mapHelpers'
import { Legend } from '../charts/Legend'
import GeoContext, { getPopulationPhrase } from './ui/GeoContext'
import TerritoryCircles from './ui/TerritoryCircles'
import { GridView } from '@mui/icons-material'
import {
  MAP1_GROUP_PARAM,
  MAP2_GROUP_PARAM,
  getDemographicGroupFromGroupParam,
  getGroupParamFromDemographicGroup,
  getParameter,
  setParameter,
} from '../utils/urlutils'
import ChartTitle from './ChartTitle'

const SIZE_OF_HIGHEST_LOWEST_RATES_LIST = 5

export interface MapCardProps {
  key?: string
  fips: Fips
  dataTypeConfig: DataTypeConfig
  updateFipsCallback: (fips: Fips) => void
  currentBreakdown: BreakdownVar
  isCompareCard?: boolean
  reportTitle: string
}

// This wrapper ensures the proper key is set to create a new instance when required (when
// the props change and the state needs to be reset) rather than relying on the card caller.
export function MapCard(props: MapCardProps) {
  return (
    <MapCardWithKey
      key={props.currentBreakdown + props.dataTypeConfig.dataTypeId}
      {...props}
    />
  )
}

function MapCardWithKey(props: MapCardProps) {
  const preloadHeight = useGuessPreloadHeight([750, 1050])

  const metricConfig =
    props.dataTypeConfig.metrics?.per100k ??
    props.dataTypeConfig.metrics.pct_rate ??
    props.dataTypeConfig.metrics.index

  if (!metricConfig) return <></>

  const currentBreakdown = props.currentBreakdown

  const isPrison = props.dataTypeConfig.dataTypeId === 'prison'
  const isJail = props.dataTypeConfig.dataTypeId === 'jail'
  const isIncarceration = isJail ?? isPrison

  const isCawpStateLeg =
    props.dataTypeConfig.dataTypeId === 'women_in_state_legislature'
  const isCawpCongress =
    props.dataTypeConfig.dataTypeId === 'women_in_us_congress'
  const isCawp = isCawpStateLeg ?? isCawpCongress

  const location = useLocation()

  const signalListeners: any = {
    click: (...args: any) => {
      const clickedData = args[1]
      if (clickedData?.id) {
        props.updateFipsCallback(new Fips(clickedData.id))
        location.hash = `#${HASH_ID}`
      }
    },
  }

  const MAP_GROUP_PARAM = props.isCompareCard
    ? MAP2_GROUP_PARAM
    : MAP1_GROUP_PARAM

  const initialGroupParam: string = getParameter(MAP_GROUP_PARAM, ALL)
  const initialGroup = getDemographicGroupFromGroupParam(initialGroupParam)

  const [listExpanded, setListExpanded] = useState(false)
  const [activeBreakdownFilter, setActiveBreakdownFilter] =
    useState<DemographicGroup>(initialGroup)

  const [multimapOpen, setMultimapOpen] = useAutoFocusDialog()

  const metricQuery = (
    geographyBreakdown: Breakdowns,
    countColsToAdd?: MetricId[]
  ) => {
    const metricIds: MetricId[] = [metricConfig.metricId]
    if (countColsToAdd) metricIds.push(...countColsToAdd)

    return new MetricQuery(
      metricIds,
      geographyBreakdown
        .copy()
        .addBreakdown(
          currentBreakdown,
          currentBreakdown === RACE
            ? exclude(NON_HISPANIC, UNKNOWN, UNKNOWN_RACE, UNKNOWN_ETHNICITY)
            : exclude(UNKNOWN)
        ),
      /* dataTypeId */ props.dataTypeConfig.dataTypeId,
      /* timeView */ isCawp ? 'cross_sectional' : undefined
    )
  }

  let countColsToAdd: MetricId[] = []
  if (isCawpCongress) countColsToAdd = CAWP_CONGRESS_COUNTS
  if (isCawpStateLeg) countColsToAdd = CAWP_STLEG_COUNTS

  const queries = [
    metricQuery(Breakdowns.forChildrenFips(props.fips), countColsToAdd),
    metricQuery(Breakdowns.forFips(props.fips)),
  ]

  // Population count
  const popBreakdown = Breakdowns.forFips(props.fips)
  const popQuery = new MetricQuery(
    /* MetricId(s) */ ['population'],
    /* Breakdowns */ popBreakdown
  )
  queries.push(popQuery)

  // state and county level reports require county-fips data for hover tooltips
  if (!props.fips.isUsa()) {
    const sviBreakdowns = Breakdowns.byCounty()
    sviBreakdowns.filterFips = props.fips
    const sviQuery = new MetricQuery(
      /* MetricId(s) */ ['svi'],
      /* Breakdowns */ sviBreakdowns
    )
    queries.push(sviQuery)
  }

  let selectedRaceSuffix = ''
  if (
    CAWP_DETERMINANTS.includes(metricConfig.metricId) &&
    activeBreakdownFilter !== 'All'
  ) {
    selectedRaceSuffix = ` and also identifying as ${activeBreakdownFilter}`
  }

  let qualifierMessage = ''
  if (isPrison) qualifierMessage = COMBINED_QUALIFIER
  if (isJail) qualifierMessage = PRIVATE_JAILS_QUALIFIER

  let qualifierItems: string[] = []
  if (isIncarceration) qualifierItems = COMBINED_INCARCERATION_STATES_LIST

  const { metricId, chartTitle } = metricConfig
  const title = generateChartTitle(chartTitle, props.fips)
  const subtitle = generateSubtitle(
    activeBreakdownFilter,
    currentBreakdown,
    metricId
  )

  const filename = `${title} ${subtitle ? `for ${subtitle}` : ''}`

  const HASH_ID: ScrollableHashId = 'rate-map'

  const theme = useTheme()
  const pageIsSmall = useMediaQuery(theme.breakpoints.down('sm'))
  const isCompareMode = window.location.href.includes('compare')
  const mapIsWide = !pageIsSmall && !isCompareMode

  const fipsTypeDisplayName = props.fips.getFipsTypeDisplayName()

  const [scale, setScale] = useState<{ domain: number[]; range: number[] }>({
    domain: [],
    range: [],
  })

  function handleScaleChange(domain: number[], range: number[]) {
    // Update the scale state when the domain or range changes
    setScale({ domain, range })
  }

  return (
    <CardWrapper
      downloadTitle={filename}
      queries={queries}
      loadGeographies={true}
      minHeight={preloadHeight}
      scrollToHash={HASH_ID}
      reportTitle={props.reportTitle}
    >
      {(queryResponses, metadata, geoData) => {
        // contains rows for sub-geos (if viewing US, this data will be STATE level)
        const childGeoQueryResponse: MetricQueryResponse = queryResponses[0]
        // contains data rows current level (if viewing US, this data will be US level)
        const parentGeoQueryResponse = queryResponses[1]
        const hasSelfButNotChildGeoData =
          childGeoQueryResponse.data.filter((row) => row[metricConfig.metricId])
            .length === 0 &&
          parentGeoQueryResponse.data.filter(
            (row) => row[metricConfig.metricId]
          ).length > 0
        const mapQueryResponse = hasSelfButNotChildGeoData
          ? parentGeoQueryResponse
          : childGeoQueryResponse

        const totalPopulationPhrase = getPopulationPhrase(queryResponses[2])
        const sviQueryResponse: MetricQueryResponse = queryResponses[3] || null
        const sortArgs =
          props.currentBreakdown === 'age'
            ? ([new AgeSorterStrategy([ALL]).compareFn] as any)
            : []

        const fieldValues = mapQueryResponse.getFieldValues(
          /* fieldName: BreakdownVar */ props.currentBreakdown,
          /* relevantMetric: MetricId */ metricConfig.metricId
        )

        const breakdownValues = fieldValues.withData.sort.apply(
          fieldValues.withData,
          sortArgs
        )

        let dataForActiveBreakdownFilter = mapQueryResponse
          .getValidRowsForField(metricConfig.metricId)
          .filter(
            (row: Row) => row[props.currentBreakdown] === activeBreakdownFilter
          )

        const allDataForActiveBreakdownFilter = mapQueryResponse.data.filter(
          (row: Row) => row[props.currentBreakdown] === activeBreakdownFilter
        )

        const dataForSvi: Row[] =
          sviQueryResponse
            ?.getValidRowsForField('svi')
            ?.filter((row) =>
              dataForActiveBreakdownFilter.find(({ fips }) => row.fips === fips)
            ) || []

        if (!props.fips.isUsa()) {
          dataForActiveBreakdownFilter = dataForActiveBreakdownFilter.map(
            (row) => {
              const thisCountySviRow = dataForSvi.find(
                (sviRow) => sviRow.fips === row.fips
              )
              return {
                ...row,
                rating: findVerboseRating(thisCountySviRow?.svi),
              }
            }
          )
        }

        const { highestValues, lowestValues } = getExtremeValues(
          dataForActiveBreakdownFilter,
          metricConfig.metricId,
          SIZE_OF_HIGHEST_LOWEST_RATES_LIST
        )

        // Create and populate a map of breakdown display name to options
        const filterOptions: Record<
          BreakdownVarDisplayName,
          DemographicGroup[]
        > = {
          [BREAKDOWN_VAR_DISPLAY_NAMES[props.currentBreakdown]]:
            breakdownValues,
        }

        const hideGroupDropdown =
          Object.values(filterOptions).toString() === ALL

        // if a previously selected group is no longer valid, reset to ALL
        let dropdownValue = ALL
        if (
          filterOptions[
            BREAKDOWN_VAR_DISPLAY_NAMES[props.currentBreakdown]
          ].includes(activeBreakdownFilter)
        ) {
          dropdownValue = activeBreakdownFilter
        } else {
          setActiveBreakdownFilter(ALL)
          setParameter(MAP_GROUP_PARAM, ALL)
        }

        function handleMapGroupClick(_: any, newGroup: DemographicGroup) {
          setActiveBreakdownFilter(newGroup)
          const groupCode = getGroupParamFromDemographicGroup(newGroup)
          setParameter(MAP_GROUP_PARAM, groupCode)
        }

        const displayData = listExpanded
          ? highestValues.concat(lowestValues)
          : dataForActiveBreakdownFilter

        const isSummaryLegend =
          hasSelfButNotChildGeoData ?? props.fips.isCounty()

        const [mapScheme, mapMin] = getMapScheme({
          metricId: metricConfig.metricId,
          isSummaryLegend,
        })

        return (
          <>
            <MultiMapDialog
              breakdown={props.currentBreakdown}
              breakdownValues={breakdownValues}
              breakdownValuesNoData={fieldValues.noData}
              countColsToAdd={countColsToAdd}
              data={mapQueryResponse.data}
              fieldRange={mapQueryResponse.getFieldRange(metricConfig.metricId)}
              fips={props.fips}
              geoData={geoData}
              handleClose={() => {
                setMultimapOpen(false)
              }}
              handleMapGroupClick={handleMapGroupClick}
              hasSelfButNotChildGeoData={hasSelfButNotChildGeoData}
              metadata={metadata}
              metricConfig={metricConfig}
              open={multimapOpen}
              queries={queries}
              queryResponses={queryResponses}
              totalPopulationPhrase={totalPopulationPhrase}
              updateFipsCallback={props.updateFipsCallback}
              useSmallSampleMessage={
                !mapQueryResponse.dataIsMissing() &&
                (props.dataTypeConfig.surveyCollectedData ?? false)
              }
              pageIsSmall={pageIsSmall}
            />

            {!mapQueryResponse.dataIsMissing() && !hideGroupDropdown && (
              <>
                <CardContent className={styles.SmallMarginContent}>
                  <Grid
                    container
                    justifyContent="space-between"
                    align-items="flex-end"
                  >
                    <Grid item>
                      <DropDownMenu
                        idSuffix={`-${props.fips.code}-${props.dataTypeConfig.dataTypeId}`}
                        breakdownVar={props.currentBreakdown}
                        dataTypeId={props.dataTypeConfig.dataTypeId}
                        setMultimapOpen={setMultimapOpen}
                        value={dropdownValue}
                        options={filterOptions}
                        onOptionUpdate={handleMapGroupClick}
                      />
                      <Divider />
                      <Button
                        onClick={() => {
                          setMultimapOpen(true)
                        }}
                      >
                        <GridView />
                        <span className={styles.CompareMultipleText}>
                          View multiple maps
                        </span>
                      </Button>
                    </Grid>
                    <Divider />
                  </Grid>
                </CardContent>
              </>
            )}

            {metricConfig && dataForActiveBreakdownFilter.length > 0 && (
              <div>
                <CardContent>
                  <Grid container>
                    <Grid item xs={12}>
                      <ChartTitle
                        mt={0}
                        mb={2}
                        title={title}
                        subtitle={subtitle}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sm={mapIsWide ? 9 : 12}
                      lg={mapIsWide ? 10 : 12}
                    >
                      <ChoroplethMap
                        highestLowestGroupsByFips={getHighestLowestGroupsByFips(
                          mapQueryResponse.data,
                          props.currentBreakdown,
                          metricId
                        )}
                        activeBreakdownFilter={activeBreakdownFilter}
                        countColsToAdd={countColsToAdd}
                        data={displayData}
                        filename={filename}
                        fips={props.fips}
                        geoData={geoData}
                        hideLegend={true}
                        hideMissingDataTooltip={listExpanded}
                        legendData={dataForActiveBreakdownFilter}
                        legendTitle={metricConfig.shortLabel.toLowerCase()}
                        listExpanded={listExpanded}
                        metric={metricConfig}
                        showCounties={
                          !props.fips.isUsa() && !hasSelfButNotChildGeoData
                        }
                        signalListeners={signalListeners}
                        mapConfig={{ mapScheme, mapMin }}
                        scaleConfig={scale}
                      />
                      {props.fips.isUsa() && (
                        <Grid item xs={12}>
                          <TerritoryCircles
                            breakdown={props.currentBreakdown}
                            activeBreakdownFilter={activeBreakdownFilter}
                            countColsToAdd={countColsToAdd}
                            data={displayData}
                            fullData={mapQueryResponse.data}
                            geoData={geoData}
                            listExpanded={listExpanded}
                            mapIsWide={mapIsWide}
                            metricConfig={metricConfig}
                            signalListeners={signalListeners}
                          />
                        </Grid>
                      )}
                    </Grid>
                    {/* Legend */}
                    <Grid
                      container
                      justifyItems={'center'}
                      alignItems={'flex-start'}
                      item
                      xs={12}
                      sm={mapIsWide ? 3 : 12}
                      lg={mapIsWide ? 2 : 12}
                    >
                      <Legend
                        metric={metricConfig}
                        legendTitle={metricConfig.shortLabel}
                        data={allDataForActiveBreakdownFilter}
                        scaleType={RATE_MAP_SCALE}
                        sameDotSize={true}
                        description={'Legend for rate map'}
                        isSummaryLegend={isSummaryLegend}
                        fipsTypeDisplayName={fipsTypeDisplayName}
                        mapConfig={{ mapScheme, mapMin }}
                        columns={mapIsWide ? 1 : 3}
                        stackingDirection={'vertical'}
                        handleScaleChange={handleScaleChange}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      container
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Grid item>
                        <GeoContext
                          fips={props.fips}
                          updateFipsCallback={props.updateFipsCallback}
                          dataTypeConfig={props.dataTypeConfig}
                          totalPopulationPhrase={totalPopulationPhrase}
                          sviQueryResponse={sviQueryResponse}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {!mapQueryResponse.dataIsMissing() &&
                    dataForActiveBreakdownFilter.length > 1 && (
                      <HighestLowestList
                        dataTypeConfig={props.dataTypeConfig}
                        selectedRaceSuffix={selectedRaceSuffix}
                        metricConfig={metricConfig}
                        listExpanded={listExpanded}
                        setListExpanded={setListExpanded}
                        highestValues={highestValues}
                        lowestValues={lowestValues}
                        parentGeoQueryResponse={parentGeoQueryResponse}
                        fips={props.fips}
                        qualifierItems={qualifierItems}
                        qualifierMessage={qualifierMessage}
                        currentBreakdown={currentBreakdown}
                        activeBreakdownFilter={activeBreakdownFilter}
                      />
                    )}
                </CardContent>

                {(mapQueryResponse.dataIsMissing() ||
                  dataForActiveBreakdownFilter.length === 0) && (
                  <CardContent>
                    <MissingDataAlert
                      dataName={title}
                      breakdownString={
                        BREAKDOWN_VAR_DISPLAY_NAMES[props.currentBreakdown]
                      }
                      isMapCard={true}
                      fips={props.fips}
                    />
                  </CardContent>
                )}

                {!mapQueryResponse.dataIsMissing() &&
                  dataForActiveBreakdownFilter.length === 0 &&
                  activeBreakdownFilter !== 'All' && (
                    <CardContent>
                      <Alert severity="warning" role="note">
                        Insufficient data available for filter:{' '}
                        <b>{activeBreakdownFilter}</b>.{' '}
                        {/* Offer multimap link if current demo group is missing info */}
                        <MultiMapLink
                          setMultimapOpen={setMultimapOpen}
                          currentBreakdown={props.currentBreakdown}
                          currentDataType={props.dataTypeConfig.fullDisplayName}
                        />
                      </Alert>
                    </CardContent>
                  )}
              </div>
            )}
          </>
        )
      }}
    </CardWrapper>
  )
}
