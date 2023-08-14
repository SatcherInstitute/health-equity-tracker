import { Box, Grid } from '@mui/material'
import { useEffect } from 'react'
import LazyLoad from 'react-lazyload'
import { DisparityBarChartCard } from '../cards/DisparityBarChartCard'
import { MapCard } from '../cards/MapCard'
import { SimpleBarChartCard } from '../cards/SimpleBarChartCard'
import { AgeAdjustedTableCard } from '../cards/AgeAdjustedTableCard'
import { UnknownsMapCard } from '../cards/UnknownsMapCard'
import { TableCard } from '../cards/TableCard'
import {
  type DropdownVarId,
  METRIC_CONFIG,
  type DataTypeConfig,
} from '../data/config/MetricConfig'
import { AGE, RACE } from '../data/utils/Constants'
import { type Fips } from '../data/utils/Fips'
import {
  DATA_TYPE_1_PARAM,
  DEMOGRAPHIC_PARAM,
  getParameter,
  psSubscribe,
  swapOldDatatypeParams,
} from '../utils/urlutils'
import { SINGLE_COLUMN_WIDTH } from './ReportProvider'
import NoDataAlert from './ui/NoDataAlert'
import { RateTrendsChartCard } from '../cards/RateTrendsChartCard'
import { ShareTrendsChartCard } from '../cards/ShareTrendsChartCard'
import styles from './Report.module.scss'

import { reportProviderSteps } from './ReportProviderSteps'
import { type ScrollableHashId } from '../utils/hooks/useStepObserver'
import { Helmet } from 'react-helmet-async'
import {
  type DemographicType,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
} from '../data/query/Breakdowns'
import ShareButtons, { SHARE_LABEL } from './ui/ShareButtons'
import Sidebar from '../pages/ui/Sidebar'
import { type MadLibId } from '../utils/MadLibs'
import ModeSelectorBoxMobile from './ui/ModeSelectorBoxMobile'
import { INCARCERATION_IDS } from '../data/providers/IncarcerationProvider'
import { useAtom } from 'jotai'
import { selectedDataTypeConfig1Atom } from '../utils/sharedSettingsState'
import {
  getDemographicOptionsMap,
  getDisabledDemographicOptions,
} from './reportUtils'
import { useParamState } from '../utils/hooks/useParamState'

export interface ReportProps {
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

export function Report(props: ReportProps) {
  const isRaceBySex = props.dropdownVarId === 'hiv_black_women'
  const defaultDemo = isRaceBySex ? AGE : RACE

  const [demographicType, setDemographicType] = useParamState<DemographicType>(
    DEMOGRAPHIC_PARAM,
    defaultDemo
  )

  const [dataTypeConfig, setDataTypeConfig] = useAtom(
    selectedDataTypeConfig1Atom
  )
  const demographicOptionsMap = getDemographicOptionsMap(dataTypeConfig)

  // if the DemographicType in state doesn't work for the selected datatype, reset to the first demographic type option that works
  if (!Object.values(demographicOptionsMap).includes(demographicType)) {
    setDemographicType(
      Object.values(demographicOptionsMap)[0] as DemographicType
    )
  }

  const disabledDemographicOptions =
    getDisabledDemographicOptions(dataTypeConfig)

  useEffect(() => {
    const readParams = () => {
      const dtParam1 = getParameter(
        DATA_TYPE_1_PARAM,
        undefined,
        (val: string) => {
          val = swapOldDatatypeParams(val)
          return METRIC_CONFIG[props.dropdownVarId]?.find(
            (cfg) => cfg.dataTypeId === val
          )
        }
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
      (key) => document.getElementById(key)?.id !== undefined
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

  // we only have time-series data for incarceration at the county-level
  const hideNonCountyBJSTimeCards =
    !props.fips.isCounty() && INCARCERATION_IDS.includes(props.dropdownVarId)

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
            demographicType={demographicType}
            setDemographicType={setDemographicType}
            offerJumpToAgeAdjustment={offerJumpToAgeAdjustment}
            demographicOptionsMap={demographicOptionsMap}
            disabledDemographicOptions={disabledDemographicOptions}
          />

          <Grid
            item
            container
            xs={12}
            alignItems="center"
            spacing={0}
            justifyContent="center"
          >
            {!dataTypeConfig && (
              <NoDataAlert dropdownVarId={props.dropdownVarId} />
            )}

            {dataTypeConfig && (
              <Grid container justifyContent="center">
                {/* 100k MAP CARD */}
                <Grid
                  item
                  xs={12}
                  md={SINGLE_COLUMN_WIDTH}
                  tabIndex={-1}
                  id="rate-map"
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
                  />
                </Grid>

                {/* RATE TRENDS LINE CHART CARD */}
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={SINGLE_COLUMN_WIDTH}
                  id={
                    dataTypeConfig.timeSeriesData
                      ? 'rates-over-time'
                      : undefined
                  }
                  className={styles.ScrollPastHeader}
                >
                  {dataTypeConfig.timeSeriesData &&
                    !hideNonCountyBJSTimeCards && (
                      <RateTrendsChartCard
                        dataTypeConfig={dataTypeConfig}
                        demographicType={demographicType}
                        fips={props.fips}
                        reportTitle={props.reportTitle}
                      />
                    )}
                </Grid>

                {/* 100K BAR CHART CARD */}
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={SINGLE_COLUMN_WIDTH}
                  tabIndex={-1}
                  id="rate-chart"
                  style={{
                    scrollMarginTop: props.headerScrollMargin,
                  }}
                >
                  <SimpleBarChartCard
                    dataTypeConfig={dataTypeConfig}
                    demographicType={demographicType}
                    fips={props.fips}
                    reportTitle={props.reportTitle}
                  />
                </Grid>

                {/* UNKNOWNS MAP CARD */}
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={SINGLE_COLUMN_WIDTH}
                  tabIndex={-1}
                  id="unknown-demographic-map"
                  style={{
                    scrollMarginTop: props.headerScrollMargin,
                  }}
                >
                  <LazyLoad offset={800} height={750} once>
                    {dataTypeConfig.metrics.pct_share && (
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
                  </LazyLoad>
                </Grid>

                {/* SHARE TRENDS LINE CHART CARD */}
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={SINGLE_COLUMN_WIDTH}
                  id={
                    dataTypeConfig.timeSeriesData
                      ? 'inequities-over-time'
                      : undefined
                  }
                  className={styles.ScrollPastHeader}
                >
                  <LazyLoad offset={600} height={750} once>
                    {dataTypeConfig.timeSeriesData &&
                      !hideNonCountyBJSTimeCards && (
                        <ShareTrendsChartCard
                          dataTypeConfig={dataTypeConfig}
                          demographicType={demographicType}
                          fips={props.fips}
                          reportTitle={props.reportTitle}
                        />
                      )}
                  </LazyLoad>
                </Grid>

                {/* DISPARITY BAR CHART COMPARE VS POPULATION */}
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={SINGLE_COLUMN_WIDTH}
                  tabIndex={-1}
                  id="population-vs-distribution"
                  style={{
                    scrollMarginTop: props.headerScrollMargin,
                  }}
                >
                  <LazyLoad offset={800} height={750} once>
                    {dataTypeConfig.metrics.pct_share && (
                      <DisparityBarChartCard
                        dataTypeConfig={dataTypeConfig}
                        demographicType={demographicType}
                        fips={props.fips}
                        reportTitle={props.reportTitle}
                      />
                    )}
                  </LazyLoad>
                </Grid>

                {/* DATA TABLE CARD */}
                <Grid
                  item
                  xs={12}
                  md={SINGLE_COLUMN_WIDTH}
                  tabIndex={-1}
                  id="data-table"
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
                </Grid>

                {/* AGE ADJUSTED TABLE CARD */}
                {dataTypeConfig.metrics.age_adjusted_ratio?.ageAdjusted && (
                  <Grid
                    item
                    xs={12}
                    md={SINGLE_COLUMN_WIDTH}
                    tabIndex={-1}
                    id="age-adjusted-ratios"
                    style={{
                      scrollMarginTop: props.headerScrollMargin,
                    }}
                  >
                    <LazyLoad offset={800} height={800} once>
                      <AgeAdjustedTableCard
                        fips={props.fips}
                        dataTypeConfig={dataTypeConfig}
                        dropdownVarId={props.dropdownVarId}
                        demographicType={demographicType}
                        reportTitle={props.reportTitle}
                      />
                    </LazyLoad>
                  </Grid>
                )}
                <Box mt={5}>
                  <p>{SHARE_LABEL}</p>
                  <ShareButtons
                    reportTitle={props.reportTitle}
                    isMobile={props.isMobile}
                  />{' '}
                </Box>
              </Grid>
            )}
          </Grid>
        </Grid>
        {/* TABLE OF CONTENTS COLUMN */}
        {props.reportStepHashIds && (
          <Grid
            item
            // invisible
            xs={12}
            // icons + text
            md={2}
            container
            direction="column"
            alignItems="center"
            className={styles.FloatingSidebarWrapper}
          >
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
              demographicOptionsMap={demographicOptionsMap}
              disabledDemographicOptions={disabledDemographicOptions}
            />
          </Grid>
        )}
      </Grid>
    </>
  )
}
