import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import {
  COVID_RESOURCES,
  COVID_VACCINATION_RESOURCES,
} from '../../WhatIsHealthEquity/ResourcesData'
import Resources from '../methodologyComponents/Resources'
import { Helmet } from 'react-helmet-async'
import StripedTable from '../methodologyComponents/StripedTable'
import HetNotice from '../../../styles/HetComponents/HetNotice'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { COVID_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigCovidCategory'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { DROPDOWN_TOPIC_MAP } from '../../../utils/MadLibs'
import KeyTermsAccordion from '../methodologyComponents/KeyTermsAccordion'

export const covidDataSources = [
  dataSourceMetadataMap.cdc_restricted,
  dataSourceMetadataMap.acs,
  dataSourceMetadataMap.decia_2010_territory_population,
  dataSourceMetadataMap.decia_2020_territory_population,
  dataSourceMetadataMap.cdc_vaccination_county,
  dataSourceMetadataMap.cdc_vaccination_national,
  dataSourceMetadataMap.kff_vaccination,
  dataSourceMetadataMap.covid_tracking_project,
]

const datatypeConfigs = COVID_CATEGORY_DROPDOWNIDS.map((dropdownId) => {
  return METRIC_CONFIG[dropdownId]
}).flat()

export const covidTopicsString = COVID_CATEGORY_DROPDOWNIDS.map(
  (dropdownId) => {
    let topicString = DROPDOWN_TOPIC_MAP[dropdownId]

    if (METRIC_CONFIG[dropdownId].length > 1) {
      const topicDataTypesString = METRIC_CONFIG[dropdownId]
        .map((config) => config.dataTypeShortLabel)
        .join(', ')
      topicString += ` (${topicDataTypesString})`
    }

    return topicString
  }
).join(', ')

export default function Covid19Link() {
  return (
    <section id='#covid-19'>
      <article>
        <Helmet>
          <title>COVID-19 - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>COVID-19</h2>

        <StripedTable
          id='#categories-table'
          applyThickBorder={false}
          columns={[
            { header: 'Category', accessor: 'category' },
            { header: 'Topics (and Data Types)', accessor: 'topic' },
          ]}
          rows={[
            {
              category: 'COVID-19',
              topic: covidTopicsString,
            },
          ]}
        />

        <h3 className='mt-12 text-title font-medium' id='#covid-data-sourcing'>
          Data Sourcing
        </h3>
        <p>
          The primary data source is the CDC Case Surveillance Restricted Access
          Detailed Data. This dataset allows for detailed breakdowns by race,
          age, and even specific ten-year age intervals. We also use the New
          York Times COVID Dataset as a benchmark to evaluate the
          comprehensiveness of state data in our tracker.
        </p>
        <h3
          className='mt-12 text-title font-medium'
          id='#covid-age-and-demographic-data-analysis'
        >
          Age and Demographic Data Analysis
        </h3>
        <p>
          Age categorization involves ten-year age buckets, ranging from 0-9 up
          to 80+. The data provides a breakdown by both race and age.
        </p>

        <h3
          className='mt-12 text-title font-medium'
          id='#covid-geographical-reporting'
        >
          Geographical Distribution and Reporting
        </h3>

        <h4 className='text-text font-light'>National Data</h4>
        <p>
          National statistics are aggregations of state-wide data, meaning that
          we present this information in a summarized form, rather than broken
          down into detailed, individual case levels.
        </p>
        <blockquote className='font-medium italic'>
          However, if state data is not available, these aggregations may be
          incomplete and potentially skewed.
        </blockquote>
        <p>
          In our calculations for the national-level COVID-19 rates per 100,000
          individuals, we consider only the populations of states that report
          complete data. States that have suppressed counts of cases,
          hospitalizations, or deaths are excluded from these calculations.
        </p>

        <h4 className='text-text font-light'>County Data</h4>
        <p>
          Specific figures might be concealed in counties with low case counts
          to protect the privacy of affected individuals. The foundational data
          provided by the CDC is detailed at the case level. Therefore, when a
          county doesn't report cases for a certain demographic, it's uncertain
          whether the county truly lacks cases for that group or if there's a
          lapse in accurate demographic reporting.
        </p>

        <h3 className='mt-12 text-title font-medium' id='#covid-time-series'>
          Time-Series and Temporal Analysis
        </h3>
        <p>
          Utilizes the <code>cdc_case_earliest_dt</code> ("CDC Case Earliest
          Date") field from the CDC Restricted dataset. Data is categorized
          based on the earliest of several factors:
        </p>
        <ol>
          <li>symptom onset,</li>
          <li>positive test date, or</li>
          <li>report date</li>
        </ol>
        <p>
          to the CDC. Monthly charts represent the incidence rate, indicating
          the number of new cases reported. We categorize each COVID case,
          death, and hospitalization based on the month and year recorded in the
          dataset.
        </p>
        <blockquote className='font-medium italic'>
          However, it's crucial to highlight that, for deaths and
          hospitalizations, our data reflects the month when the case was
          initially reported, not the actual month of the death or
          hospitalization event.
        </blockquote>

        <p>
          In our per 100,000 and inequitable distribution metrics, we only
          account for confirmed deaths and hospitalizations.
        </p>
        <p>
          Therefore, if our data indicates 'zero' deaths or hospitalizations for
          a specific demographic in a given month, it's possible there were
          unreported or unconfirmed events for that group during that time frame
          that the CDC hasn't noted. If any geographic area shows no data for
          cases, deaths, or hospitalizations for a particular demographic
          throughout the pandemic, we exclude that demographic from our visual
          representations, under the assumption that data collection for that
          group might be lacking.
        </p>

        <h3
          className='mt-12 text-title font-medium'
          id='#covid-missing-and-suppressed-data'
        >
          Addressing Missing and Suppressed Data
        </h3>
        <p>
          Vaccination definitions might vary across datasets, with terms like
          <em>“at least one dose”</em> and <em>“total doses administered”</em>{' '}
          being used.
        </p>
        <p>
          For COVID-19 related reports, this tracker uses data that is
          disaggregated, meaning it's broken down into detailed, individual case
          levels rather than being presented in a summarized form. This detailed
          data is reported by states, territories, and other jurisdictions to
          the CDC.
        </p>
        <blockquote className='font-medium italic'>
          However, many of these case records aren't broken down
          comprehensively, may not specify hospitalization or death statuses, or
          might lack the complete details needed to fully understand COVID-19's
          overall impact.
        </blockquote>

        <p>
          National figures might be affected if specific state data is
          unavailable. In counties with minimal figures, data may be hidden to
          ensure individual privacy. Decisions to withhold state data are based
          on comparative analysis with other datasets. Data suppression criteria
          involve a comparative analysis with the New York Times COVID Dataset.
        </p>

        <h3
          className='mt-12 text-title font-medium'
          id='#covid-vaccination-data-analysis'
        >
          Vaccination Data Compilation and Analysis
        </h3>
        <p>
          Due to the lack of a consolidated national vaccine demographic
          dataset, multiple sources are use across different geographic levels:
        </p>

        <h4 className='text-text font-light'>National Data</h4>
        <p>Derived from the CDC vaccine demographic dataset.</p>

        <h4 className='text-text font-light'>State Data</h4>
        <p>
          Extracted from the Kaiser Family Foundation's COVID-19 Indicators
          dataset.
        </p>

        <h4 className='text-text font-light'>County Data</h4>
        <p>
          At the county level, our data differs from what we present nationally
          and at the state level. While we typically provide detailed vaccine
          demographics, such as age, race, or gender of those vaccinated, we
          couldn't find a dataset for counties that offers this level of detail.
          Instead, to offer some context, we utilize the 'COVID-19 Vaccinations
          in the United States, County' dataset. This dataset provides only the
          total number of vaccinations administered in each county, without the
          demographic breakdown that we present for other geographical levels.
        </p>

        <h3
          className='mt-12 text-title font-medium'
          id='#covid-vaccination-demographic-estimates'
        >
          Demographic Population Estimates for Vaccination Data
        </h3>

        <HetNotice
          className='my-12'
          title='A note about the 2019 American Community Survey (ACS)'
        >
          <p>
            While the American Community Survey (ACS) is a valuable resource for
            many demographic insights, it has its limitations in the context of
            our study. The ACS doesn't provide the specific age-segmented
            estimates that the CDC offers. Furthermore, even though the ACS
            provides yearly population breakdowns, we've chosen not to
            incorporate their year-by-year data into our system.
          </p>
        </HetNotice>
        <h4 className='text-text font-light'>National Estimates</h4>
        <p>
          We use the CDC's population numbers for our national figures,
          especially when considering regions like Palau, Micronesia, and the
          U.S. Marshall Islands, for which obtaining accurate data can be
          challenging.
        </p>

        <h4 className='text-text font-light'>State and County Estimates</h4>
        <p>
          Accurate population estimates are essential for understanding the
          distribution of vaccinations and pinpointing disparities, especially
          among indigenous and underrepresented groups. For the state level, we
          base our primary data on the ACS 2019 estimates to calculate each
          state's total vaccinations. It's noteworthy that state-reported
          population categories sometimes differ from census categories, leading
          us to lean on the Kaiser Family Foundation's (KFF) tabulations. The
          Kaiser Family Foundation provides detailed population counts for
          specific demographic groups at the state level, including Asian,
          Black, White, and Hispanic populations.
        </p>
        <blockquote className='font-medium italic'>
          However, since the KFF data doesn't comprehensively cover indigenous
          groups, we supplement with ACS 2019 estimates for American Indian and
          Alaska Native, as well as Native Hawaiian and Pacific Islander groups.
        </blockquote>

        <p>
          On our disparities bar chart, these specific population metrics stand
          out with a different color. Yet, the 'Unrepresented Race' category
          poses challenges due to its varying definitions across states. As a
          result, direct comparisons become challenging. The 'Percent of
          vaccinated' metrics for Native Hawaiian and Pacific Islander, and
          American Indian and Alaska Native, are juxtaposed with ACS 5-year
          estimates, while the 'Unrepresented Race' lacks a direct comparison
          metric. For county-level insights, our data stems from the ACS 2019
          population estimates. However, it's crucial to note that the CDC's
          county-level vaccine dataset only presents overall vaccination figures
          without any demographic breakdown.
        </p>

        <h3
          className='mt-12 text-title font-medium'
          id='#covid-data-limitations'
        >
          Data Limitations and Specific Considerations
        </h3>
        <p>
          In our analysis, we account for unique state-specific reporting
          conditions. For instance, New Hampshire, after lifting its national
          COVID-19 emergency response declaration in May 2021, allowed vaccine
          recipients to opt out of state records, potentially skewing the data
          since then.
        </p>
        <blockquote className='font-medium italic'>
          Additionally, there are disparities in state reporting methods; some
          states differentiate race and ethnicity, leading to varied percentages
          of unknown cases. We choose to display the higher metric on national
          maps and both figures on state pages for clarity.
        </blockquote>

        <p>
          The Kaiser Family Foundation's data collection primarily encompasses
          Asian, Black, White, and Hispanic demographics, limiting the scope of
          our per 100k metrics and demographic breakdowns at the state level.
        </p>
        <p>
          Another challenge arises from the lack of a standardized definition
          for “vaccinated.” Typically, it refers to individuals who've received
          at least one vaccine dose. However, states like Arkansas, Illinois,
          Maine, New Jersey, and Tennessee report total vaccine doses
          administered, adding another layer to our comprehensive analysis.
        </p>

        <h3 className='mt-12 text-title font-medium' id='#covid-data-sources'>
          COVID-19 Data Sources
        </h3>
        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={covidDataSources.map((source, index) => ({
            source: (
              <a
                key={index}
                href={`${DATA_CATALOG_PAGE_LINK}?${DATA_SOURCE_PRE_FILTERS}=${source.id}`}
              >
                {source.data_source_name}
              </a>
            ),
            updates: source.update_frequency,
          }))}
        />
        <KeyTermsAccordion
          hashId='#covid-key-terms'
          datatypeConfigs={datatypeConfigs}
        />

        <Resources
          id='#covid-resources'
          resourceGroups={[COVID_RESOURCES, COVID_VACCINATION_RESOURCES]}
        />
      </article>
    </section>
  )
}
