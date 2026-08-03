import { urlMap } from '../../../utils/externalUrls'

// Shared component for consistent styling
function MissingDataSection({
  title,
  headingLevel = 'h4',
  children,
}: {
  title: string
  headingLevel?: 'h3' | 'h4'
  children: React.ReactNode
}) {
  const Heading = headingLevel
  return (
    <>
      <Heading className='mt-8 mb-2'>{title}</Heading>
      <div className='m-0 ml-1 self-start text-alt-black text-small'>
        {children}
      </div>
    </>
  )
}

// Shared component for bullet lists
function BulletList({ children }: { children: React.ReactNode }) {
  return (
    <ul className='m-0 ml-1 list-disc self-start pl-4 text-alt-black text-small'>
      {children}
    </ul>
  )
}

// Shared component for paragraphs
function InfoParagraph({ children }: { children: React.ReactNode }) {
  return (
    <p className='m-0 ml-1 self-start text-alt-black text-small'>{children}</p>
  )
}

export function MissingIslandAreaPopulationData() {
  return (
    <MissingDataSection title='Missing population data for Census Island Areas'>
      <InfoParagraph>
        Population data for <b>Northern Mariana Islands</b>, <b>Guam</b>,{' '}
        <b>American Samoa</b>, and the <b>U.S. Virgin Islands</b> are not
        reported in the ACS five year estimates; in these territories, for
        current and time-series based population figures back to 2016, we
        incorporate the 2020 Decennial Island Areas report. For time-series data
        from 2009-2015, we incorporate the{' '}
        <a href='https://www.census.gov/data/datasets/2010/dec/virgin-islands.html'>
          2010 release of the Decennial report
        </a>
        . Note: The NH, or Non-Hispanic race groups are only provided by the
        Decennial report for <b>VI</b> but not the other Island Areas. As the
        overall number of Hispanic-identifying people is very low in these
        Island Areas (hence the Census not providing these race groups), we use
        the ethnicity-agnostic race groups (e.g.{' '}
        <b>Black or African American</b>) even though the condition data may use
        Non-Hispanic race groups (e.g. <b>Black or African American (NH)</b>).
      </InfoParagraph>
    </MissingDataSection>
  )
}

export function MissingCovidData() {
  return (
    <MissingDataSection title='Missing and suppressed COVID data'>
      <InfoParagraph>
        For COVID-19 related reports, this tracker uses disaggregated,
        individual{' '}
        <a href={urlMap.cdcCovidRestricted}>
          case level data reported by states, territories, and other
          jurisdictions to the CDC
        </a>
        . Many of these case records are insufficiently disaggregated, report an
        unknown hospitalization and/or death status, or otherwise fail to
        provide a complete picture of COVID-19 and its overall impact.
      </InfoParagraph>
    </MissingDataSection>
  )
}

export function MissingCovidVaccinationData() {
  return (
    <MissingDataSection title='Missing COVID-19 vaccination data'>
      <BulletList>
        <li>
          <b>Population data:</b> Because state-reported population categories
          do not always coincide with the categories reported by the census, we
          rely on the Kaiser Family Foundation population tabulations for
          state-reported population categories, which only include population
          numbers for <b>Black,</b> <b>White</b>, <b>Asian</b>, and{' '}
          <b>Hispanic</b>. 'Percent of vaccinated' metrics for{' '}
          <b>Native Hawaiian and Pacific Islander</b>, and{' '}
          <b>American Indian and Alaska Native</b> are shown with a population
          comparison metric from the ACS 5-year estimates, while{' '}
          <b>Unrepresented race</b> is shown without any population comparison
          metric.
        </li>
        <li>
          <b>Demographic data:</b> The CDC's county-level vaccine dataset only
          provides vaccination figures for the <b>All</b> group, but does not
          include any demographic disaggregation.
        </li>
      </BulletList>
    </MissingDataSection>
  )
}

export function MissingCAWPData({
  headingLevel,
}: {
  headingLevel?: 'h3' | 'h4'
} = {}) {
  return (
    <MissingDataSection
      title='Missing data for women in legislative office'
      headingLevel={headingLevel}
    >
      <BulletList>
        <li>
          The Center for American Women in Politics (CAWP) dataset uses unique
          race/ethnicity groupings that do not correspond directly with the
          categories used by the U.S. Census. For this reason,{' '}
          <b>Middle Eastern & North African (Women)</b>,{' '}
          <b>Asian American & Pacific Islander (Women)</b>, and{' '}
          <b>Native American, Alaska Native, & Native Hawaiian (Women)</b> are
          presented without corresponding population comparison metrics.
        </li>
        <li>
          We are currently unable to locate reliable data on state legislature
          totals, by state, by year prior to 1983. For that reason, we cannot
          calculate rates of representation historically before that year.
        </li>
        <li>
          <b>Legislature seat totals (denominator):</b> Annual seat counts for
          all 50 states and DC are scraped from{' '}
          <a href={urlMap.cawpStateInfo}>CAWP's state information pages</a>.
          Seat totals for territories (American Samoa, Guam, CNMI, Puerto Rico,
          and the U.S. Virgin Islands) are sourced from{' '}
          <a href={urlMap.ncslLegislators}>
            NCSL (National Conference of State Legislatures)
          </a>{' '}
          and updated manually each year. Note: Puerto Rico's Legislative
          Assembly has a constitutional baseline of 78 seats (27 Senate + 51
          House), but a minority-protection clause can temporarily expand it
          following certain election results; the current 20th Assembly
          (2025-2029) sits at 81 seats.
        </li>
      </BulletList>
    </MissingDataSection>
  )
}

export function MissingHIVData({
  headingLevel,
}: {
  headingLevel?: 'h3' | 'h4'
} = {}) {
  return (
    <MissingDataSection
      title='Missing data for HIV deaths, diagnoses, and prevalence'
      headingLevel={headingLevel}
    >
      <BulletList>
        <li>
          County-level data is suppressed when the population denominator is
          less than 100, the total case count is between 1–4 cases, or when
          querying HIV or AIDS deaths.
        </li>
        <li>
          To protect personal privacy, prevent revealing information that might
          identify specific individuals, and ensure the reliability of
          statistical estimates, small data values may not be available in some
          circumstances.
        </li>
        <li>
          There isn't enough data to accurately calculate subpopulation rates by
          age, sex, and race/ethnicity for the Census Island Areas (US
          territories other than Puerto Rico). As a result, the analysis or
          report will not provide detailed information about these specific
          groups in those regions.
        </li>
        <li>
          The Asian category includes cases previously classified as
          "Asian/Pacific Islander" under the pre-1997 Office of Management and
          Budget (OMB) race/ethnicity classification system when querying HIV
          prevalence.
        </li>
      </BulletList>
    </MissingDataSection>
  )
}

export function MissingPrepData({
  headingLevel,
}: {
  headingLevel?: 'h3' | 'h4'
} = {}) {
  return (
    <MissingDataSection
      title='Missing and suppressed PrEP data'
      headingLevel={headingLevel}
    >
      <BulletList>
        <li>
          The race and ethnicity of individuals prescribed PrEP are only
          available for less than 40% of all people prescribed PrEP and are
          limited to four categories: White, Black, Hispanic/Latino, and Other.
        </li>
        <li>
          State-level and county-level PrEP data are not available for race and
          ethnicity.
        </li>
        <li>
          PrEP coverage data are suppressed at any level if the number of
          persons prescribed PrEP is suppressed, the estimated number of persons
          with indications for PrEP (PrEP-eligible population) is suppressed, or
          if the number of persons prescribed PrEP is less than 40.
        </li>
      </BulletList>
    </MissingDataSection>
  )
}

export function MissingPhrmaData() {
  return (
    <MissingDataSection title='Medicare Administration Data'>
      <InfoParagraph>What demographic data are missing?</InfoParagraph>

      <BulletList>
        <li>
          <b>Gender:</b> The Medicare source files did not include information
          on gender. Gender is not presented in this data.
        </li>
        <li>
          <b>Sexual Orientation:</b> The Medicare source files did not include
          information on sexual orientation. Sexual orientation is not presented
          in this data.
        </li>
        <li>
          <b>Disability:</b> Although we can display rates for those who are
          eligible due to disability generally, we can not represent disparities
          associated with specific physical or mental disabilities.
        </li>
        <li>
          <b>Social and Political Determinants of Health:</b> Unfortunately,
          there are crucial data missing in the Medicare FFS (Fee-For-Service)
          data, such as the impacts of racism and discrimination on health
          outcomes and adherence to medicines.
        </li>
      </BulletList>

      <InfoParagraph>Who is missing?</InfoParagraph>

      <BulletList>
        <li>
          <b>Data Suppression:</b> To{' '}
          <a href='https://resdac.org/articles/cms-cell-size-suppression-policy#:~:text=The%20policy%20stipulates%20that%20no,the%20minimum%20cell%20size%20policy.'>
            protect patient privacy
          </a>
          , all data representing 1-10 people were suppressed.
        </li>
      </BulletList>
    </MissingDataSection>
  )
}

export function MissingAHRData() {
  return (
    <MissingDataSection title="Missing America's Health Rankings data">
      <BulletList>
        <li>
          <b>Population data:</b> AHR publishes its measures as rates only,
          without the underlying case counts or population denominators. To
          display estimated totals and percent share metrics, we merge in
          American Community Survey (ACS) population estimates. Because most AHR
          measures describe adults only, we use the adult (18+) population as
          the comparison denominator for those measures, so that a group's share
          of cases and its share of the population are measured on the same
          population basis.
        </li>
        <li>
          <b>Measures without a matching denominator:</b> Two measures are
          reported over a narrower sub-population than we have population counts
          for. Voter participation is measured among citizens ages 18+, and
          preventable hospitalizations among Medicare enrollees ages 18+.
          Because we cannot break those sub-populations down by race, ethnicity,
          or sex, we cannot calculate a percent share for these measures.
          Instead we substitute the closest population we can break down: the
          adult (18+) population at the national and state levels, and the
          general all-ages population at the county level, where age-specific
          counts are not available. This stand-in is broader than the group the
          rate actually covers, so we label the difference on those tables and
          treat the comparison as context rather than an exact share.
        </li>
        <li>
          <b>Age reports:</b> AHR reports its adult measures against three broad
          age groups (18-44, 45-64, and 65+), but reports its all-ages measures
          against narrower groups such as 15-24 and 65-74. Because the narrower
          groups overlap the broad ones, and because 15-24 includes minors, the
          adult population share is shown only for the three broad groups, where
          it accounts for 100% of the adult population.
        </li>
      </BulletList>
    </MissingDataSection>
  )
}

export function MissingWisqarsData() {
  return (
    <MissingDataSection title='Missing WISQARS Data'>
      <BulletList>
        <li>
          <b>Legal intervention data:</b> Data on deaths caused by legal
          intervention is limited. Therefore, we choose to show raw counts of
          deaths caused by legal intervention in states where the data is
          available. This approach ensures that the information presented is
          accurate and reflective of the available data without making
          potentially misleading calculations based on incomplete information.
          It is important to note that the number of deaths from legal
          intervention available from the CDC is widely considered to be
          underreported.
        </li>
        <li>
          <b>Data suppression:</b> WISQARS suppresses data where the value is
          between one to nine deaths. This suppression is done to protect the
          privacy of individuals and ensure the confidentiality of sensitive
          information.
        </li>
      </BulletList>
    </MissingDataSection>
  )
}
