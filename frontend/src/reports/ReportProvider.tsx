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
  METRIC_CONFIG,
  type DataTypeConfig,
  type DropdownVarId,
} from '../data/config/MetricConfig'
import DefinitionsList from './ui/DefinitionsList'
import LifelineAlert from './ui/LifelineAlert'
import IncarceratedChildrenLongAlert from './ui/IncarceratedChildrenLongAlert'
import { type ScrollableHashId } from '../utils/hooks/useStepObserver'
import WhatDataAreMissing from './WhatDataAreMissing'
import HetLinkButton from '../styles/HetComponents/HetLinkButton'
import { DATA_CATALOG_PAGE_LINK, RACES_AND_ETHNICITIES_LINK } from '../utils/internalRoutes'
import { RaceRelabelingsList } from './ui/RaceRelabelingsList'
import VoteDotOrgBanner from './ui/VoteDotOrgBanner'

export const SINGLE_COLUMN_WIDTH = 12

interface ReportProviderProps {
  isSingleColumn: boolean
  madLib: MadLib
  handleModeChange: any
  selectedConditions: DataTypeConfig[]
  showLifeLineAlert: boolean
  setMadLib: (madLib: MadLib) => void
  showIncarceratedChildrenAlert: boolean
  showVoteDotOrgBanner: boolean
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
    (condition) => condition?.definition?.text
  )

  // create a subset of MetricConfig (with top level string + datatype array)
  // that matches only the selected, defined conditions
  const metricConfigSubset = Object.entries(METRIC_CONFIG).filter(
    (dataTypeArray) =>
      dataTypeArray[1].some((dataType) => definedConditions?.includes(dataType))
  ) as Array<[DropdownVarId, DataTypeConfig[]]>

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

  function getReport() {
    const reportTitle = getMadLibPhraseText(props.madLib)
    // Each report has a unique key based on its props so it will create a
    // new instance and reset its state when the provided props change.
    switch (props.madLib.id) {
      case 'disparity': {
        const dropdownOption = getPhraseValue(props.madLib, 1) as DropdownVarId
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
              reportTitle={reportTitle}
              isMobile={props.isMobile}
              trackerMode={props.madLib.id}
              setTrackerMode={props.handleModeChange}
              dataTypesToDefine={metricConfigSubset}
            />
          </>
        )
      }
      case 'comparegeos': {
        const dropdownOption = getPhraseValue(props.madLib, 1) as DropdownVarId
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
              reportTitle={reportTitle}
              isMobile={props.isMobile}
              trackerMode={props.madLib.id}
              setTrackerMode={props.handleModeChange}
            />
          )
        )
      }
      case 'comparevars': {
        const dropdownOption1 = getPhraseValue(props.madLib, 1) as DropdownVarId
        const dropdownOption2 = getPhraseValue(props.madLib, 3) as DropdownVarId
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
            reportTitle={reportTitle}
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
      <div
        className={`mx-auto my-0 w-full ${props.isSingleColumn
          ? ' max-w-exploreDataPage'
          : 'max-w-exploreDataTwoColumnPage'
          }`}
      >
        {props.showLifeLineAlert && <LifelineAlert />}
        {props.showVoteDotOrgBanner && <VoteDotOrgBanner />}
        {props.showIncarceratedChildrenAlert && false && (
          <IncarceratedChildrenLongAlert />
        )}

        {getReport()}
      </div>

      <div className='mt-20 flex min-h-preload-article w-full justify-center bg-white'>
        <aside className='m-8 max-w-exploreDataPage text-left sm:m-16 '>
          {/* Display condition definition(s) based on the tracker madlib settings */}
          {definedConditions?.length > 0 && (
            <div className='mb-5'>
              <h3
                id='definitions-missing-data'
                className='scroll-m-0 text-header first-of-type:mt-0 md:scroll-mt-24 '
              >
                Definitions:
              </h3>
              <DefinitionsList dataTypesToDefine={metricConfigSubset} />
              <RaceRelabelingsList />

              <HetLinkButton href={RACES_AND_ETHNICITIES_LINK}>
                See our methodology →
              </HetLinkButton>
            </div>
          )}

          <h3 className='mt-12 text-header '>What data are missing?</h3>

          <p>Unfortunately there are crucial data missing in our sources.</p>

          <HetLinkButton href={DATA_CATALOG_PAGE_LINK}>
            See our data sources →
          </HetLinkButton>

          <WhatDataAreMissing
            metricConfigSubset={metricConfigSubset}
            fips1={fips1}
            fips2={fips2 ?? undefined}
          />
        </aside>
      </div>
    </>
  )
}

export default ReportProvider
