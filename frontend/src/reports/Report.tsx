import { useAtom } from 'jotai'
import { useEffect } from 'react'
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
import { metricConfigFromDtConfig } from '../data/config/MetricConfigUtils'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import { AGE, RACE } from '../data/utils/Constants'
import type { Fips } from '../data/utils/Fips'
import Sidebar from '../pages/ui/Sidebar'
import HetLazyLoader from '../styles/HetComponents/HetLazyLoader'
import type { MadLibId } from '../utils/MadLibs'
import { useParamState } from '../utils/hooks/useParamState'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import { selectedDataTypeConfig1Atom } from '../utils/sharedSettingsState'
import {
  DATA_TYPE_1_PARAM,
  DEMOGRAPHIC_PARAM,
  getParameter,
  psSubscribe,
  swapOldDatatypeParams,
} from '../utils/urlutils'
import { reportProviderSteps } from './ReportProviderSteps'
import { getAllDemographicOptions } from './reportUtils'
import ModeSelectorBoxMobile from './ui/ModeSelectorBoxMobile'
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
  isMobile: boolean
  trackerMode: MadLibId
  setTrackerMode: React.Dispatch<React.SetStateAction<MadLibId>>
  dataTypesToDefine: Array<[string, DataTypeConfig[]]>
}

export interface ChartData {
  knownData: Readonly<Record<string, any>>[]
  metricIds: MetricId[]
}

export function Report(props: ReportProps) {
  const isRaceBySex = props.dropdownVarId === 'hiv_black_women'
  const defaultDemo = isRaceBySex ? AGE : RACE

  const [demographicType, setDemographicType] = useParamState<DemographicType>(
    DEMOGRAPHIC_PARAM,
    defaultDemo,
  )

  const [dataTypeConfig, setDataTypeConfig] = useAtom(
    selectedDataTypeConfig1Atom,
  )

  const { enabledDemographicOptionsMap, disabledDemographicOptions } =
    getAllDemographicOptions(dataTypeConfig, props.fips)

  // if the DemographicType in state doesn't work for the selected datatype, reset to the first demographic type option that works
  if (
    dataTypeConfig &&
    !Object.values(enabledDemographicOptionsMap).includes(demographicType)
  ) {
    setDemographicType(
      Object.values(enabledDemographicOptionsMap)[0] as DemographicType,
    )
  }

  useEffect(() => {
    const readParams = () => {
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
    }
    const psHandler = psSubscribe(readParams, 'vardisp')
    readParams()

    return () => {
      if (psHandler) {
        psHandler.unsubscribe()
      }
    }
  }, [props.dropdownVarId, demographicType])

  // when variable config changes (new data type), re-calc available card steps TableOfContents
  useEffect(() => {
    const hashIdsOnScreen: any[] = Object.keys(reportProviderSteps).filter(
      (key) => document.getElementById(key)?.id !== undefined,
    )

    hashIdsOnScreen && props.setReportStepHashIds?.(hashIdsOnScreen)
  }, [dataTypeConfig])

  const demographicTypeString: string =
    DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType] ?? 'demographic'

  const browserTitle = `${
    (dataTypeConfig?.fullDisplayName as string) ?? 'Data'
  } by ${demographicTypeString} in ${props.fips.getFullDisplayName()}`

  const offerJumpToAgeAdjustment = [
    'covid_deaths',
    'covid_hospitalizations',
  ].includes(props.dropdownVarId)

  const rateMetricConfig =
    dataTypeConfig && metricConfigFromDtConfig('rate', dataTypeConfig)
  const shareMetricConfig =
    dataTypeConfig && metricConfigFromDtConfig('share', dataTypeConfig)
  const inequityOverTimeConfig =
    dataTypeConfig && metricConfigFromDtConfig('inequity', dataTypeConfig)

  return (
    <>
      <title>{`${browserTitle} - Health Equity Tracker`}</title>

      <div className='flex '>
        {/* CARDS COLUMN */}
        <div className='w-full md:w-10/12'>
          {/* Mode selectors here on small/medium, in sidebar instead for larger screens */}
          <ModeSelectorBoxMobile
            trackerMode={props.trackerMode}
            setTrackerMode={props.setTrackerMode}
            offerJumpToAgeAdjustment={offerJumpToAgeAdjustment}
            enabledDemographicOptionsMap={enabledDemographicOptionsMap}
            disabledDemographicOptions={disabledDemographicOptions}
          />

          <div className='flex w-full items-center justify-center'>
            {dataTypeConfig && (
              <div className='flex w-full flex-col content-center'>
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
                    dataTypeConfig={dataTypeConfig}
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
                      dataTypeConfig={dataTypeConfig}
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
                    dataTypeConfig={dataTypeConfig}
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
                        dataTypeConfig={dataTypeConfig}
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
                    <HetLazyLoader offset={600} height={750} once>
                      <ShareTrendsChartCard
                        dataTypeConfig={dataTypeConfig}
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
                        dataTypeConfig={dataTypeConfig}
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
                    dataTypeConfig={dataTypeConfig}
                    demographicType={demographicType}
                    reportTitle={props.reportTitle}
                  />
                </div>

                {/* AGE ADJUSTED TABLE CARD */}
                {dataTypeConfig.metrics?.age_adjusted_ratio && (
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
                        dataTypeConfig={dataTypeConfig}
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
                    isMobile={props.isMobile}
                  />{' '}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className='hidden items-center md:flex md:w-2/12 md:flex-col'>
          <Sidebar
            floatTopOffset={props.headerScrollMargin}
            isScrolledToTop={props.isScrolledToTop}
            reportStepHashIds={props.reportStepHashIds ?? []}
            reportTitle={props.reportTitle}
            isMobile={props.isMobile}
            // Mode selectors are in sidebar only on larger screens
            trackerMode={props.trackerMode}
            setTrackerMode={props.setTrackerMode}
            enabledDemographicOptionsMap={enabledDemographicOptionsMap}
            disabledDemographicOptions={disabledDemographicOptions}
          />
        </div>
      </div>
    </>
  )
}
