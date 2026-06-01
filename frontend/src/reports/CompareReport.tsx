import { useAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import AgeAdjustedTableCard from '../cards/AgeAdjustedTableCard'
import CompareBubbleChartCard from '../cards/CompareBubbleChartCard'
import MapCard from '../cards/MapCard'
import RateBarChartCard from '../cards/RateBarChartCard'
import RateTrendsChartCard from '../cards/RateTrendsChartCard'
import ShareTrendsChartCard from '../cards/ShareTrendsChartCard'
import StackedSharesBarChartCard from '../cards/StackedSharesBarChartCard'
import TableCard from '../cards/TableCard'
import UnknownsMapCard from '../cards/UnknownsMapCard'
import type { DropdownVarId } from '../data/config/DropDownIds'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type {
  DataTypeConfig,
  DataTypeId,
} from '../data/config/MetricConfigTypes'
import {
  applyGeoOverrides,
  metricConfigFromDtConfig,
} from '../data/config/MetricConfigUtils'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import { AGE, RACE } from '../data/utils/Constants'
import type { Fips } from '../data/utils/Fips'
import { SHOW_CORRELATION_CARD } from '../featureFlags'
import ReportSidebarDesktop from '../pages/ui/ReportSidebarDesktop'
import { useIsBreakpointAndUp } from '../utils/hooks/useIsBreakpointAndUp'
import { useParamState } from '../utils/hooks/useParamState'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import type { MadLibId } from '../utils/MadLibs'
import {
  selectedDataTypeConfig1Atom,
  selectedDataTypeConfig2Atom,
} from '../utils/sharedSettingsState'
import {
  DATA_TYPE_1_PARAM,
  DATA_TYPE_2_PARAM,
  DEMOGRAPHIC_PARAM,
  getParameter,
  psSubscribe,
  swapOldDatatypeParams,
} from '../utils/urlutils'
import ContrastInsightSection from './ContrastInsightSection'
import { reportProviderSteps } from './ReportProviderSteps'
import RowOfTwoOptionalMetrics from './RowOfTwoOptionalMetrics'
import { getAllDemographicOptions } from './reportUtils'
import ReportTopbarMobile from './ui/ReportTopbarMobile'
import ShareButtons, { SHARE_LABEL } from './ui/ShareButtons'

/* Takes dropdownVar and fips inputs for each side-by-side column.
Input values for each column can be the same. */

interface CompareReportProps {
  key: string
  dropdownVarId1: DropdownVarId
  dropdownVarId2: DropdownVarId
  fips1: Fips
  fips2: Fips
  updateFips1Callback: (fips: Fips) => void
  updateFips2Callback: (fips: Fips) => void
  isScrolledToTop: boolean
  reportStepHashIds?: ScrollableHashId[]
  setReportStepHashIds?: (reportStepHashIds: ScrollableHashId[]) => void
  headerScrollMargin: number
  reportTitle: string
  trackerMode: MadLibId
  setTrackerMode: React.Dispatch<React.SetStateAction<MadLibId>>
}

export default function CompareReport(props: CompareReportProps) {
  const isDesktopLayout = useIsBreakpointAndUp('md')

  const isRaceBySex =
    props.dropdownVarId1 === 'hiv_black_women' ||
    props.dropdownVarId2 === 'hiv_black_women'
  const defaultDemo = isRaceBySex ? AGE : RACE

  const [demographicType, setDemographicType] = useParamState<DemographicType>(
    DEMOGRAPHIC_PARAM,
    defaultDemo,
  )

  const [dataTypeConfig1, setDtConfig1] = useAtom(selectedDataTypeConfig1Atom)
  const [dataTypeConfig2, setDtConfig2] = useAtom(selectedDataTypeConfig2Atom)

  const resolvedConfig1 = useMemo(
    () =>
      dataTypeConfig1
        ? applyGeoOverrides(
            dataTypeConfig1,
            props.fips1.getGeographicBreakdown(),
          )
        : null,
    [dataTypeConfig1, props.fips1.code],
  )

  const resolvedConfig2 = useMemo(
    () =>
      dataTypeConfig2
        ? applyGeoOverrides(
            dataTypeConfig2,
            props.fips2.getGeographicBreakdown(),
          )
        : null,
    [dataTypeConfig2, props.fips2.code],
  )

  const { enabledDemographicOptionsMap, disabledDemographicOptions } = useMemo(
    () =>
      getAllDemographicOptions(
        resolvedConfig1,
        props.fips1,
        resolvedConfig2,
        props.fips2,
      ),
    [resolvedConfig1, props.fips1, resolvedConfig2, props.fips2],
  )

  // if DemographicType in state doesn't work for both sides of compare, default to first working option
  useEffect(() => {
    if (
      resolvedConfig1 &&
      resolvedConfig2 &&
      !Object.values(enabledDemographicOptionsMap).includes(demographicType)
    ) {
      setDemographicType(
        Object.values(enabledDemographicOptionsMap)[0] as DemographicType,
      )
    }
  }, [
    resolvedConfig1,
    resolvedConfig2,
    demographicType,
    enabledDemographicOptionsMap,
  ])

  useEffect(() => {
    const readParams = () => {
      const dtParam1 = getParameter(
        DATA_TYPE_1_PARAM,
        undefined,
        (val: DataTypeId) => {
          val = swapOldDatatypeParams(val)
          return METRIC_CONFIG[props.dropdownVarId1].find(
            (cfg) => cfg.dataTypeId === val,
          )
        },
      )
      const dtParam2 = getParameter(
        DATA_TYPE_2_PARAM,
        undefined,
        (val: DataTypeId) => {
          val = swapOldDatatypeParams(val)
          return (
            METRIC_CONFIG[props.dropdownVarId2]?.find(
              (cfg) => cfg.dataTypeId === val,
            ) ?? METRIC_CONFIG[props.dropdownVarId2][0]
          )
        },
      )

      const newDtParam1 = dtParam1 ?? METRIC_CONFIG?.[props.dropdownVarId1]?.[0]
      setDtConfig1(newDtParam1)

      const newDtParam2 =
        props.trackerMode === 'comparegeos'
          ? newDtParam1
          : (dtParam2 ?? METRIC_CONFIG?.[props.dropdownVarId2]?.[0])
      setDtConfig2(newDtParam2)
    }
    const psSub = psSubscribe(readParams, 'twovar')
    readParams()
    return () => {
      if (psSub) {
        psSub.unsubscribe()
      }
    }
  }, [props.dropdownVarId1, props.dropdownVarId2])

  // when variable config changes (new data type), re-calc available card steps in TableOfContents
  useEffect(() => {
    const hashIdsOnScreen: any[] = Object.keys(reportProviderSteps).filter(
      (key) => document.getElementById(key)?.id !== undefined,
    )

    hashIdsOnScreen && props.setReportStepHashIds?.(hashIdsOnScreen)
  }, [resolvedConfig1, resolvedConfig2])

  if (resolvedConfig1 === null || resolvedConfig2 === null) {
    return <></>
  }

  const rateConfig1 =
    resolvedConfig1 && metricConfigFromDtConfig('rate', resolvedConfig1)
  const rateConfig2 =
    resolvedConfig2 && metricConfigFromDtConfig('rate', resolvedConfig2)
  const inequityConfig1 =
    resolvedConfig1 && metricConfigFromDtConfig('inequity', resolvedConfig1)
  const inequityConfig2 =
    resolvedConfig2 && metricConfigFromDtConfig('inequity', resolvedConfig2)
  const ageAdjustedRatioConfig1 =
    resolvedConfig1 && metricConfigFromDtConfig('ratio', resolvedConfig1)
  const ageAdjustedRatioConfig2 =
    resolvedConfig2 && metricConfigFromDtConfig('ratio', resolvedConfig2)
  const showRatesOverTimeCardRow =
    rateConfig1?.timeSeriesCadence || rateConfig2?.timeSeriesCadence
  const showInequitiesOverTimeCardRow = inequityConfig1 || inequityConfig2
  const showAgeAdjustCardRow =
    ageAdjustedRatioConfig1 || ageAdjustedRatioConfig2

  const dt1 = resolvedConfig1?.fullDisplayName
  const dt2 = resolvedConfig2?.fullDisplayName
  const demo = DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]
  const loc1 = props.fips1.getSentenceDisplayName()
  const loc2 = props.fips2.getSentenceDisplayName()

  let browserTitle = dt1
  if (dt2 && dt1 !== dt2) browserTitle += ` and ${dt2}`
  browserTitle += ` by ${demo} in ${loc1}`
  if (loc1 !== loc2) browserTitle += ` and ${loc2}`

  const offerJumpToAgeAdjustment = [
    props.dropdownVarId1,
    props.dropdownVarId2,
  ].includes('covid')

  const showCorrelationCard =
    SHOW_CORRELATION_CARD && props.trackerMode === 'comparevars'

  return (
    <>
      <title>{`${browserTitle} - Health Equity Tracker`}</title>
      <div className='flex'>
        {/* CARDS COLUMN */}
        <div className='w-full md:w-10/12'>
          {/* Mode selectors here on small/medium, in ReportSidebarDesktop instead for larger screens */}
          <ReportTopbarMobile
            trackerMode={props.trackerMode}
            setTrackerMode={props.setTrackerMode}
            offerJumpToAgeAdjustment={offerJumpToAgeAdjustment}
            enabledDemographicOptionsMap={enabledDemographicOptionsMap}
            disabledDemographicOptions={disabledDemographicOptions}
          />

          <div className='flex w-full flex-col content-center'>
            {showCorrelationCard && rateConfig1 && rateConfig2 && (
              <CompareBubbleChartCard
                fips1={props.fips1}
                dataTypeConfig1={resolvedConfig1}
                dataTypeConfig2={resolvedConfig2}
                rateConfig1={rateConfig1}
                rateConfig2={rateConfig2}
                demographicType={demographicType}
                reportTitle={props.reportTitle}
              />
            )}
            {/* SIDE-BY-SIDE 100K MAP CARDS */}
            {resolvedConfig1 && resolvedConfig2 && (
              <ContrastInsightSection
                hashId='rate-map'
                dataTypeConfig1={resolvedConfig1}
                dataTypeConfig2={resolvedConfig2}
                fips1={props.fips1}
                fips2={props.fips2}
                demographicType={demographicType}
              />
            )}
            <RowOfTwoOptionalMetrics
              trackerMode={props.trackerMode}
              id='rate-map'
              // NOTE: map card handles its own geo overrides so we send base configs rather than resolved
              dataTypeConfig1={dataTypeConfig1!}
              dataTypeConfig2={dataTypeConfig2!}
              fips1={props.fips1}
              fips2={props.fips2}
              updateFips1={props.updateFips1Callback}
              updateFips2={props.updateFips2Callback}
              headerScrollMargin={props.headerScrollMargin}
              createCard={(
                dataTypeConfig: DataTypeConfig,
                fips: Fips,
                updateFips: (fips: Fips) => void,
                _dropdown: any,
                isCompareCard?: boolean,
              ) => (
                <MapCard
                  dataTypeConfig={dataTypeConfig}
                  fips={fips}
                  updateFipsCallback={(fips: Fips) => {
                    updateFips(fips)
                  }}
                  demographicType={demographicType}
                  isCompareCard={isCompareCard}
                  reportTitle={props.reportTitle}
                  trackerMode={props.trackerMode}
                />
              )}
            />

            {/* SIDE-BY-SIDE RATE TREND CARDS */}
            {showRatesOverTimeCardRow && (
              <RowOfTwoOptionalMetrics
                trackerMode={props.trackerMode}
                id='rates-over-time'
                dataTypeConfig1={resolvedConfig1}
                dataTypeConfig2={resolvedConfig2}
                fips1={props.fips1}
                fips2={props.fips2}
                headerScrollMargin={props.headerScrollMargin}
                createCard={(
                  dataTypeConfig: DataTypeConfig,
                  fips: Fips,
                  _unusedUpdateFips: (fips: Fips) => void,
                  _unusedDropdown: any,
                  isCompareCard: boolean | undefined,
                ) => (
                  <RateTrendsChartCard
                    dataTypeConfig={dataTypeConfig}
                    demographicType={demographicType}
                    fips={fips}
                    isCompareCard={isCompareCard}
                    reportTitle={props.reportTitle}
                  />
                )}
              />
            )}

            {/* SIDE-BY-SIDE 100K BAR GRAPH CARDS */}

            <RowOfTwoOptionalMetrics
              trackerMode={props.trackerMode}
              id='rate-chart'
              dataTypeConfig1={resolvedConfig1}
              dataTypeConfig2={resolvedConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              headerScrollMargin={props.headerScrollMargin}
              createCard={(
                dataTypeConfig: DataTypeConfig,
                fips: Fips,
                _unusedUpdateFips: (fips: Fips) => void,
                _unusedDropdown: any,
                isCompareCard: boolean | undefined,
              ) => (
                <RateBarChartCard
                  dataTypeConfig={dataTypeConfig}
                  demographicType={demographicType}
                  fips={fips}
                  isCompareCard={isCompareCard}
                  reportTitle={props.reportTitle}
                />
              )}
            />

            {/* SIDE-BY-SIDE UNKNOWNS MAP CARDS */}
            <RowOfTwoOptionalMetrics
              trackerMode={props.trackerMode}
              id='unknown-demographic-map'
              dataTypeConfig1={resolvedConfig1}
              dataTypeConfig2={resolvedConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              headerScrollMargin={props.headerScrollMargin}
              updateFips1={props.updateFips1Callback}
              updateFips2={props.updateFips2Callback}
              createCard={(
                dataTypeConfig: DataTypeConfig,
                fips: Fips,
                updateFips: (fips: Fips) => void,
                _unusedDropdown: any,
                isCompareCard: boolean | undefined,
              ) => (
                <UnknownsMapCard
                  overrideAndWithOr={demographicType === RACE}
                  dataTypeConfig={dataTypeConfig}
                  fips={fips}
                  updateFipsCallback={(fips: Fips) => {
                    updateFips(fips)
                  }}
                  demographicType={demographicType}
                  isCompareCard={isCompareCard}
                  reportTitle={props.reportTitle}
                />
              )}
            />

            {/* SIDE-BY-SIDE SHARE INEQUITY TREND CARDS */}

            {showInequitiesOverTimeCardRow && (
              <RowOfTwoOptionalMetrics
                trackerMode={props.trackerMode}
                id='inequities-over-time'
                dataTypeConfig1={resolvedConfig1}
                dataTypeConfig2={resolvedConfig2}
                fips1={props.fips1}
                fips2={props.fips2}
                headerScrollMargin={props.headerScrollMargin}
                createCard={(
                  dataTypeConfig: DataTypeConfig,
                  fips: Fips,
                  _unusedUpdateFips: (fips: Fips) => void,
                  _unusedDropdown: any,
                  isCompareCard: boolean | undefined,
                ) => (
                  <ShareTrendsChartCard
                    dataTypeConfig={dataTypeConfig}
                    demographicType={demographicType}
                    fips={fips}
                    isCompareCard={isCompareCard}
                    reportTitle={props.reportTitle}
                  />
                )}
              />
            )}

            {/* SIDE-BY-SIDE STACKED SHARES BAR CHARTS CARDS */}
            <RowOfTwoOptionalMetrics
              trackerMode={props.trackerMode}
              id='population-vs-distribution'
              dataTypeConfig1={resolvedConfig1}
              dataTypeConfig2={resolvedConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              headerScrollMargin={props.headerScrollMargin}
              createCard={(
                dataTypeConfig: DataTypeConfig,
                fips: Fips,
                _unusedUpdateFips: (fips: Fips) => void,
                _unusedDropdown: any,
                isCompareCard: boolean | undefined,
              ) => (
                <StackedSharesBarChartCard
                  dataTypeConfig={dataTypeConfig}
                  demographicType={demographicType}
                  fips={fips}
                  isCompareCard={isCompareCard}
                  reportTitle={props.reportTitle}
                />
              )}
            />

            {/* SIDE-BY-SIDE DATA TABLE CARDS */}
            <RowOfTwoOptionalMetrics
              trackerMode={props.trackerMode}
              id='data-table'
              dataTypeConfig1={resolvedConfig1}
              dataTypeConfig2={resolvedConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              updateFips1={props.updateFips1Callback}
              updateFips2={props.updateFips2Callback}
              headerScrollMargin={props.headerScrollMargin}
              createCard={(
                dataTypeConfig: DataTypeConfig,
                fips: Fips,
                _unusedUpdateFips: (fips: Fips) => void,
                _unusedDropdown: any,
                isCompareCard: boolean | undefined,
              ) => (
                <TableCard
                  fips={fips}
                  dataTypeConfig={dataTypeConfig}
                  demographicType={demographicType}
                  isCompareCard={isCompareCard}
                  reportTitle={props.reportTitle}
                />
              )}
            />

            {/* SIDE-BY-SIDE AGE-ADJUSTED TABLE CARDS */}

            {showAgeAdjustCardRow && (
              <RowOfTwoOptionalMetrics
                trackerMode={props.trackerMode}
                id='age-adjusted-ratios'
                // specific data type
                dataTypeConfig1={resolvedConfig1}
                dataTypeConfig2={resolvedConfig2}
                // parent variable
                dropdownVarId1={props.dropdownVarId1}
                dropdownVarId2={props.dropdownVarId2}
                fips1={props.fips1}
                fips2={props.fips2}
                updateFips1={props.updateFips1Callback}
                updateFips2={props.updateFips2Callback}
                headerScrollMargin={props.headerScrollMargin}
                createCard={(
                  dataTypeConfig: DataTypeConfig,
                  fips: Fips,
                  _unusedUpdateFips: (fips: Fips) => void,
                  dropdownVarId?: DropdownVarId,
                  isCompareCard?: boolean,
                ) => (
                  <AgeAdjustedTableCard
                    fips={fips}
                    dataTypeConfig={dataTypeConfig}
                    demographicType={demographicType}
                    dropdownVarId={dropdownVarId}
                    isCompareCard={isCompareCard}
                    reportTitle={props.reportTitle}
                  />
                )}
              />
            )}
          </div>
        </div>
        {/* SIDEBAR COLUMN - DESKTOP ONLY */}
        {props.reportStepHashIds && (
          <div className='hidden items-start md:flex md:w-2/12 md:flex-col'>
            <ReportSidebarDesktop
              isScrolledToTop={props.isScrolledToTop}
              reportStepHashIds={props.reportStepHashIds}
              floatTopOffset={props.headerScrollMargin}
              reportTitle={props.reportTitle}
              isMobile={!isDesktopLayout}
              trackerMode={props.trackerMode}
              setTrackerMode={props.setTrackerMode}
              enabledDemographicOptionsMap={enabledDemographicOptionsMap}
              disabledDemographicOptions={disabledDemographicOptions}
              showInsightsButton={false}
            />
          </div>
        )}
      </div>
      <div className='mt-24'>
        <p>{SHARE_LABEL}</p>
        <ShareButtons
          reportTitle={props.reportTitle}
          isMobile={!isDesktopLayout}
        />{' '}
      </div>
    </>
  )
}
