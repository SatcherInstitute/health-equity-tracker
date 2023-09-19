import { useState } from 'react'
import { Report } from './Report'
import CompareReport from './CompareReport'
import {
  type MadLib,
  getMadLibWithUpdatedValue,
  getPhraseValue,
  getMadLibPhraseText,
} from '../utils/MadLibs'
import { Fips } from '../data/utils/Fips'
import {
  DATA_CATALOG_PAGE_LINK,
  CONTACT_TAB_LINK,
} from '../utils/internalRoutes'
import ArrowForward from '@mui/icons-material/ArrowForward'
import styles from './Report.module.scss'
import {
  type DropdownVarId,
  METRIC_CONFIG,
  type DataTypeConfig,
} from '../data/config/MetricConfig'
import { Box, Button } from '@mui/material'
import DefinitionsList from './ui/DefinitionsList'
import LifelineAlert from './ui/LifelineAlert'
import LazyLoad from 'react-lazyload'
import IncarceratedChildrenLongAlert from './ui/IncarceratedChildrenLongAlert'
import { type ScrollableHashId } from '../utils/hooks/useStepObserver'
import { LinkWithStickyParams } from '../utils/urlutils'
import {
  MissingCovidData,
  MissingCovidVaccinationData,
  MissingCAWPData,
  MissingHIVData,
  MissingAHRData,
  MissingPrepData,
  MissingPhrmaData,
  MissingIslandAreaPopulationData,
} from '../pages/Methodology/methodologyContent/missingDataBlurbs'
import { AHR_CONDITIONS } from '../data/providers/AhrProvider'
import { PHRMA_CONDITIONS } from '../data/providers/PhrmaProvider'

export const SINGLE_COLUMN_WIDTH = 12

interface ReportProviderProps {
  isSingleColumn: boolean
  madLib: MadLib
  handleModeChange: any
  selectedConditions: DataTypeConfig[]
  showLifeLineAlert: boolean
  setMadLib: (madLib: MadLib) => void
  showIncarceratedChildrenAlert: boolean
  isScrolledToTop: boolean
  headerScrollMargin: number
  isMobile: boolean
}

function ReportProvider(props: ReportProviderProps) {
  const [reportStepHashIds, setReportStepHashIds] = useState<
    ScrollableHashId[]
  >([])

  // only show determinants that have definitions
  const definedConditions = props.selectedConditions?.filter(
    (condition) => condition?.dataTypeDefinition
  )

  // create a subset of MetricConfig (with top level string + datatype array)
  // that matches only the selected, defined conditions
  const metricConfigSubset = Object.entries(METRIC_CONFIG).filter(
    (dataTypeArray) =>
      dataTypeArray[1].some((dataType) => definedConditions?.includes(dataType))
  )

  const currentDropDownIds: DropdownVarId[] = metricConfigSubset.map(
    (id) => id?.[0]
  )

  let fips1: Fips = new Fips('00')
  let fips2: Fips | null = null

  if (props.madLib.id === 'disparity')
    fips1 = new Fips(getPhraseValue(props.madLib, 3))
  else if (props.madLib.id === 'comparevars')
    fips1 = new Fips(getPhraseValue(props.madLib, 5))
  else if (props.madLib.id === 'comparegeos') {
    fips1 = new Fips(getPhraseValue(props.madLib, 3))
    fips2 = new Fips(getPhraseValue(props.madLib, 5))
  }

  const isIslandArea = fips1?.isIslandArea() ?? fips2?.isIslandArea()
  const isCovid = currentDropDownIds.includes('covid')
  const isCovidVax = currentDropDownIds.includes('covid_vaccinations')
  const isCAWP = currentDropDownIds.includes('women_in_gov')
  const isHivOutcome = currentDropDownIds.includes('hiv')
  const isHivBWOutcome = currentDropDownIds.includes('hiv_black_women')
  const isHivPrep = currentDropDownIds.includes('hiv_prep')

  const isAHR = currentDropDownIds.some((condition) =>
    AHR_CONDITIONS.includes(condition)
  )

  const isPhrma = currentDropDownIds.some((condition) =>
    PHRMA_CONDITIONS.includes(condition)
  )
  const reportWrapper = props.isSingleColumn
    ? styles.OneColumnReportWrapper
    : styles.TwoColumnReportWrapper

  function getReport() {
    // Each report has a unique key based on its props so it will create a
    // new instance and reset its state when the provided props change.
    switch (props.madLib.id) {
      case 'disparity': {
        const dropdownOption = getPhraseValue(props.madLib, 1)
        return (
          <>
            <Report
              key={dropdownOption}
              dropdownVarId={dropdownOption}
              fips={fips1}
              updateFipsCallback={(fips: Fips) => {
                props.setMadLib(
                  getMadLibWithUpdatedValue(props.madLib, 3, fips.code)
                )
              }}
              isScrolledToTop={props.isScrolledToTop}
              reportStepHashIds={reportStepHashIds}
              setReportStepHashIds={setReportStepHashIds}
              headerScrollMargin={props.headerScrollMargin}
              reportTitle={getMadLibPhraseText(props.madLib)}
              isMobile={props.isMobile}
              trackerMode={props.madLib.id}
              setTrackerMode={props.handleModeChange}
              dataTypesToDefine={metricConfigSubset}
            />
          </>
        )
      }
      case 'comparegeos': {
        const dropdownOption = getPhraseValue(props.madLib, 1)
        return (
          fips2 && (
            <CompareReport
              key={dropdownOption + fips1.code + fips2?.code}
              dropdownVarId1={dropdownOption}
              dropdownVarId2={dropdownOption}
              fips1={fips1}
              fips2={fips2}
              updateFips1Callback={(fips: Fips) => {
                props.setMadLib(
                  getMadLibWithUpdatedValue(props.madLib, 3, fips.code)
                )
              }}
              updateFips2Callback={(fips: Fips) => {
                props.setMadLib(
                  getMadLibWithUpdatedValue(props.madLib, 5, fips.code)
                )
              }}
              isScrolledToTop={props.isScrolledToTop}
              reportStepHashIds={reportStepHashIds}
              setReportStepHashIds={setReportStepHashIds}
              headerScrollMargin={props.headerScrollMargin}
              reportTitle={getMadLibPhraseText(props.madLib)}
              isMobile={props.isMobile}
              trackerMode={props.madLib.id}
              setTrackerMode={props.handleModeChange}
            />
          )
        )
      }
      case 'comparevars': {
        const dropdownOption1 = getPhraseValue(props.madLib, 1)
        const dropdownOption2 = getPhraseValue(props.madLib, 3)
        const updateFips = (fips: Fips) => {
          props.setMadLib(getMadLibWithUpdatedValue(props.madLib, 5, fips.code))
        }
        return (
          <CompareReport
            key={dropdownOption1 + dropdownOption2 + fips1.code}
            dropdownVarId1={dropdownOption1}
            dropdownVarId2={dropdownOption2}
            fips1={fips1}
            fips2={fips2 ?? fips1}
            updateFips1Callback={updateFips}
            updateFips2Callback={updateFips}
            isScrolledToTop={props.isScrolledToTop}
            reportStepHashIds={reportStepHashIds}
            setReportStepHashIds={setReportStepHashIds}
            headerScrollMargin={props.headerScrollMargin}
            reportTitle={getMadLibPhraseText(props.madLib)}
            isMobile={props.isMobile}
            trackerMode={props.madLib.id}
            setTrackerMode={props.handleModeChange}
          />
        )
      }
      default: {
        return <p>Report not found</p>
      }
    }
  }

  return (
    <>
      <div className={reportWrapper}>
        {props.showLifeLineAlert && <LifelineAlert />}
        {props.showIncarceratedChildrenAlert && false && (
          <IncarceratedChildrenLongAlert />
        )}

        {getReport()}
      </div>

      <div className={styles.MissingDataContainer}>
        <aside className={styles.MissingDataInfo}>
          {/* Display condition definition(s) based on the tracker madlib settings */}
          <div>
            {definedConditions?.length > 0 && (
              <Box mb={5}>
                <h3
                  id="definitions-missing-data"
                  className={styles.FootnoteLargeHeading}
                >
                  Definitions:
                </h3>
                <LazyLoad offset={300} height={181} once>
                  <DefinitionsList dataTypesToDefine={metricConfigSubset} />
                </LazyLoad>
              </Box>
            )}
          </div>

          <Box mt={10}>
            <h3 className={styles.FootnoteLargeHeading}>
              What data are missing?
            </h3>
          </Box>

          <p>Unfortunately there are crucial data missing in our sources.</p>
          <h4>Missing and misidentified people</h4>
          <p>
            Currently, there are no required or standardized race and ethnicity
            categories for data collection across state and local jurisdictions.
            The most notable gaps exist for race and ethnic groups, physical and
            mental health status, and sex categories. Many states do not record
            data for <b>American Indian</b>, <b>Alaska Native</b>,{' '}
            <b>Native Hawaiian and Pacific Islander</b> racial categories,
            lumping these people into other groups. Individuals who identify as{' '}
            <b>Hispanic/Latino</b> may not be recorded in their respective race
            category. Neither disability nor mental health status is collected
            with most data sources, and in almost all cases sex is recorded only
            as female, male, or other.
          </p>

          {isIslandArea && <MissingIslandAreaPopulationData />}
          {isCovid && <MissingCovidData />}
          {isCovidVax && <MissingCovidVaccinationData />}
          {isCAWP && <MissingCAWPData />}
          {(isHivOutcome || isHivBWOutcome) && <MissingHIVData />}
          {isHivPrep && <MissingPrepData />}
          {isPhrma && <MissingPhrmaData />}
          {isAHR && <MissingAHRData />}

          <Button
            className={styles.SeeOurDataSourcesButton}
            href={DATA_CATALOG_PAGE_LINK}
            color="primary"
            endIcon={<ArrowForward />}
          >
            See Our Data Sources
          </Button>

          <div className={styles.MissingDataContactUs}>
            <p>
              Do you have information that belongs on the Health Equity Tracker?{' '}
              <LinkWithStickyParams to={`${CONTACT_TAB_LINK}`}>
                We would love to hear from you!
              </LinkWithStickyParams>
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}

export default ReportProvider
