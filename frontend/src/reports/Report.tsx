import { useAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import AgeAdjustedTableCard from '../cards/AgeAdjustedTableCard'
import MapCard from '../cards/MapCard'
import RateBarChartCard from '../cards/RateBarChartCard'
import RateTrendsChartCard from '../cards/RateTrendsChartCard'
import ShareTrendsChartCard from '../cards/ShareTrendsChartCard'
import StackedSharesBarChartCard from '../cards/StackedSharesBarChartCard'
import TableCard from '../cards/TableCard'
import UnknownsMapCard from '../cards/UnknownsMapCard'
import type { DropdownVarId } from '../data/config/DropDownIds'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig, MetricId } from '../data/config/MetricConfigTypes'
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
import { SHOW_INSIGHT_GENERATION } from '../featureFlags'
import InsightReportCard from '../pages/ExploreData/InsightReportCard'
import InsightReportModal from '../pages/ExploreData/InsightReportModal'
import ReportSidebarDesktop from '../pages/ui/ReportSidebarDesktop'
import HetLazyLoader from '../styles/HetComponents/HetLazyLoader'
import { useIsBreakpointAndUp } from '../utils/hooks/useIsBreakpointAndUp'
import { useParamState } from '../utils/hooks/useParamState'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import type { MadLibId } from '../utils/MadLibs'
import {
  selectedDataTypeConfig1Atom,
  selectedDemographicTypeAtom,
  selectedFipsAtom,
} from '../utils/sharedSettingsState'
import {
  DATA_TYPE_1_PARAM,
  DEMOGRAPHIC_PARAM,
  getParameter,
  REPORT_INSIGHT_PARAM_KEY,
  swapOldDatatypeParams,
} from '../utils/urlutils'
import { reportProviderSteps } from './ReportProviderSteps'
import { getAllDemographicOptions } from './reportUtils'
import ReportTopbarMobile from './ui/ReportTopbarMobile'
import ShareButtons, { SHARE_LABEL } from './ui/ShareButtons'

interface ReportProps {
  key: string
  dropdownVarId: DropdownVarId
  fips: Fips
  updateFipsCallback: (fips: Fips) => void
  isScrolledToTop: boolean
  reportStepHashIds?: ScrollableHashId[]
  setReportStepHashIds?: (hashIdsOnScreen: any[]) => void
  headerScrollMargin: number
  reportTitle: string
  trackerMode: MadLibId
  setTrackerMode: React.Dispatch<React.SetStateAction<MadLibId>>
  dataTypesToDefine: Array<[string, DataTypeConfig[]]>
}

export interface ChartData {
  knownData: Readonly<Record<string, any>>[]
  metricIds: MetricId[]
}

export function Report(props: ReportProps) {
  const isDesktopLayout = useIsBreakpointAndUp('md')
  const isRaceBySex = props.dropdownVarId === 'hiv_black_women'
  const defaultDemo = isRaceBySex ? AGE : RACE

  const [demographicType, setDemographicType] = useParamState<DemographicType>(
    DEMOGRAPHIC_PARAM,
    defaultDemo,
  )

  const [insightIsOpen] = useParamState(REPORT_INSIGHT_PARAM_KEY)
  const insightMode = Boolean(SHOW_INSIGHT_GENERATION && insightIsOpen)

  const [dataTypeConfig, setDataTypeConfig] = useAtom(
    selectedDataTypeConfig1Atom,
  )
  const [, setSelectedFips] = useAtom(selectedFipsAtom)
  const [, setSelectedDemographicType] = useAtom(selectedDemographicTypeAtom)

  const resolvedConfig = useMemo(
    () =>
      applyGeoOverrides(
        dataTypeConfig ?? METRIC_CONFIG[props.dropdownVarId]?.[0],
        props.fips.getGeographicBreakdown(),
      ),
    [dataTypeConfig, props.dropdownVarId, props.fips.code],
  )

  const { enabledDemographicOptionsMap, disabledDemographicOptions } = useMemo(
    () => getAllDemographicOptions(resolvedConfig, props.fips),
    [resolvedConfig, props.fips],
  )

  // if the DemographicType in state doesn't work for the selected datatype, reset to the first demographic type option that works
  useEffect(() => {
    if (
      resolvedConfig &&
      !Object.values(enabledDemographicOptionsMap).includes(demographicType)
    ) {
      setDemographicType(
        Object.values(enabledDemographicOptionsMap)[0] as DemographicType,
      )
    }
  }, [resolvedConfig, demographicType, enabledDemographicOptionsMap])

  useEffect(() => {
    // No psSubscribe here: ExploreDataPage.readParams owns selectedDataTypeConfig1Atom
    // on popstate. A stale closure over props.dropdownVarId would corrupt the atom,
    // triggering a spurious demographic-reset pushState that breaks back navigation.
    const dtParam1 = getParameter(
      DATA_TYPE_1_PARAM,
      undefined,
      (val: string) => {
        val = swapOldDatatypeParams(val)
        return METRIC_CONFIG[props.dropdownVarId]?.find(
          (cfg) => cfg.dataTypeId === val,
        )
      },
    )
    setDataTypeConfig(dtParam1 ?? METRIC_CONFIG?.[props.dropdownVarId]?.[0])
    setSelectedFips(props.fips)
    setSelectedDemographicType(demographicType)
  }, [props.dropdownVarId, demographicType, props.fips])

  // when variable config changes (new data type), re-calc available card steps TableOfContents
  useEffect(() => {
    const hashIdsOnScreen: any[] = Object.keys(reportProviderSteps).filter(
      (key) => document.getElementById(key)?.id !== undefined,
    )

    hashIdsOnScreen && props.setReportStepHashIds?.(hashIdsOnScreen)
  }, [resolvedConfig])

  const demographicTypeString: string =
    DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType]

  const browserTitle = `${
    (resolvedConfig?.fullDisplayName as string) ?? 'Data'
  } by ${demographicTypeString} in ${props.fips.getFullDisplayName()}`

  const offerJumpToAgeAdjustment = [
    'covid_deaths',
    'covid_hospitalizations',
  ].includes(props.dropdownVarId)

  const rateMetricConfig =
    resolvedConfig && metricConfigFromDtConfig('rate', resolvedConfig)
  const shareMetricConfig =
    resolvedConfig && metricConfigFromDtConfig('share', resolvedConfig)
  const inequityOverTimeConfig =
    resolvedConfig && metricConfigFromDtConfig('inequity', resolvedConfig)

  const showInsightsButton =
    resolvedConfig &&
    SHOW_INSIGHT_GENERATION &&
    props.trackerMode === 'disparity'

  return (
    <>
      <title>{`${browserTitle} - Health Equity Tracker`}</title>

      <div className='flex'>
        {/* CARDS COLUMN */}
        <div className={`w-full ${insightMode ? 'md:w-6/12' : 'md:w-10/12'}`}>
          {!isDesktopLayout && <InsightReportModal />}
          {/* Mode selectors here on small/medium, in sidebar instead for larger screens */}
          <ReportTopbarMobile
            trackerMode={props.trackerMode}
            setTrackerMode={props.setTrackerMode}
            offerJumpToAgeAdjustment={offerJumpToAgeAdjustment}
            enabledDemographicOptionsMap={enabledDemographicOptionsMap}
            disabledDemographicOptions={disabledDemographicOptions}
            showInsightsButton={showInsightsButton}
          />

          <div className='flex w-full items-center justify-center'>
            {resolvedConfig && (
              <div
                key={String(insightMode)}
                className='flex w-full flex-col content-center'
              >
                {/* 100k MAP CARD */}
                <div
                  tabIndex={-1}
                  id='rate-map'
                  // NOTE: use inline styles to set dynamic scroll margin based on MadLib header height
                  style={{
                    scrollMarginTop: props.headerScrollMargin,
                  }}
                >
                  <MapCard
                    dataTypeConfig={
                      dataTypeConfig ?? METRIC_CONFIG[props.dropdownVarId]?.[0]
                    } // map card handles its own geo overrides, so use original config not resolved
                    fips={props.fips}
                    updateFipsCallback={(fips: Fips) => {
                      props.updateFipsCallback(fips)
                    }}
                    demographicType={demographicType}
                    reportTitle={props.reportTitle}
                    trackerMode={props.trackerMode}
                  />
                </div>

                {/* RATE TRENDS LINE CHART CARD */}
                {rateMetricConfig?.timeSeriesCadence && (
                  <div
                    tabIndex={-1}
                    className='w-full scroll-m-0 md:scroll-mt-24'
                    id='rates-over-time'
                  >
                    <RateTrendsChartCard
                      dataTypeConfig={resolvedConfig}
                      demographicType={demographicType}
                      fips={props.fips}
                      reportTitle={props.reportTitle}
                    />
                  </div>
                )}

                {/* 100K BAR CHART CARD */}
                <div
                  tabIndex={-1}
                  className='w-full'
                  id='rate-chart'
                  style={{
                    scrollMarginTop: props.headerScrollMargin,
                  }}
                >
                  <RateBarChartCard
                    dataTypeConfig={resolvedConfig}
                    demographicType={demographicType}
                    fips={props.fips}
                    reportTitle={props.reportTitle}
                  />
                </div>

                {/* UNKNOWNS MAP CARD */}
                <div
                  tabIndex={-1}
                  className='w-full'
                  id='unknown-demographic-map'
                  style={{
                    scrollMarginTop: props.headerScrollMargin,
                  }}
                >
                  <HetLazyLoader offset={800} height={250} once>
                    {shareMetricConfig && (
                      <UnknownsMapCard
                        overrideAndWithOr={demographicType === RACE}
                        dataTypeConfig={resolvedConfig}
                        fips={props.fips}
                        updateFipsCallback={(fips: Fips) => {
                          props.updateFipsCallback(fips)
                        }}
                        demographicType={demographicType}
                        reportTitle={props.reportTitle}
                      />
                    )}
                  </HetLazyLoader>
                </div>

                {/* SHARE TRENDS LINE CHART CARD */}
                {inequityOverTimeConfig?.timeSeriesCadence && (
                  <div
                    tabIndex={-1}
                    id='inequities-over-time'
                    className='w-full scroll-m-0 md:scroll-mt-24'
                  >
                    <HetLazyLoader offset={600} height={250} once>
                      <ShareTrendsChartCard
                        dataTypeConfig={resolvedConfig}
                        demographicType={demographicType}
                        fips={props.fips}
                        reportTitle={props.reportTitle}
                      />
                    </HetLazyLoader>
                  </div>
                )}

                {/* DISPARITY BAR CHART COMPARE VS POPULATION */}
                <div
                  tabIndex={-1}
                  className='w-full'
                  id='population-vs-distribution'
                  style={{
                    scrollMarginTop: props.headerScrollMargin,
                  }}
                >
                  <HetLazyLoader offset={800} height={0} once>
                    {shareMetricConfig && (
                      <StackedSharesBarChartCard
                        dataTypeConfig={resolvedConfig}
                        demographicType={demographicType}
                        fips={props.fips}
                        reportTitle={props.reportTitle}
                      />
                    )}
                  </HetLazyLoader>
                </div>

                {/* DATA TABLE CARD */}
                <div
                  tabIndex={-1}
                  className='w-full'
                  id='data-table'
                  style={{
                    scrollMarginTop: props.headerScrollMargin,
                  }}
                >
                  <TableCard
                    fips={props.fips}
                    dataTypeConfig={resolvedConfig}
                    demographicType={demographicType}
                    reportTitle={props.reportTitle}
                  />
                </div>

                {/* AGE ADJUSTED TABLE CARD */}
                {resolvedConfig.metrics?.age_adjusted_ratio && (
                  <div
                    tabIndex={-1}
                    className='w-full'
                    id='age-adjusted-ratios'
                    style={{
                      scrollMarginTop: props.headerScrollMargin,
                    }}
                  >
                    <HetLazyLoader offset={800} height={800} once>
                      <AgeAdjustedTableCard
                        fips={props.fips}
                        dataTypeConfig={resolvedConfig}
                        dropdownVarId={props.dropdownVarId}
                        demographicType={demographicType}
                        reportTitle={props.reportTitle}
                      />
                    </HetLazyLoader>
                  </div>
                )}
                <div className='mt-16'>
                  <p>{SHARE_LABEL}</p>
                  <ShareButtons
                    reportTitle={props.reportTitle}
                    isMobile={!isDesktopLayout}
                  />{' '}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* INSIGHT CARD COLUMN - shown when insight is open */}
        {insightMode && resolvedConfig && (
          <div className='hidden md:flex md:w-4/12 md:flex-col'>
            <InsightReportCard headerScrollMargin={props.headerScrollMargin} />
          </div>
        )}

        <div className='hidden items-center md:flex md:w-2/12 md:flex-col'>
          <ReportSidebarDesktop
            floatTopOffset={props.headerScrollMargin}
            isScrolledToTop={props.isScrolledToTop}
            reportStepHashIds={props.reportStepHashIds ?? []}
            reportTitle={props.reportTitle}
            isMobile={!isDesktopLayout}
            // Mode selectors are in sidebar only on larger screens
            trackerMode={props.trackerMode}
            setTrackerMode={props.setTrackerMode}
            enabledDemographicOptionsMap={enabledDemographicOptionsMap}
            disabledDemographicOptions={disabledDemographicOptions}
            showInsightsButton={showInsightsButton}
          />
        </div>
      </div>
    </>
  )
}
