import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import topoJsonData from '../../public/tmp/13063.topo.json'
import GeorgiaCountiesTractsMap from '../charts/GeorgiaCountiesTractsMap'
import type { DropdownVarId } from '../data/config/DropDownIds'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig, MetricId } from '../data/config/MetricConfigTypes'
import { metricConfigFromDtConfig } from '../data/config/MetricConfigUtils'
import {
  type DemographicType,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
} from '../data/query/Breakdowns'
import { AGE, RACE } from '../data/utils/Constants'
import type { Fips } from '../data/utils/Fips'
import Sidebar from '../pages/ui/Sidebar'
import { useParamState } from '../utils/hooks/useParamState'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import type { MadLibId } from '../utils/MadLibs'
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
  if (!Object.values(enabledDemographicOptionsMap).includes(demographicType)) {
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
      <Helmet>
        <title>{browserTitle} - Health Equity Tracker</title>
      </Helmet>
      <div className='flex '>
        {/* CARDS COLUMN */}
        <div className='w-full md:w-10/12'>
          {/* Mode selectors here on small/medium, in sidebar instead for larger screens */}
          <ModeSelectorBoxMobile
            trackerMode={props.trackerMode}
            setTrackerMode={props.setTrackerMode}
            demographicType={demographicType}
            setDemographicType={setDemographicType}
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
                  {/* <MapCard
                    dataTypeConfig={dataTypeConfig}
                    fips={props.fips}
                    updateFipsCallback={(fips: Fips) => {
                      props.updateFipsCallback(fips)
                    }}
                    demographicType={demographicType}
                    reportTitle={props.reportTitle}
                    trackerMode={props.trackerMode}
                  /> */}
                  <GeorgiaCountiesTractsMap topoJson={topoJsonData as any} />
                </div>

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
        {/* SIDEBAR COLUMN */}
        {props.reportStepHashIds && (
          <div className='hidden items-center md:flex md:w-2/12 md:flex-col'>
            <Sidebar
              floatTopOffset={props.headerScrollMargin}
              isScrolledToTop={props.isScrolledToTop}
              reportStepHashIds={props.reportStepHashIds}
              reportTitle={props.reportTitle}
              isMobile={props.isMobile}
              // Mode selectors are in sidebar only on larger screens
              trackerMode={props.trackerMode}
              setTrackerMode={props.setTrackerMode}
              demographicType={demographicType}
              setDemographicType={setDemographicType}
              enabledDemographicOptionsMap={enabledDemographicOptionsMap}
              disabledDemographicOptions={disabledDemographicOptions}
            />
          </div>
        )}
      </div>
    </>
  )
}
