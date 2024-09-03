import { useEffect } from 'react'
import AgeAdjustedTableCard from '../cards/AgeAdjustedTableCard'
import DisparityBarChartCard from '../cards/DisparityBarChartCard'
import MapCard from '../cards/MapCard'
import RateTrendsChartCard from '../cards/RateTrendsChartCard'
import ShareTrendsChartCard from '../cards/ShareTrendsChartCard'
import SimpleBarChartCard from '../cards/SimpleBarChartCard'
import TableCard from '../cards/TableCard'
import UnknownsMapCard from '../cards/UnknownsMapCard'
import {
  type DropdownVarId,
  METRIC_CONFIG,
  type DataTypeConfig,
  type DataTypeId,
} from '../data/config/MetricConfig'
import {
  type DemographicType,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
} from '../data/query/Breakdowns'
import { AGE, RACE } from '../data/utils/Constants'
import type { Fips } from '../data/utils/Fips'
import {
  DATA_TYPE_1_PARAM,
  DATA_TYPE_2_PARAM,
  DEMOGRAPHIC_PARAM,
  getParameter,
  psSubscribe,
  swapOldDatatypeParams,
} from '../utils/urlutils'
import { reportProviderSteps } from './ReportProviderSteps'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import { Helmet } from 'react-helmet-async'
import Sidebar from '../pages/ui/Sidebar'
import ShareButtons, { SHARE_LABEL } from './ui/ShareButtons'
import type { MadLibId } from '../utils/MadLibs'
import ModeSelectorBoxMobile from './ui/ModeSelectorBoxMobile'
import RowOfTwoOptionalMetrics from './RowOfTwoOptionalMetrics'
import { useAtom } from 'jotai'
import {
  selectedDataTypeConfig1Atom,
  selectedDataTypeConfig2Atom,
} from '../utils/sharedSettingsState'
import { getAllDemographicOptions } from './reportUtils'
import { useParamState } from '../utils/hooks/useParamState'

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
  isMobile: boolean
  trackerMode: MadLibId
  setTrackerMode: React.Dispatch<React.SetStateAction<MadLibId>>
}

export default function CompareReport(props: CompareReportProps) {
  const isRaceBySex =
    props.dropdownVarId1 === 'hiv_black_women' ||
    props.dropdownVarId2 === 'hiv_black_women'
  const defaultDemo = isRaceBySex ? AGE : RACE

  const [demographicType, setDemographicType] = useParamState<DemographicType>(
    DEMOGRAPHIC_PARAM,
    defaultDemo,
  )

  const [dataTypeConfig1, setDataTypeConfig1] = useAtom(
    selectedDataTypeConfig1Atom,
  )

  const [dataTypeConfig2, setDataTypeConfig2] = useAtom(
    selectedDataTypeConfig2Atom,
  )

  const { enabledDemographicOptionsMap, disabledDemographicOptions } =
    getAllDemographicOptions(
      dataTypeConfig1,
      props.fips1,
      dataTypeConfig2,
      props.fips2,
    )

  // if the DemographicType in state doesn't work for both sides of the compare report, default to this first option that does work
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
      setDataTypeConfig1(newDtParam1)

      const newDtParam2 =
        props.trackerMode === 'comparegeos'
          ? newDtParam1
          : dtParam2 ?? METRIC_CONFIG?.[props.dropdownVarId2]?.[0]
      setDataTypeConfig2(newDtParam2)
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
  }, [dataTypeConfig1, dataTypeConfig2])

  if (dataTypeConfig1 === null) {
    return <></>
  }
  if (dataTypeConfig2 === null) {
    return <></>
  }

  const showAgeAdjustCardRow =
    dataTypeConfig1?.metrics?.age_adjusted_ratio?.ageAdjusted ??
    dataTypeConfig2?.metrics?.age_adjusted_ratio?.ageAdjusted

  const dt1 = dataTypeConfig1?.fullDisplayName
  const dt2 = dataTypeConfig2?.fullDisplayName
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

  return (
    <>
      <Helmet>
        <title>{browserTitle} - Health Equity Tracker</title>
      </Helmet>
      <div className='flex'>
        {/* CARDS COLUMN */}
        <div className=' w-full md:w-10/12'>
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

          <div className='flex w-full flex-col content-center '>
            {/* SIDE-BY-SIDE 100K MAP CARDS */}
            <RowOfTwoOptionalMetrics
              trackerMode={props.trackerMode}
              id='rate-map'
              dataTypeConfig1={dataTypeConfig1}
              dataTypeConfig2={dataTypeConfig2}
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
            <RowOfTwoOptionalMetrics
              trackerMode={props.trackerMode}
              id='rates-over-time'
              dataTypeConfig1={dataTypeConfig1}
              dataTypeConfig2={dataTypeConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              headerScrollMargin={props.headerScrollMargin}
              createCard={(
                dataTypeConfig: DataTypeConfig,
                fips: Fips,
                unusedUpdateFips: (fips: Fips) => void,
                unusedDropdown: any,
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

            {/* SIDE-BY-SIDE 100K BAR GRAPH CARDS */}

            <RowOfTwoOptionalMetrics
              trackerMode={props.trackerMode}
              id='rate-chart'
              dataTypeConfig1={dataTypeConfig1}
              dataTypeConfig2={dataTypeConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              headerScrollMargin={props.headerScrollMargin}
              createCard={(
                dataTypeConfig: DataTypeConfig,
                fips: Fips,
                unusedUpdateFips: (fips: Fips) => void,
              ) => (
                <SimpleBarChartCard
                  dataTypeConfig={dataTypeConfig}
                  demographicType={demographicType}
                  fips={fips}
                  reportTitle={props.reportTitle}
                />
              )}
            />

            {/* SIDE-BY-SIDE UNKNOWNS MAP CARDS */}
            <RowOfTwoOptionalMetrics
              trackerMode={props.trackerMode}
              id='unknown-demographic-map'
              dataTypeConfig1={dataTypeConfig1}
              dataTypeConfig2={dataTypeConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              headerScrollMargin={props.headerScrollMargin}
              updateFips1={props.updateFips1Callback}
              updateFips2={props.updateFips2Callback}
              createCard={(
                dataTypeConfig: DataTypeConfig,
                fips: Fips,
                updateFips: (fips: Fips) => void,
              ) => (
                <UnknownsMapCard
                  overrideAndWithOr={demographicType === RACE}
                  dataTypeConfig={dataTypeConfig}
                  fips={fips}
                  updateFipsCallback={(fips: Fips) => {
                    updateFips(fips)
                  }}
                  demographicType={demographicType}
                  reportTitle={props.reportTitle}
                />
              )}
            />

            {/* SIDE-BY-SIDE SHARE INEQUITY TREND CARDS */}

            <RowOfTwoOptionalMetrics
              trackerMode={props.trackerMode}
              id='inequities-over-time'
              dataTypeConfig1={dataTypeConfig1}
              dataTypeConfig2={dataTypeConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              headerScrollMargin={props.headerScrollMargin}
              createCard={(
                dataTypeConfig: DataTypeConfig,
                fips: Fips,
                unusedUpdateFips: (fips: Fips) => void,
                unusedDropdown: any,
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

            {/* SIDE-BY-SIDE DISPARITY BAR GRAPH (COMPARE TO POPULATION) CARDS */}
            <RowOfTwoOptionalMetrics
              trackerMode={props.trackerMode}
              id='population-vs-distribution'
              dataTypeConfig1={dataTypeConfig1}
              dataTypeConfig2={dataTypeConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              headerScrollMargin={props.headerScrollMargin}
              createCard={(
                dataTypeConfig: DataTypeConfig,
                fips: Fips,
                unusedUpdateFips: (fips: Fips) => void,
              ) => (
                <DisparityBarChartCard
                  dataTypeConfig={dataTypeConfig}
                  demographicType={demographicType}
                  fips={fips}
                  reportTitle={props.reportTitle}
                />
              )}
            />

            {/* SIDE-BY-SIDE DATA TABLE CARDS */}
            <RowOfTwoOptionalMetrics
              trackerMode={props.trackerMode}
              id='data-table'
              dataTypeConfig1={dataTypeConfig1}
              dataTypeConfig2={dataTypeConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              updateFips1={props.updateFips1Callback}
              updateFips2={props.updateFips2Callback}
              headerScrollMargin={props.headerScrollMargin}
              createCard={(
                dataTypeConfig: DataTypeConfig,
                fips: Fips,
                updateFips: (fips: Fips) => void,
              ) => (
                <TableCard
                  fips={fips}
                  dataTypeConfig={dataTypeConfig}
                  demographicType={demographicType}
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
                dataTypeConfig1={dataTypeConfig1}
                dataTypeConfig2={dataTypeConfig2}
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
                  updateFips: (fips: Fips) => void,
                  dropdownVarId?: DropdownVarId,
                  isCompareCard?: boolean,
                ) => (
                  <AgeAdjustedTableCard
                    fips={fips}
                    dataTypeConfig={dataTypeConfig}
                    demographicType={demographicType}
                    dropdownVarId={dropdownVarId}
                    reportTitle={props.reportTitle}
                  />
                )}
              />
            )}
          </div>
        </div>
        {/* SIDEBAR COLUMN - DESKTOP ONLY */}
        {props.reportStepHashIds && (
          <div className=' hidden items-start md:flex md:w-2/12 md:flex-col'>
            <Sidebar
              isScrolledToTop={props.isScrolledToTop}
              reportStepHashIds={props.reportStepHashIds}
              floatTopOffset={props.headerScrollMargin}
              reportTitle={props.reportTitle}
              isMobile={props.isMobile}
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
      <div className='mt-24'>
        <p>{SHARE_LABEL}</p>
        <ShareButtons
          reportTitle={props.reportTitle}
          isMobile={props.isMobile}
        />{' '}
      </div>
    </>
  )
}
