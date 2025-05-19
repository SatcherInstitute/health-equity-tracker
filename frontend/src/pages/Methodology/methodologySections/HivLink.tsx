import { datasourceMetadataHivCategory } from '../../../data/config/DatasetMetadataHivCategory'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { HIV_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigHivCategory'
import HetNotice from '../../../styles/HetComponents/HetNotice'
import HetTopicDemographics from '../../../styles/HetComponents/HetTopicDemographics'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import FormulaFormat from '../methodologyComponents/FormulaFormat'
import KeyTermsTopicsAccordion from '../methodologyComponents/KeyTermsTopicsAccordion'
import Resources from '../methodologyComponents/Resources'
import StripedTable from '../methodologyComponents/StripedTable'
import { HIV_RESOURCES } from '../methodologyContent/ResourcesData'
import { buildTopicsString } from './linkUtils'

const hivDataSources = [
  dataSourceMetadataMap.cdc_atlas,
  dataSourceMetadataMap.acs,
]

const datatypeConfigs = HIV_CATEGORY_DROPDOWNIDS.flatMap((dropdownId) => {
  return METRIC_CONFIG[dropdownId]
})

export const hivTopicsString = buildTopicsString(HIV_CATEGORY_DROPDOWNIDS)

const HivLink = () => {
  return (
    <section id='hiv'>
      <article>
        <title>HIV - Health Equity Tracker</title>

        <StripedTable
          id='categories-table'
          applyThickBorder={false}
          columns={[
            { header: 'Category', accessor: 'category' },
            { header: 'Topics', accessor: 'topic' },
          ]}
          rows={[
            {
              category: 'HIV',
              topic: hivTopicsString,
            },
          ]}
        />

        <h2 className='mt-12 font-medium text-title' id='hiv-data-sourcing'>
          Data Sourcing
        </h2>
        <p id='hiv'>
          The CDC's National Center for HIV, Viral Hepatitis, STD, and TB
          Prevention (NCHHSTP) collects and studies information on the number of
          people diagnosed with HIV in the United States. This information is
          gathered from state and local HIV surveillance programs and is used to
          better understand the impact of HIV across the country.
        </p>
        <HetNotice className='my-12' title='A note about CDC NCHHSTP AtlasPlus'>
          <p>
            The CDC's NCHHSTP and other HIV surveillance programs have agreed to
            limit the data released at the state and county levels in order to
            protect the privacy of those affected. It takes 12 months for the
            data to become official, so the numbers reported before this time
            are not final and should be interpreted with caution. Additionally,
            some of the data is adjusted to account for missing information on
            how people became infected with HIV. This means that the data may
            change as more information becomes available.
          </p>
        </HetNotice>
        <HetNotice
          className='my-12'
          kind='data-integrity'
          title='2020 Data Disruption Due to COVID-19'
        >
          <p>
            The COVID-19 pandemic significantly disrupted data for the year
            2020. This impact could lead to distortions in the reported numbers.
            Please exercise caution when analyzing this year's data.
          </p>
        </HetNotice>
        <p>
          The data for 2022 and 2023 is still in its initial stages of
          collection and has not been finalized, making it "preliminary."
          Single-year figures refer to data that represents just one specific
          year rather than an average or cumulative total over multiple years.
          Given the preliminary status of the 2022 and 2023 data, we've used
          2021 as our reference year when showcasing data from a single year.
        </p>
        <h3
          className='mt-12 font-semibold text-title'
          id='hiv-variable-data-compilation'
        >
          Variable Data Compilation and Analysis
        </h3>
        <h4 className='font-normal text-text'>HIV Diagnoses</h4>
        <p>
          Refers to confirmed HIV infections via laboratory or clinical evidence
          within a specific calendar year. Counts are for individuals aged 13 or
          older diagnosed with HIV during the year. Age is determined by the
          person's age at the time of infection. All metrics sourced from the
          CDC for HIV diagnoses are calculated directly from the raw count of
          those cases.
        </p>
        <h4 className='font-normal text-text'>HIV Prevalence</h4>
        <p>
          Represents estimated individuals aged 13 and older living with HIV by
          the year's end. Accounts for both diagnosed and undiagnosed cases.
          They were adjusted using the total number of diagnosed cases and
          subsequent deaths from the CDC’s Atlas database. The Asian category
          includes cases classified as "Asian/Pacific Islander" using the
          pre-1997 OMB race/ethnicity system when querying HIV prevalence. HIV
          prevalence metrics are determined by estimating the total number of
          individuals who have ever been infected with HIV (diagnosed and
          undiagnosed cases) and then adjusting for the reported total number of
          people diagnosed with HIV and subsequently died provided by the CDC’s
          Atlas database.
        </p>
        <h4 className='font-normal text-text'>HIV Deaths</h4>
        <p>
          Counts deaths of persons aged 13 and older with diagnosed HIV or AIDS,
          irrespective of death cause. Data has a 12-month reporting delay for
          CDC reporting. Age is determined by the person's age at the time of
          death. All metrics sourced from the CDC for HIV deaths are calculated
          directly from the raw count of those cases.
        </p>
        <h4 className='font-normal text-text'>Algorithms</h4>
        <h5>Percent share</h5>
        <p>
          To calculate the percent share of HIV diagnoses, prevalence, or
          deaths, we divide the number of HIV deaths, diagnoses, or prevalence
          in a specific demographic group by the total number of HIV deaths,
          diagnoses, or prevalence and multiply the result by 100.
        </p>
        <FormulaFormat
          leftSide='Percent Share'
          rightSide={[
            {
              numerator: 'Group # cases',
              denominator: 'Total # cases',
            },

            '* 100',
          ]}
        />
        <h5>Population percent</h5>
        <p>
          The population data is obtained directly from the CDC. To calculate
          the population percent share, we divide the number of individuals in a
          specific population by the total number of individuals in the larger
          population and multiply the result by 100.
        </p>
        <FormulaFormat
          leftSide='Population Percent'
          rightSide={[
            {
              numerator: 'Group Pop.',
              denominator: 'Total Pop.',
            },
            '* 100',
          ]}
        />
        <h5>Rate Per 100,000 People (also referred to as 'Rate Per 100k')</h5>
        <p>
          The rate per 100k for HIV diagnoses, prevalence, and deaths is
          obtained directly from the CDC. Calculating the rate per 100k of HIV
          deaths, diagnoses, or prevalence involves dividing the number of
          deaths, diagnoses, or prevalence within a specific population by the
          total population of that group, multiplying the result by 100,000, and
          then expressing it as a rate per 100,000 people.
        </p>
        <FormulaFormat
          leftSide='Rate per 100,000 people'
          rightSide={[
            {
              numerator: 'Group # cases',
              denominator: 'Group Pop.',
            },
            ' * 100,000 ',
          ]}
        />

        <HetNotice
          className='my-12'
          title='A note about HIV Prevention and Care Rates for Transgender People
            (2019)'
        >
          <p>
            Please note: The mentioned groups in our reports refer to{' '}
            <em>sex assigned at birth</em> and not <em>gender identity</em>.
          </p>
          <p>
            <span>
              <strong>Rates per 100k:</strong>
            </span>{' '}
            Unfortunately, due to the absence of reliable population data for
            gender-expansive individuals, we cannot provide rates per 100k.
          </p>
          <p>
            <span>
              <strong>2019 Case Counts:</strong>
            </span>{' '}
            Our data sources, based on the CDC's guidelines, do provide case
            <i>counts</i> for HIV outcomes specifically among Transgender
            People.
          </p>
        </HetNotice>
        <h3
          className='mt-12 font-medium text-title'
          id='hiv-missing-and-suppressed-data'
        >
          Addressing Missing and Suppressed Data
        </h3>
        <HetNotice
          kind='data-integrity'
          title='Upholding the Confidentiality of People Living with HIV/AIDS (PLWHA)'
        >
          <p>
            To protect personal privacy, prevent revealing information that
            might identify specific individuals, and ensure the reliability of
            statistical estimates, small data values may not be available in
            some circumstances.
          </p>
        </HetNotice>
        <p>
          County-level data is suppressed when the population denominator is:
        </p>
        <ul className='list-disc pl-4'>
          <li>less than 100,</li>
          <li>the total case count is between 1–4 cases, or </li>
          <li>when querying HIV or AIDS deaths.</li>
        </ul>

        <p>
          For the Census Island Areas (US territories other than Puerto Rico),
          there isn't enough data to accurately calculate subpopulation rates by
        </p>
        <ul className='list-disc pl-4'>
          <li>age</li>
          <li>sex</li>
          <li>race/ethnicity</li>
        </ul>
        <p>
          As a result, the analysis or report will not provide detailed
          information about these specific groups in those regions. The Asian
          category includes cases previously classified as "Asian/Pacific
          Islander" under the pre-1997 Office of Management and Budget (OMB)
          race/ethnicity classification system when querying HIV prevalence.
        </p>
        <h3 className='mt-12 font-medium text-title' id='prep-coverage'>
          Defining PrEP Coverage as a Percentage
        </h3>
        <p>
          PrEP coverage is quantified as a percentage. It represents the ratio
          of people aged 16 and older who were prescribed PrEP in a given year
          to the estimated number of individuals in the same age group with
          indications for PrEP during that year.
        </p>
        <h4 className='font-normal text-text'>
          Significance of Measuring PrEP Coverage
        </h4>
        <ul className='list-disc pl-4'>
          <li>
            <span>
              <strong>Identifying Disparities:</strong>
            </span>{' '}
            This measure sheds light on variations in PrEP accessibility and
            utilization across diverse demographic segments and geographical
            zones.
          </li>
          <li>
            <span>
              <strong>Monitoring Tool:</strong>
            </span>{' '}
            PrEP coverage percentage serves as an instrument to track shifts in
            PrEP coverage across periods, aiding in the design of targeted
            strategies to amplify PrEP uptake and curtail HIV incidence in
            susceptible groups.
          </li>
          <li>
            <span>
              <strong>Representation of Reality:</strong>
            </span>{' '}
            Expressing PrEP coverage as a percentage gives an authentic
            representation of the fraction of the target population that
            benefits from PrEP.
          </li>
          <li>
            <span>
              <strong>Evaluation Tool:</strong>
            </span>{' '}
            The percentage of PrEP coverage is pivotal in assessing the
            effectiveness of PrEP implementation and uptake initiatives.
          </li>
        </ul>
        <h4 className='font-normal text-text'>
          The Interrelation Between PrEP Coverage and Usage
        </h4>
        <p>
          Adequate PrEP coverage is a foundational step towards its utilization.
          If PrEP coverage is insufficient, high-risk individuals might remain
          unaware or lack access to PrEP. Consequently, lower PrEP coverage can
          correlate with reduced PrEP usage, especially in communities with
          limited access.
        </p>

        <h4 className='font-normal text-text'>Algorithms</h4>

        <p>
          All metrics sourced from the CDC are calculated based on the number of
          PrEP prescriptions provided by the CDC’s Atlas database.
        </p>
        <h5>Percent share</h5>
        <p>
          Calculating the percent share of PrEP prescriptions involves dividing
          the number of PrEP prescriptions filled by a specific population or
          demographic group by the total number of PrEP prescriptions filled and
          multiplying the result by 100.
        </p>
        <FormulaFormat
          leftSide='Percent Share'
          rightSide={[
            {
              numerator: 'Group # Rx filled',
              denominator: 'Total # Rx filled',
            },
            '* 100',
          ]}
        />
        <h5>PrEP-eligible population percent</h5>
        <p>
          Calculating the percent share of the PrEP-eligible population involves
          dividing the number of individuals within a specific population or
          demographic group eligible for PrEP by the total number of individuals
          eligible for PrEP and multiplying the result by 100.
        </p>
        <FormulaFormat
          leftSide='PrEP-Eligible Population Percent'
          rightSide={[
            {
              numerator: 'Group # eligible',
              denominator: 'Total # eligible',
            },
            '* 100',
          ]}
        />
        <h5>PrEP coverage</h5>
        <p>
          This percentage is obtained directly from the CDC. It involves
          dividing the number of individuals within a specific population or
          demographic group using PrEP at a given time by the total number of
          individuals in the same population or demographic group eligible for
          PrEP based on their HIV risk and multiplying the result by 100.
        </p>
        <FormulaFormat
          leftSide='PrEP Coverage'
          rightSide={[
            {
              numerator: 'Group # using',
              denominator: 'Group # eligible',
            },
            '* 100',
          ]}
        />
        <h5>Relative Inequity</h5>
        <p>
          Calculating the percentage of relative inequity involves subtracting
          the proportion of all PrEP prescriptions filled by a specific
          population or group from the proportion of a specific population or
          group in the PrEP-eligible population. The value is divided by the
          proportion of a specific population or group in the PrEP-eligible
          population multiplied by 100 to express it as a percentage.
        </p>
        <FormulaFormat
          leftSide='Relative Inequity'
          rightSide={[
            {
              numerator: 'Use Share - Eligible Pop. Share',
              denominator: 'Eligible Pop. Share',
            },
            '* 100',
          ]}
        />
        <h3
          className='mt-12 font-medium text-title'
          id='prep-missing-and-suppressed-data'
        >
          Addressing Missing and Suppressed PrEP Coverage and Prescriptions Data
        </h3>
        <p>
          State-level and county-level PrEP data are not available for race and
          ethnicity. The race and ethnicity of individuals prescribed PrEP are
          only available for less than 40% of all people prescribed PrEP and are
          limited to four categories:
        </p>
        <ol>
          <li>White</li>
          <li>Black</li>
          <li>Hispanic/Latino</li>
          <li>Other</li>
        </ol>
        <p>PrEP coverage data are suppressed at any level if</p>
        <ul className='list-disc pl-4'>
          <li>the number of persons prescribed PrEP is suppressed,</li>
          <li>
            the estimated number of persons with indications for PrEP
            (PreEP-eligible population) is suppressed, or
          </li>
          <li>if the number of persons prescribed PrEP is less than 40.</li>
        </ul>

        <h3 className='mt-12 font-medium text-title' id='linkage-to-care'>
          Linkage to Care
        </h3>
        <p>
          Linkage to HIV care, reported as a percentage, refers to the number of
          persons aged 13 years and older newly diagnosed with HIV, having at
          least one CD4 or viral load test performed within one month of
          diagnosis during the specified year and divided by the number of
          persons aged 13 years and older newly diagnosed with HIV during the
          specified year.
        </p>
        <p>
          Linkage to HIV care is a critical step in the HIV care continuum and
          can improve health outcomes for individuals with HIV. When a person
          living with HIV is linked to care soon after their diagnosis, they can
          receive the medical treatment and support they need to manage their
          HIV, reduce the amount of virus in their body, improve their health,
          and lower the risk of transmitting HIV to others. Delayed linkage to
          care can result in poorer health outcomes for individuals living with
          HIV and can increase the risk of transmitting HIV to others.
        </p>
        <h4 className='font-normal text-text'>Algorithms</h4>
        <p>
          All metrics sourced from the CDC are calculated based on the number of
          cases of HIV diagnosis where individuals have received at least 1 CD4
          or viral load test performed less than one month after diagnosis.
        </p>
        <h5>Percent share</h5>
        <p>
          Calculating the percent share of individuals who received testing or
          treatment within a month involves dividing the number of people with
          access to HIV care in a specific population or demographic group by
          the total number of people with access to HIV care, and multiplying
          the result by 100.
        </p>
        <FormulaFormat
          leftSide='Percent Share'
          rightSide={[
            {
              numerator: 'Group # care access',
              denominator: 'Total # care access',
            },
            '* 100',
          ]}
        />
        <h5>Diagnosed population percent</h5>
        <p>
          Calculating the percent share of the population involves dividing the
          number of individuals within a specific population or demographic
          group with HIV diagnoses by the total number of individuals with HIV
          diagnoses and multiplying the result by 100.
        </p>
        <FormulaFormat
          leftSide='Diagnosed Population Percent'
          rightSide={[
            {
              numerator: 'Group # HIV cases',
              denominator: 'Total # HIV cases​',
            },
            '* 100',
          ]}
        />
        <h5>Linkage to Care</h5>
        <p>
          This percentage is obtained directly from the CDC. It involves
          dividing the number of individuals within a specific population or
          demographic group with access to care at a given time by the total
          number of individuals living with HIV in the same population or
          demographic group and multiplying the result by 100.
        </p>
        <FormulaFormat
          leftSide='Linkage to Care'
          rightSide={[
            {
              numerator: 'Group # care access​',
              denominator: 'Group # living with HIV',
            },
            '* 100',
          ]}
        />
        <h5>Relative Inequity</h5>
        <p>
          Calculating the percentage of relative inequity involves subtracting
          the proportion of all individuals with access to care by a specific
          population or group from the proportion of a specific population or
          group in the diagnosed population. The value is divided by the
          proportion of a specific population or group in the diagnosed
          population multiplied by 100 to express it as a percentage.
        </p>
        <FormulaFormat
          leftSide='Relative Inequity'
          rightSide={[
            {
              numerator: 'Access Share - HIV Pop. Share',
              denominator: 'HIV Pop. Share​',
            },
            '* 100',
          ]}
        />

        <h3 className='mt-12 font-medium text-title' id='stigma'>
          HIV Stigma
        </h3>
        <p>
          HIV stigma, reported as a score, refers to the weighted median score
          on a 10-item scale ranging from 0 (no stigma) to 100 (high stigma)
          among the number of persons aged 18 years and older diagnosed with
          HIV. This measurement captures four dimensions of HIV stigma:
          personalized stigma experienced during the past 12 months, current
          concerns about disclosure, negative self-image, and perceived public
          attitudes towards people living with HIV.
        </p>
        <p>
          HIV stigma is crucial in understanding and addressing the challenges
          faced by individuals living with HIV. By examining stigma, we gain
          insights into the experiences of people with HIV about personalized
          stigma, concerns about disclosure, self-image, and societal attitudes.
          This information helps inform strategies and interventions to reduce
          stigma, promote social support, and improve the well-being of
          individuals living with HIV.
        </p>
        <h4 className='font-normal text-text'>Algorithm</h4>

        <p>
          All metrics related to HIV stigma are calculated based on a national
          probability sample of individuals diagnosed with HIV, and are sourced
          directly from the CDC.
        </p>
        <h5>Stigma score</h5>
        <p>
          Calculating HIV stigma involves determining the weighted median score
          on a 10-item scale among a national probability sample of people with
          diagnosed HIV.
        </p>

        <FormulaFormat
          leftSide='HIV Stigma Score'
          rightSide={[
            {
              numerator: '',
              denominator: 'Weighted Median of Responses on 10-Item Scale',
            },
          ]}
        />
        <p>
          The scores obtained from self-reported data are then analyzed to
          assess the prevalence and impact of HIV stigma.
        </p>

        <h3
          className='mt-12 font-medium text-title'
          id='demographic-stratification'
        >
          Demographic Stratification
        </h3>

        <HetTopicDemographics
          topicIds={[...HIV_CATEGORY_DROPDOWNIDS]}
          datasourceMetadata={datasourceMetadataHivCategory}
        />

        <h3 className='mt-12 font-medium text-title' id='hiv-data-sources'>
          Data Sources
        </h3>
        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={hivDataSources.map((source) => ({
            source: (
              <a
                key={source.data_source_name}
                href={`${DATA_CATALOG_PAGE_LINK}?${DATA_SOURCE_PRE_FILTERS}=${source.id}`}
              >
                {source.data_source_name}
              </a>
            ),
            updates: source.update_frequency,
          }))}
        />

        <KeyTermsTopicsAccordion
          hashId='hiv-key-terms'
          datatypeConfigs={datatypeConfigs}
        />
        <Resources id='hiv-resources' resourceGroups={[HIV_RESOURCES]} />
      </article>
    </section>
  )
}

export default HivLink
