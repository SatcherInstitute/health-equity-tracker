import { Box, Grid } from '@mui/material'
import { useEffect, useState, Fragment } from 'react'
import { AgeAdjustedTableCard } from '../cards/AgeAdjustedTableCard'
import { DisparityBarChartCard } from '../cards/DisparityBarChartCard'
import { MapCard } from '../cards/MapCard'
import { RateTrendsChartCard } from '../cards/RateTrendsChartCard'
import { ShareTrendsChartCard } from '../cards/ShareTrendsChartCard'
import { SimpleBarChartCard } from '../cards/SimpleBarChartCard'
import { TableCard } from '../cards/TableCard'
import { UnknownsMapCard } from '../cards/UnknownsMapCard'
import {
  type DropdownVarId,
  METRIC_CONFIG,
  type DataTypeConfig,
  type DataTypeId,
} from '../data/config/MetricConfig'
import {
  type BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from '../data/query/Breakdowns'
import { RACE, AGE } from '../data/utils/Constants'
import { type Fips } from '../data/utils/Fips'
import {
  DATA_TYPE_1_PARAM,
  DATA_TYPE_2_PARAM,
  DEMOGRAPHIC_PARAM,
  getParameter,
  psSubscribe,
  setParameter,
  swapOldDatatypeParams,
} from '../utils/urlutils'
import { reportProviderSteps } from './ReportProviderSteps'
import NoDataAlert from './ui/NoDataAlert'
import { type ScrollableHashId } from '../utils/hooks/useStepObserver'
import styles from './Report.module.scss'
import { Helmet } from 'react-helmet-async'
import Sidebar from '../pages/ui/Sidebar'
import ShareButtons, { SHARE_LABEL } from './ui/ShareButtons'
import { type MadLibId } from '../utils/MadLibs'
import ModeSelectorBoxMobile from './ui/ModeSelectorBoxMobile'
import { BLACK_WOMEN } from '../data/providers/HivProvider'
import RowOfTwoOptionalMetrics from './RowOfTwoOptionalMetrics'
import { useAtom } from 'jotai'
import {
  selectedDataTypeConfig1Atom,
  selectedDataTypeConfig2Atom,
} from '../utils/sharedSettingsState'

/* Takes dropdownVar and fips inputs for each side-by-side column.
Input values for each column can be the same. */
function CompareReport(props: {
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
}) {
  const [currentBreakdown, setCurrentBreakdown] = useState<BreakdownVar>(
    getParameter(DEMOGRAPHIC_PARAM, RACE)
  )

  const [dataTypeConfig1, setDataTypeConfig1] = useAtom(
    selectedDataTypeConfig1Atom
  )

  const [dataTypeConfig2, setDataTypeConfig2] = useAtom(
    selectedDataTypeConfig2Atom
  )

  const isRaceBySex =
    dataTypeConfig1?.dataTypeId.includes(BLACK_WOMEN) ??
    dataTypeConfig2?.dataTypeId.includes(BLACK_WOMEN)

  function setDemoWithParam(demographic: BreakdownVar) {
    setParameter(DEMOGRAPHIC_PARAM, demographic)
    setCurrentBreakdown(demographic)
  }

  useEffect(() => {
    const readParams = () => {
      const demoParam1 = getParameter(
        DATA_TYPE_1_PARAM,
        undefined,
        (val: DataTypeId) => {
          val = swapOldDatatypeParams(val)
          return METRIC_CONFIG[props.dropdownVarId1].find(
            (cfg) => cfg.dataTypeId === val
          )
        }
      )
      const demoParam2 = getParameter(
        DATA_TYPE_2_PARAM,
        undefined,
        (val: DataTypeId) => {
          val = swapOldDatatypeParams(val)
          return (
            METRIC_CONFIG[props.dropdownVarId2]?.find(
              (cfg) => cfg.dataTypeId === val
            ) ?? METRIC_CONFIG[props.dropdownVarId2][0]
          )
        }
      )

      const demo: BreakdownVar = getParameter(
        DEMOGRAPHIC_PARAM,
        isRaceBySex ? AGE : RACE
      )

      const newDemoParam1 =
        demoParam1 ?? METRIC_CONFIG?.[props.dropdownVarId1]?.[0]
      setDataTypeConfig1(newDemoParam1)

      const newDemoParam2 =
        props.trackerMode === 'comparegeos'
          ? newDemoParam1
          : demoParam2 ?? METRIC_CONFIG?.[props.dropdownVarId2]?.[0]
      setDataTypeConfig2(newDemoParam2)

      setCurrentBreakdown(demo)
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
      (key) => document.getElementById(key)?.id !== undefined
    )

    hashIdsOnScreen && props.setReportStepHashIds?.(hashIdsOnScreen)
  }, [dataTypeConfig1, dataTypeConfig2])

  if (dataTypeConfig1 === null) {
    return (
      <Grid container spacing={1} alignItems="center" justifyContent="center">
        <NoDataAlert dropdownVarId={props.dropdownVarId1} />
      </Grid>
    )
  }
  if (dataTypeConfig2 === null) {
    return (
      <Grid container spacing={1} alignItems="center" justifyContent="center">
        <NoDataAlert dropdownVarId={props.dropdownVarId2} />
      </Grid>
    )
  }

  const showTrendCardRow =
    dataTypeConfig1?.timeSeriesData ?? dataTypeConfig2?.timeSeriesData
  const showAgeAdjustCardRow =
    dataTypeConfig1?.metrics?.age_adjusted_ratio?.ageAdjusted ??
    dataTypeConfig2?.metrics?.age_adjusted_ratio?.ageAdjusted

  const dt1 = dataTypeConfig1?.fullDisplayName
  const dt2 = dataTypeConfig2?.fullDisplayName
  const demo = BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[currentBreakdown]
  const loc1 = props.fips1.getSentenceDisplayName()
  const loc2 = props.fips2.getSentenceDisplayName()

  let browserTitle = dt1
  if (dt1 !== dt2) browserTitle += ` and ${dt2}`
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
      <Grid container>
        {/* CARDS COLUMN */}
        <Grid item xs={12} md={10}>
          {/* Mode selectors here on small/medium, in sidebar instead for larger screens */}
          <ModeSelectorBoxMobile
            trackerMode={props.trackerMode}
            setTrackerMode={props.setTrackerMode}
            trackerDemographic={currentBreakdown}
            setDemoWithParam={setDemoWithParam}
            offerJumpToAgeAdjustment={offerJumpToAgeAdjustment}
          />

          <Grid container spacing={1} alignItems="flex-start">
            {/* SIDE-BY-SIDE 100K MAP CARDS */}
            <RowOfTwoOptionalMetrics
              trackerMode={props.trackerMode}
              id="rate-map"
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
                isCompareCard?: boolean
              ) => (
                <MapCard
                  dataTypeConfig={dataTypeConfig}
                  fips={fips}
                  updateFipsCallback={(fips: Fips) => {
                    updateFips(fips)
                  }}
                  currentBreakdown={currentBreakdown}
                  isCompareCard={isCompareCard}
                  reportTitle={props.reportTitle}
                />
              )}
            />

            {/* SIDE-BY-SIDE RATE TREND CARDS */}
            {showTrendCardRow && (
              <RowOfTwoOptionalMetrics
                trackerMode={props.trackerMode}
                id="rates-over-time"
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
                  isCompareCard: boolean | undefined
                ) => (
                  <RateTrendsChartCard
                    dataTypeConfig={dataTypeConfig}
                    breakdownVar={currentBreakdown}
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
              id="rate-chart"
              dataTypeConfig1={dataTypeConfig1}
              dataTypeConfig2={dataTypeConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              headerScrollMargin={props.headerScrollMargin}
              createCard={(
                dataTypeConfig: DataTypeConfig,
                fips: Fips,
                unusedUpdateFips: (fips: Fips) => void
              ) => (
                <SimpleBarChartCard
                  dataTypeConfig={dataTypeConfig}
                  breakdownVar={currentBreakdown}
                  fips={fips}
                  reportTitle={props.reportTitle}
                />
              )}
            />

            {/* SIDE-BY-SIDE UNKNOWNS MAP CARDS */}
            <RowOfTwoOptionalMetrics
              trackerMode={props.trackerMode}
              id="unknown-demographic-map"
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
                updateFips: (fips: Fips) => void
              ) => (
                <UnknownsMapCard
                  overrideAndWithOr={currentBreakdown === RACE}
                  dataTypeConfig={dataTypeConfig}
                  fips={fips}
                  updateFipsCallback={(fips: Fips) => {
                    updateFips(fips)
                  }}
                  currentBreakdown={currentBreakdown}
                  reportTitle={props.reportTitle}
                />
              )}
            />

            {/* SIDE-BY-SIDE SHARE INEQUITY TREND CARDS */}

            {showTrendCardRow && (
              <RowOfTwoOptionalMetrics
                trackerMode={props.trackerMode}
                id="inequities-over-time"
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
                  isCompareCard: boolean | undefined
                ) => (
                  <ShareTrendsChartCard
                    dataTypeConfig={dataTypeConfig}
                    breakdownVar={currentBreakdown}
                    fips={fips}
                    isCompareCard={isCompareCard}
                    reportTitle={props.reportTitle}
                  />
                )}
              />
            )}

            {/* SIDE-BY-SIDE DISPARITY BAR GRAPH (COMPARE TO POPULATION) CARDS */}
            <RowOfTwoOptionalMetrics
              trackerMode={props.trackerMode}
              id="population-vs-distribution"
              dataTypeConfig1={dataTypeConfig1}
              dataTypeConfig2={dataTypeConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              headerScrollMargin={props.headerScrollMargin}
              createCard={(
                dataTypeConfig: DataTypeConfig,
                fips: Fips,
                unusedUpdateFips: (fips: Fips) => void
              ) => (
                <DisparityBarChartCard
                  dataTypeConfig={dataTypeConfig}
                  breakdownVar={currentBreakdown}
                  fips={fips}
                  reportTitle={props.reportTitle}
                />
              )}
            />

            {/* SIDE-BY-SIDE DATA TABLE CARDS */}
            <RowOfTwoOptionalMetrics
              trackerMode={props.trackerMode}
              id="data-table"
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
                updateFips: (fips: Fips) => void
              ) => (
                <TableCard
                  fips={fips}
                  dataTypeConfig={dataTypeConfig}
                  breakdownVar={currentBreakdown}
                  reportTitle={props.reportTitle}
                />
              )}
            />

            {/* SIDE-BY-SIDE AGE-ADJUSTED TABLE CARDS */}

            {showAgeAdjustCardRow && (
              <RowOfTwoOptionalMetrics
                trackerMode={props.trackerMode}
                id="age-adjusted-risk"
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
                  isCompareCard?: boolean
                ) => (
                  <AgeAdjustedTableCard
                    fips={fips}
                    dataTypeConfig={dataTypeConfig}
                    breakdownVar={currentBreakdown}
                    dropdownVarId={dropdownVarId}
                    reportTitle={props.reportTitle}
                  />
                )}
              />
            )}
          </Grid>
        </Grid>
        {/* TABLE OF CONTENTS COLUMN - DESKTOP ONLY */}
        {props.reportStepHashIds && (
          <Grid
            item
            md={2}
            container
            spacing={0}
            direction="column"
            alignItems="center"
            className={styles.FloatingSidebarWrapper}
          >
            <Sidebar
              isScrolledToTop={props.isScrolledToTop}
              reportStepHashIds={props.reportStepHashIds}
              floatTopOffset={props.headerScrollMargin}
              reportTitle={props.reportTitle}
              isMobile={props.isMobile}
              trackerMode={props.trackerMode}
              setTrackerMode={props.setTrackerMode}
              trackerDemographic={currentBreakdown}
              setDemoWithParam={setDemoWithParam}
              isRaceBySex={isRaceBySex}
            />
          </Grid>
        )}
      </Grid>
      <Box mt={5}>
        <p>{SHARE_LABEL}</p>
        <ShareButtons
          reportTitle={props.reportTitle}
          isMobile={props.isMobile}
        />{' '}
      </Box>
    </>
  )
}

export default CompareReport
