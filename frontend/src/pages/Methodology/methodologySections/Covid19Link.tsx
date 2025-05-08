import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { COVID_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigCovidCategory'
import HetNotice from '../../../styles/HetComponents/HetNotice'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import KeyTermsTopicsAccordion from '../methodologyComponents/KeyTermsTopicsAccordion'
import Resources from '../methodologyComponents/Resources'
import StripedTable from '../methodologyComponents/StripedTable'
import {
  COVID_RESOURCES,
  COVID_VACCINATION_RESOURCES,
} from '../methodologyContent/ResourcesData'
import { buildTopicsString } from './linkUtils'

const covidDataSources = [
  dataSourceMetadataMap.cdc_restricted,
  dataSourceMetadataMap.acs,
  dataSourceMetadataMap.decia_2010_territory_population,
  dataSourceMetadataMap.decia_2020_territory_population,
  dataSourceMetadataMap.cdc_vaccination_county,
  dataSourceMetadataMap.cdc_vaccination_national,
  dataSourceMetadataMap.kff_vaccination,
  dataSourceMetadataMap.covid_tracking_project,
]

const datatypeConfigs = COVID_CATEGORY_DROPDOWNIDS.flatMap((dropdownId) => {
  return METRIC_CONFIG[dropdownId]
})

export const covidTopicsString = buildTopicsString(COVID_CATEGORY_DROPDOWNIDS)

export default function Covid19Link() {
  return (
    <section id='covid-19'>
      <article>
        <title>COVID-19 - Health Equity Tracker</title>

        <StripedTable
          id='categories-table'
          applyThickBorder={false}
          columns={[
            { header: 'Category', accessor: 'category' },
            { header: 'Topics', accessor: 'topic' },
          ]}
          rows={[
            {
              category: 'COVID-19',
              topic: covidTopicsString,
            },
          ]}
        />

        <h2 className='mt-12 font-medium text-title' id='covid-data-sourcing'>
          Data Sourcing
        </h2>
        <p>
          The primary data source is the CDC Case Surveillance Restricted Access
          Detailed Data. This dataset allows for detailed breakdowns by race,
          age, and even specific ten-year age intervals. We previously used the
          New York Times COVID Dataset as a benchmark to evaluate the
          comprehensiveness of state data in our tracker, however the New York
          Times itself now relies on the CDC dataset making comparisons less
          useful.
        </p>
        <h3 className='mt-12' id='covid-age-and-demographic-data-analysis'>
          Age and Demographic Data Analysis
        </h3>
        <p>
          Age categorization involves ten-year age buckets, ranging from 0-9 up
          to 80+. The case-level data also can provide a cross-sectional
          breakdown by both race and age.
        </p>

        <h3 className='mt-12' id='covid-geographical-reporting'>
          Geographical Distribution and Reporting
        </h3>

        <h4>National Data</h4>
        <p>
          National statistics are based on summations of all state level cases.
        </p>
        <blockquote className='font-medium italic'>
          However, if state data is not accurately provided, these national
          aggregations may be incomplete and potentially skewed.
        </blockquote>

        <h4>County Data</h4>
        <p>
          Specific figures might be concealed in counties with low case counts
          to protect the privacy of affected individuals. The foundational data
          provided by the CDC is detailed at the case level. Therefore, when a
          county doesn't report cases for a certain demographic, it's uncertain
          whether the county truly lacks cases for that group or if there's a
          lapse in accurate demographic reporting.
        </p>

        <h3 className='mt-12' id='covid-time-series'>
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
          the number of new cases reported that month. We categorize each COVID
          case, death, and hospitalization based on the month and year recorded
          in the dataset.
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

        <h3 className='mt-12' id='covid-missing-and-suppressed-data'>
          Addressing Missing and Suppressed Data
        </h3>

        <blockquote className='font-medium italic'>
          Many of the source data case records aren't broken down
          comprehensively, may not specify hospitalization or death statuses, or
          might lack the complete demographic details needed to fully understand
          COVID-19's overall impact.
        </blockquote>

        <h3 className='mt-12' id='covid-vaccination-data-analysis'>
          Vaccination Data Compilation and Analysis
        </h3>
        <p>
          Vaccination definitions might vary across datasets, with terms like
          <em>“at least one dose”</em> and <em>“total doses administered”</em>{' '}
          being used.
        </p>
        <p>
          Due to the lack of a consolidated national vaccine demographic
          dataset, multiple sources are use across different geographic levels:
        </p>

        <h4>National Data</h4>
        <p>Derived from the CDC vaccine demographic dataset.</p>

        <h4>State Data</h4>
        <p>
          Extracted from the Kaiser Family Foundation's COVID-19 Indicators
          dataset.
        </p>

        <h4>County Data</h4>
        <p>
          At the county level, we utilize the{' '}
          <HetTerm>COVID-19 Vaccinations in the United States, County</HetTerm>{' '}
          dataset. This dataset provides only the total number of vaccinations
          administered in each county, without the racial and other demographic
          breakdowns we normally present. It is our hope to standardize our
          vaccination data on higher quality, more detailed recent data in the
          near future.
        </p>

        <h3 className='mt-12' id='covid-vaccination-demographic-estimates'>
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
            estimates that the CDC offers.
          </p>
        </HetNotice>
        <h4>National Estimates</h4>
        <p>
          We use the CDC's population numbers for our national figures,
          especially when considering regions like Palau, Micronesia, and the
          U.S. Marshall Islands, for which obtaining accurate data can be
          challenging.
        </p>

        <h4>State and County Estimates</h4>
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
          out with a different color. Yet, the{' '}
          <HetTerm>Unrepresented Race</HetTerm> category poses challenges due to
          its varying definitions across states. As a result, direct comparisons
          become challenging. The <HetTerm>Percent of vaccinated</HetTerm>{' '}
          metrics for Native Hawaiian and Pacific Islander, and American Indian
          and Alaska Native, are juxtaposed with ACS 5-year estimates, while the{' '}
          <HetTerm>Unrepresented Race</HetTerm> lacks a direct comparison
          metric. For county-level insights, our data stems from the ACS 2019
          population estimates. However, it's crucial to note that the CDC's
          county-level vaccine dataset only presents overall vaccination figures
          without any demographic breakdown.
        </p>

        <h3 className='mt-12' id='covid-data-limitations'>
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

        <h3 className='mt-12' id='covid-data-sources'>
          COVID-19 Data Sources
        </h3>
        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={covidDataSources.map((source) => ({
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
          hashId='covid-key-terms'
          datatypeConfigs={datatypeConfigs}
        />

        <Resources
          id='covid-resources'
          resourceGroups={[COVID_RESOURCES, COVID_VACCINATION_RESOURCES]}
        />
      </article>
    </section>
  )
}
