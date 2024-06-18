import { ABOUT_US_PAGE_LINK } from '../utils/internalRoutes'
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
  MissingWisqarsData,
} from '../pages/Methodology/methodologyContent/missingDataBlurbs'
import {
  type DropdownVarId,
  type DataTypeConfig,
} from '../data/config/MetricConfig'
import { type Fips } from '../data/utils/Fips'
import { AHR_CONDITIONS } from '../data/providers/AhrProvider'
import { PHRMA_CONDITIONS } from '../data/providers/PhrmaProvider'
import HetTerm from '../styles/HetComponents/HetTerm'
import { COMMUNITY_SAFETY_DROPDOWNIDS } from '../data/config/MetricConfigCommunitySafety'

interface WhatDataAreMissingProps {
  metricConfigSubset: Array<[DropdownVarId, DataTypeConfig[]]>
  fips1: Fips
  fips2?: Fips
}

export default function WhatDataAreMissing(props: WhatDataAreMissingProps) {
  const currentDropDownIds: DropdownVarId[] = props.metricConfigSubset.map(
    (id) => id?.[0]
  )
  const isIslandArea =
    props.fips1?.isIslandArea() ?? props.fips2?.isIslandArea()
  const isCovid = currentDropDownIds.includes('covid')
  const isCovidVax = currentDropDownIds.includes('covid_vaccinations')
  const isCAWP = currentDropDownIds.includes('women_in_gov')
  const isHivOutcome = currentDropDownIds.includes('hiv')
  const isHivBWOutcome = currentDropDownIds.includes('hiv_black_women')
  const isHivPrep = currentDropDownIds.includes('hiv_prep')
  const isAHR = currentDropDownIds.some((condition) => AHR_CONDITIONS.includes(condition))
  const isPhrma = currentDropDownIds.some((condition) => PHRMA_CONDITIONS.includes(condition))
  const isWisqars = COMMUNITY_SAFETY_DROPDOWNIDS.some(condition => currentDropDownIds.includes(condition))

  return (
    <>
      <h4 className='text-text font-light'>Missing and misidentified people</h4>
      <p>
        Currently, there are no required or standardized race and ethnicity
        categories for data collection across state and local jurisdictions. The
        most notable gaps exist for race and ethnic groups, physical and mental
        health status, and sex categories. Many states do not record data for{' '}
        <HetTerm>American Indian</HetTerm>, <HetTerm>Alaska Native</HetTerm>,{' '}
        <HetTerm>Native Hawaiian and Pacific Islander</HetTerm> racial
        categories, lumping these people into other groups. Individuals who
        identify as <HetTerm>Hispanic/Latino</HetTerm> may not be recorded in
        their respective race category. Neither disability nor mental health
        status is collected with most data sources, and in almost all cases sex
        is recorded only as female, male, or other.
      </p>

      {isIslandArea && <MissingIslandAreaPopulationData />}
      {isCovid && <MissingCovidData />}
      {isCovidVax && <MissingCovidVaccinationData />}
      {isCAWP && <MissingCAWPData />}
      {(isHivOutcome || isHivBWOutcome) && <MissingHIVData />}
      {isHivPrep && <MissingPrepData />}
      {isPhrma && <MissingPhrmaData />}
      {isAHR && <MissingAHRData />}
      {isWisqars && <MissingWisqarsData />}

      <div className='mt-8 rounded-md bg-infobarColor px-2 py-1'>
        <p className='px-8 py-4 text-center'>
          Do you have information that belongs on the Health Equity Tracker?{' '}
          <LinkWithStickyParams to={ABOUT_US_PAGE_LINK}>
            We would love to hear from you!
          </LinkWithStickyParams>
        </p>
      </div>
    </>
  )
}
