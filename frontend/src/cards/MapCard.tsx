import { GridView } from '@mui/icons-material'
import { useMemo, useState } from 'react'
import { useLocation } from 'react-router'
import { createColorScale } from '../charts/choroplethMap/colorSchemes'
import ChoroplethMap from '../charts/choroplethMap/index'
import RateMapLegend from '../charts/choroplethMap/RateMapLegend'
import {
  ATLANTA_METRO_COUNTY_FIPS,
  type CountColsMap,
  SIZE_OF_HIGHEST_LOWEST_GEOS_RATES_LIST,
} from '../charts/mapGlobals'
import { getHighestLowestGroupsByFips } from '../charts/mapHelperFunctions'
import { generateChartTitle, generateSubtitle } from '../charts/utils'
import type { DatasetId } from '../data/config/DatasetMetadata'
import { dataSourceMetadataMap } from '../data/config/MetadataMap'
import type { DataTypeConfig, MetricId } from '../data/config/MetricConfigTypes'
import { CAWP_METRICS } from '../data/providers/CawpProvider'
import { POPULATION, SVI } from '../data/providers/GeoContextProvider'
import {
  COMBINED_INCARCERATION_STATES_LIST,
  COMBINED_QUALIFIER,
  PRIVATE_JAILS_QUALIFIER,
} from '../data/providers/IncarcerationProvider'
import { PHRMA_METRICS } from '../data/providers/PhrmaProvider'
import { exclude } from '../data/query/BreakdownFilter'
import {
  Breakdowns,
  DEMOGRAPHIC_DISPLAY_TYPES,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
  type DemographicTypeDisplayName,
} from '../data/query/Breakdowns'
import {
  MetricQuery,
  type MetricQueryResponse,
} from '../data/query/MetricQuery'
import { getSortArgs } from '../data/sorting/sortingUtils'
import {
  ALL,
  type DemographicGroup,
  NON_HISPANIC,
  RACE,
  UNKNOWN,
  UNKNOWN_ETHNICITY,
  UNKNOWN_RACE,
} from '../data/utils/Constants'
import type { HetRow } from '../data/utils/DatasetTypes'
import {
  allMissingValuesAreSuppressed,
  getExtremeValues,
} from '../data/utils/datasetutils'
import { Fips } from '../data/utils/Fips'
import HetDivider from '../styles/HetComponents/HetDivider'
import HetLinkButton from '../styles/HetComponents/HetLinkButton'
import HetNotice from '../styles/HetComponents/HetNotice'
import HetTerm from '../styles/HetComponents/HetTerm'
import { useGuessPreloadHeight } from '../utils/hooks/useGuessPreloadHeight'
import { useIsBreakpointAndUp } from '../utils/hooks/useIsBreakpointAndUp'
import { useParamState } from '../utils/hooks/useParamState'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import type { MadLibId } from '../utils/MadLibs'
import {
  ATLANTA_MODE_PARAM_KEY,
  EXTREMES_1_PARAM_KEY,
  EXTREMES_2_PARAM_KEY,
  getDemographicGroupFromGroupParam,
  getGroupParamFromDemographicGroup,
  getParameter,
  MAP1_GROUP_PARAM,
  MAP2_GROUP_PARAM,
  MULTIPLE_MAPS_1_PARAM_KEY,
  MULTIPLE_MAPS_2_PARAM_KEY,
  setParameter,
} from '../utils/urlutils'
import CardWrapper from './CardWrapper'
import ChartTitle from './ChartTitle'
import DemographicGroupMenu from './ui/DemographicGroupMenu'
import { ExtremesListBox } from './ui/ExtremesListBox'
import GeoContext from './ui/GeoContext'
import {
  getSubPopulationPhrase,
  getTotalACSPopulationPhrase,
} from './ui/geoContextHelpers'
import MissingDataAlert from './ui/MissingDataAlert'
import MultiMapDialog from './ui/MultiMapDialog'
import { findVerboseRating } from './ui/SviAlert'

const HASH_ID: ScrollableHashId = 'rate-map'

interface MapCardProps {
  className?: string
  key?: string
  fips: Fips
  dataTypeConfig: DataTypeConfig
  updateFipsCallback: (fips: Fips) => void
  demographicType: DemographicType
  isCompareCard?: boolean
  reportTitle: string
  trackerMode: MadLibId
}

// This wrapper ensures the proper key is set to create a new instance when required (when
// the props change and the state needs to be reset) rather than relying on the card caller.
export default function MapCard(props: MapCardProps) {
  return (
    <MapCardWithKey
      key={
        props.demographicType +
        props.dataTypeConfig.dataTypeId +
        props.trackerMode
      }
      {...props}
    />
  )
}

function MapCardWithKey(props: MapCardProps) {
  // HOOKS MUST NOT BE CALLED CONDITIONALLY.
  const preloadHeight = useGuessPreloadHeight([750, 1050])
  const location = useLocation()
  const extremesParamsKey = props.isCompareCard
    ? EXTREMES_2_PARAM_KEY
    : EXTREMES_1_PARAM_KEY

  const [isExtremesMode, setIsExtremesMode] = useParamState<boolean>(
    extremesParamsKey,
    false,
  )

  const MULTIMAP_PARAM_KEY = props.isCompareCard
    ? MULTIPLE_MAPS_2_PARAM_KEY
    : MULTIPLE_MAPS_1_PARAM_KEY

  const [multimapOpen, setMultimapOpen] = useParamState<boolean>(
    MULTIMAP_PARAM_KEY,
    false,
  )
  const MAP_GROUP_PARAM = props.isCompareCard
    ? MAP2_GROUP_PARAM
    : MAP1_GROUP_PARAM

  const initialGroupParam: string = getParameter(MAP_GROUP_PARAM, ALL)
  const initialGroup = getDemographicGroupFromGroupParam(initialGroupParam)

  const [activeDemographicGroup, setActiveDemographicGroup] =
    useState<DemographicGroup>(initialGroup)

  const [isAtlantaMode, setIsAtlantaMode] = useParamState<boolean>(
    ATLANTA_MODE_PARAM_KEY,
    false,
  )

  const metricConfig =
    props.dataTypeConfig?.metrics?.per100k ??
    props.dataTypeConfig?.metrics?.pct_rate ??
    props.dataTypeConfig?.metrics?.index

  const isMobile = !useIsBreakpointAndUp('sm')
  const isMd = useIsBreakpointAndUp('md')
  const isCompareMode = window.location.href.includes('compare')
  const mapIsWide = !isMobile && !isCompareMode

  const fipsTypeDisplayName = props.fips.getFipsTypeDisplayName()

  // ALL HOOKS MUST BE ABOVE THIS SHORT CIRCUIT
  if (!metricConfig) return <></>

  const demographicType = props.demographicType
  const prettyDemoType = DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]

  const isPrison = props.dataTypeConfig.dataTypeId === 'prison'
  const isJail = props.dataTypeConfig.dataTypeId === 'jail'
  const isIncarceration = isJail ?? isPrison

  const signalListeners: any = {
    click: (...args: any) => {
      const clickedData = args[1]
      if (clickedData?.id) {
        if (isAtlantaMode) setIsAtlantaMode(false)
        props.updateFipsCallback(new Fips(clickedData.id))
        location.hash = `#${HASH_ID}`
      }
    },
  }

  const metricQuery = (
    metricIds: MetricId[],
    geographyBreakdown: Breakdowns,
    countColsMap?: CountColsMap,
  ) => {
    countColsMap?.numeratorConfig &&
      metricIds.push(countColsMap.numeratorConfig.metricId)
    countColsMap?.denominatorConfig &&
      metricIds.push(countColsMap.denominatorConfig.metricId)

    return new MetricQuery(
      metricIds,
      geographyBreakdown
        .copy()
        .addBreakdown(
          demographicType,
          demographicType === RACE
            ? exclude(NON_HISPANIC, UNKNOWN, UNKNOWN_RACE, UNKNOWN_ETHNICITY)
            : exclude(UNKNOWN),
        ),
      /* dataTypeId */ props.dataTypeConfig.dataTypeId,
      /* timeView */ 'current',
      /* scrollToHashId */ HASH_ID,
    )
  }

  const countColsMap: CountColsMap = {
    numeratorConfig: metricConfig?.rateNumeratorMetric,
    denominatorConfig: metricConfig?.rateDenominatorMetric,
  }

  const initialMetridIds = [metricConfig.metricId]

  const subPopulationId = metricConfig?.rateDenominatorMetric?.metricId
  if (subPopulationId) initialMetridIds.push(subPopulationId)

  const queries = [
    metricQuery(
      initialMetridIds,
      Breakdowns.forChildrenFips(props.fips),
      countColsMap,
    ),
    metricQuery(initialMetridIds, Breakdowns.forFips(props.fips)),
  ]

  // Population count
  const popBreakdown = Breakdowns.forFips(props.fips)
  const popQuery = new MetricQuery([POPULATION], popBreakdown)
  queries.push(popQuery)

  // state and county level reports require county-fips data for hover tooltips
  if (!props.fips.isUsa()) {
    const sviBreakdowns = Breakdowns.byCounty()
    sviBreakdowns.filterFips = props.fips
    const sviQuery = new MetricQuery([SVI], sviBreakdowns)
    queries.push(sviQuery)
  }

  let selectedRaceSuffix = ''
  if (
    CAWP_METRICS.includes(metricConfig.metricId) &&
    activeDemographicGroup !== ALL
  ) {
    selectedRaceSuffix = ` and also identifying as ${activeDemographicGroup}`
  }

  let qualifierMessage = ''
  if (isPrison) qualifierMessage = COMBINED_QUALIFIER
  if (isJail) qualifierMessage = PRIVATE_JAILS_QUALIFIER

  let qualifierItems: string[] = []
  if (isIncarceration) qualifierItems = COMBINED_INCARCERATION_STATES_LIST

  const { metricId, chartTitle } = metricConfig
  const title = generateChartTitle(
    chartTitle,
    props.fips,
    undefined,
    isAtlantaMode ? 'metro counties of Atlanta, Georgia' : undefined,
  )
  let subtitle = generateSubtitle(
    activeDemographicGroup,
    demographicType,
    props.dataTypeConfig,
  )
  const pluralChildFips =
    props.fips.getPluralChildFipsTypeDisplayName() ?? 'places'
  if (isExtremesMode)
    subtitle += ` (only ${pluralChildFips} with rate extremes)`
  const filename = `${title} ${subtitle ? `for ${subtitle}` : ''}`

  return (
    <CardWrapper
      downloadTitle={filename}
      queries={queries}
      loadGeographies={true}
      minHeight={preloadHeight}
      scrollToHash={HASH_ID}
      reportTitle={props.reportTitle}
      expanded={isExtremesMode}
      isCompareCard={props.isCompareCard}
      className={props.className}
    >
      {(queryResponses, metadata, geoData) => {
        // contains rows for sub-geos (if viewing US, this data will be STATE level)
        const childGeoQueryResponse: MetricQueryResponse = queryResponses[0]
        // contains data rows current level (if viewing US, this data will be US level)
        const parentGeoQueryResponse = queryResponses[1]
        const acsPopulationQueryResponse = queryResponses[2]
        const hasSelfButNotChildGeoData =
          childGeoQueryResponse.data.filter((row) => row[metricConfig.metricId])
            .length === 0 &&
          parentGeoQueryResponse.data.filter(
            (row) => row[metricConfig.metricId],
          ).length > 0

        const mapQueryResponse = hasSelfButNotChildGeoData
          ? parentGeoQueryResponse
          : childGeoQueryResponse

        const allMissingDataIsSuppressed = allMissingValuesAreSuppressed(
          mapQueryResponse.data,
          metricConfig.metricId,
        )

        const isGeorgiaWithCountyData =
          props.fips.code === '13' && !hasSelfButNotChildGeoData

        const totalPopulationPhrase = isAtlantaMode
          ? 'Metro Atlanta Counties'
          : getTotalACSPopulationPhrase(acsPopulationQueryResponse.data)

        let subPopSourceLabel =
          Object.values(dataSourceMetadataMap).find((metadata) =>
            metadata.dataset_ids.includes(
              parentGeoQueryResponse.consumedDatasetIds[0] as DatasetId,
            ),
          )?.data_source_acronym ?? ''

        // US Congress denominators come from @unitestedstates not CAWP
        if (props.dataTypeConfig.dataTypeId === 'women_in_us_congress') {
          subPopSourceLabel = '@unitedstates'
        }

        const sviQueryResponse: MetricQueryResponse = queryResponses[3] || null
        const sortArgs = getSortArgs(demographicType)

        const fieldValues = mapQueryResponse.getFieldValues(
          /* fieldName: DemographicType */ demographicType,
          /* relevantMetric: MetricId */ metricConfig.metricId,
        )

        const demographicGroups: DemographicGroup[] =
          fieldValues.withData.sort.apply(fieldValues.withData, sortArgs)

        let dataForActiveDemographicGroup = mapQueryResponse
          .getValidRowsForField(metricConfig.metricId)
          .filter(
            (row: HetRow) => row[demographicType] === activeDemographicGroup,
          )

        let allDataForActiveDemographicGroup = mapQueryResponse.data.filter(
          (row: HetRow) => row[demographicType] === activeDemographicGroup,
        )

        let dataForMultimaps = mapQueryResponse.data
        let atlantaPopulation

        const popId = metricConfig.rateDenominatorMetric?.metricId

        if (isAtlantaMode) {
          dataForActiveDemographicGroup = dataForActiveDemographicGroup.filter(
            (row) =>
              props.fips.code === '13'
                ? ATLANTA_METRO_COUNTY_FIPS.includes(row.fips)
                : true,
          )
          allDataForActiveDemographicGroup =
            allDataForActiveDemographicGroup.filter((row) =>
              props.fips.code === '13'
                ? ATLANTA_METRO_COUNTY_FIPS.includes(row.fips)
                : true,
            )

          dataForMultimaps = dataForMultimaps.filter((row) =>
            props.fips.code === '13'
              ? ATLANTA_METRO_COUNTY_FIPS.includes(row.fips)
              : true,
          )

          if (popId) {
            atlantaPopulation = dataForMultimaps
              .filter((row: HetRow) => row[props.demographicType] === 'All')
              .reduce((total, row) => total + row[popId], 0)
          }
        }

        const atlantaData = isAtlantaMode
          ? [
              {
                fips: '13',
                fips_name: 'Georgia',
                [demographicType]: 'All',
                [popId as string]: atlantaPopulation,
              },
            ]
          : []

        const subPopulationPhrase = getSubPopulationPhrase(
          isAtlantaMode ? atlantaData : parentGeoQueryResponse.data,
          subPopSourceLabel,
          demographicType,
          props.dataTypeConfig,
        )

        const dataForSvi: HetRow[] =
          sviQueryResponse
            ?.getValidRowsForField(SVI)
            ?.filter((row) =>
              dataForActiveDemographicGroup.find(
                ({ fips }) => row.fips === fips,
              ),
            ) || []

        if (!props.fips.isUsa()) {
          dataForActiveDemographicGroup = dataForActiveDemographicGroup.map(
            (row) => {
              const thisCountySviRow = dataForSvi.find(
                (sviRow) => sviRow.fips === row.fips,
              )
              return {
                ...row,
                rating: findVerboseRating(thisCountySviRow?.svi),
              }
            },
          )
        }

        const { highestValues, lowestValues } = getExtremeValues(
          dataForActiveDemographicGroup,
          metricConfig.metricId,
          SIZE_OF_HIGHEST_LOWEST_GEOS_RATES_LIST,
        )

        // Create and populate a map of demographicType display name to options
        const filterOptions: Record<
          DemographicTypeDisplayName,
          DemographicGroup[]
        > = {
          [DEMOGRAPHIC_DISPLAY_TYPES[demographicType]]: demographicGroups,
        }

        const hideGroupDropdown =
          Object.values(filterOptions).toString() === ALL

        // if a previously selected group is no longer valid, reset to ALL
        let dropdownValue = ALL
        if (
          filterOptions[DEMOGRAPHIC_DISPLAY_TYPES[demographicType]].includes(
            activeDemographicGroup,
          )
        ) {
          dropdownValue = activeDemographicGroup
        } else {
          setActiveDemographicGroup(ALL)
          setParameter(MAP_GROUP_PARAM, ALL)
        }

        function handleMapGroupClick(_: any, newGroup: DemographicGroup) {
          setActiveDemographicGroup(newGroup)
          const groupCode = getGroupParamFromDemographicGroup(newGroup)
          setParameter(MAP_GROUP_PARAM, groupCode)
        }

        const displayData = isExtremesMode
          ? highestValues.concat(lowestValues)
          : dataForActiveDemographicGroup

        const isPhrmaAdherence =
          PHRMA_METRICS.includes(metricId) && metricConfig.type === 'pct_rate'
        const isSummaryLegend =
          (hasSelfButNotChildGeoData || props.fips.isCounty()) &&
          !isPhrmaAdherence

        const mapConfig = props.dataTypeConfig.mapConfig

        if (dataForActiveDemographicGroup?.length <= 1) setIsExtremesMode(false)

        if (!dataForActiveDemographicGroup?.length || !metricConfig)
          return (
            <>
              <div className='w-full'>
                <ChartTitle
                  title={'Rate map unavailable: ' + title}
                  subtitle={subtitle}
                />
              </div>
              <MissingDataAlert
                dataName={title}
                demographicTypeString={
                  DEMOGRAPHIC_DISPLAY_TYPES[demographicType]
                }
                isMapCard={true}
                fips={props.fips}
                dueToSuppression={allMissingDataIsSuppressed}
              />
            </>
          )

        const highestLowestGroupsByFips = getHighestLowestGroupsByFips(
          props.dataTypeConfig,
          mapQueryResponse.data,
          props.demographicType,
          metricId,
        )

        const percentRateTooHigh =
          metricConfig.type === 'pct_rate' &&
          mapQueryResponse.data.some((row) => row[metricConfig.metricId] > 100)

        const fieldRange = useMemo(() => {
          return mapQueryResponse.getFieldRange(metricConfig.metricId)
        }, [mapQueryResponse.data, metricConfig.metricId])

        const colorScale = useMemo(() => {
          return createColorScale({
            data: displayData,
            metricId: metricConfig.metricId,
            colorScheme: mapConfig.scheme,
            isUnknown: false,
            fips: props.fips,
            reverse: !mapConfig.higherIsBetter,
            isPhrmaAdherence,
            mapConfig,
          })
        }, [
          displayData,
          metricConfig.metricId,
          mapConfig.scheme,
          props.fips,
          mapConfig.higherIsBetter,
          isPhrmaAdherence,
          mapConfig,
        ])

        return (
          <>
            <MultiMapDialog
              dataTypeConfig={props.dataTypeConfig}
              demographicType={demographicType}
              demographicGroups={demographicGroups}
              demographicGroupsNoData={fieldValues.noData}
              countColsMap={countColsMap}
              data={dataForMultimaps}
              fieldRange={fieldRange}
              fips={props.fips}
              geoData={geoData}
              handleClose={() => {
                setMultimapOpen(false)
              }}
              handleMapGroupClick={handleMapGroupClick}
              hasSelfButNotChildGeoData={hasSelfButNotChildGeoData}
              metadata={metadata}
              metricConfig={metricConfig}
              open={Boolean(multimapOpen)} // Use local state for multimapOpen
              queries={queries}
              queryResponses={queryResponses}
              totalPopulationPhrase={totalPopulationPhrase}
              subPopulationPhrase={subPopulationPhrase}
              updateFipsCallback={props.updateFipsCallback}
              useSmallSampleMessage={
                !mapQueryResponse.dataIsMissing() &&
                (props.dataTypeConfig.surveyCollectedData ?? false)
              }
              pageIsSmall={!isMd}
              reportTitle={props.reportTitle}
              subtitle={subtitle}
              scrollToHash={HASH_ID}
              isPhrmaAdherence={isPhrmaAdherence}
              isAtlantaMode={isAtlantaMode}
              setIsAtlantaMode={setIsAtlantaMode}
            />

            {!mapQueryResponse.dataIsMissing() && !hideGroupDropdown && (
              <div className='hide-on-screenshot remove-height-on-screenshot pt-0 pb-1 text-left'>
                <DemographicGroupMenu
                  idSuffix={`-${props.fips.code}-${props.dataTypeConfig.dataTypeId}`}
                  demographicType={demographicType}
                  dataTypeId={props.dataTypeConfig.dataTypeId}
                  setMultimapOpen={setMultimapOpen}
                  value={dropdownValue}
                  options={filterOptions}
                  onOptionUpdate={handleMapGroupClick}
                />
                <HetDivider />

                <HetLinkButton
                  onClick={() => {
                    setMultimapOpen(true)
                  }}
                  className='flex items-center'
                  ariaLabel={`Launch multiple maps view with side-by-side maps of each ${prettyDemoType} group`}
                >
                  <GridView />
                  <span className='mt-1 px-1'>
                    View {prettyDemoType} disparties across multiple small maps
                  </span>
                </HetLinkButton>
              </div>
            )}

            <div className='pt-0'>
              <div className='flex flex-wrap'>
                <div className='w-full'>
                  <ChartTitle
                    title={title}
                    subtitle={subtitle}
                    filterButton={
                      isExtremesMode ? (
                        <HetLinkButton
                          buttonClassName='py-0 mx-0'
                          onClick={() => setIsExtremesMode(false)}
                        >
                          Reset to show all {pluralChildFips}
                        </HetLinkButton>
                      ) : null
                    }
                  />
                  {isGeorgiaWithCountyData && !isExtremesMode && (
                    <HetLinkButton
                      onClick={() => setIsAtlantaMode(!isAtlantaMode)}
                      className='flex items-center'
                    >
                      <span className='mt-1 px-1'>
                        {isAtlantaMode
                          ? 'Return to all counties'
                          : 'Highlight metro Atlanta counties'}
                      </span>
                    </HetLinkButton>
                  )}
                </div>

                <div className={mapIsWide ? 'sm:w-8/12 md:w-9/12' : 'w-full'}>
                  <div
                    className='w-full'
                    style={{ minHeight: preloadHeight * 0.3 }}
                  >
                    <ChoroplethMap
                      demographicType={demographicType}
                      highestLowestGroupsByFips={highestLowestGroupsByFips}
                      activeDemographicGroup={activeDemographicGroup}
                      countColsMap={countColsMap}
                      data={displayData}
                      filename={filename}
                      fips={props.fips}
                      geoData={geoData}
                      hideLegend={true}
                      hideMissingDataTooltip={isExtremesMode}
                      legendData={dataForActiveDemographicGroup}
                      legendTitle={metricConfig.shortLabel.toLowerCase()}
                      isExtremesMode={isExtremesMode}
                      metricConfig={metricConfig}
                      showCounties={
                        !props.fips.isUsa() && !hasSelfButNotChildGeoData
                      }
                      signalListeners={signalListeners}
                      mapConfig={mapConfig}
                      isPhrmaAdherence={isPhrmaAdherence}
                      isAtlantaMode={isAtlantaMode}
                      isSummaryLegend={isSummaryLegend}
                      updateFipsCallback={props.updateFipsCallback}
                      colorScale={colorScale}
                      allMissingDataIsSuppressed={allMissingDataIsSuppressed}
                    />
                  </div>
                </div>

                <div className={mapIsWide ? 'sm:w-4/12 md:w-3/12' : 'w-full'}>
                  <RateMapLegend
                    colorScale={colorScale}
                    dataTypeConfig={props.dataTypeConfig}
                    metricConfig={metricConfig}
                    legendTitle={metricConfig.shortLabel}
                    data={allDataForActiveDemographicGroup}
                    description={'Legend for rate map'}
                    fipsTypeDisplayName={fipsTypeDisplayName}
                    mapConfig={mapConfig}
                    isSummaryLegend={isSummaryLegend}
                    isPhrmaAdherence={isPhrmaAdherence}
                    allMissingDataIsSuppressed={allMissingDataIsSuppressed}
                    fips={props.fips}
                    isCompareMode={isCompareMode}
                  />
                </div>

                <div>
                  <GeoContext
                    fips={props.fips}
                    updateFipsCallback={props.updateFipsCallback}
                    dataTypeConfig={props.dataTypeConfig}
                    totalPopulationPhrase={totalPopulationPhrase}
                    subPopulationPhrase={subPopulationPhrase}
                    sviQueryResponse={sviQueryResponse}
                    isAtlantaMode={isAtlantaMode}
                  />
                </div>
              </div>
              <div
                id={
                  props.isCompareCard
                    ? EXTREMES_2_PARAM_KEY
                    : EXTREMES_1_PARAM_KEY
                }
              >
                {!mapQueryResponse.dataIsMissing() &&
                  dataForActiveDemographicGroup.length > 1 &&
                  !isAtlantaMode && (
                    <ExtremesListBox
                      dataTypeConfig={props.dataTypeConfig}
                      selectedRaceSuffix={selectedRaceSuffix}
                      metricConfig={metricConfig}
                      isOpen={isExtremesMode}
                      setIsOpen={setIsExtremesMode}
                      highestValues={highestValues}
                      lowestValues={lowestValues}
                      parentGeoQueryResponse={parentGeoQueryResponse}
                      fips={props.fips}
                      qualifierItems={qualifierItems}
                      qualifierMessage={qualifierMessage}
                      demographicType={demographicType}
                      activeDemographicGroup={activeDemographicGroup}
                    />
                  )}
                {percentRateTooHigh && (
                  <HetNotice
                    title='Percentages Over 100%'
                    kind='data-integrity'
                  >
                    <>
                      In some locations, the <HetTerm>percent rates</HetTerm>{' '}
                      exceed 100%, which can be confusing and may indicate
                      inconsistency in the source data.
                    </>
                    {metricId === 'vaccinated_pct_rate' && (
                      <>
                        {' '}
                        In the case of <HetTerm>COVID-19 vaccinations</HetTerm>,
                        the number of first-dose vaccines administered in a
                        location could have been higher than the population of
                        that location if individuals came from other locations
                        to receive the vaccine, and also if individuals chose to
                        receive more than a single "first-dose" vaccine.
                      </>
                    )}
                  </HetNotice>
                )}
              </div>
            </div>
          </>
        )
      }}
    </CardWrapper>
  )
}
