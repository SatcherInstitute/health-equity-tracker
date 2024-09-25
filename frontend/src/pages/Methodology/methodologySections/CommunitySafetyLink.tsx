import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { COMMUNITY_SAFETY_DROPDOWNIDS } from '../../../data/config/MetricConfigCommunitySafety'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { Helmet } from 'react-helmet-async'
import StripedTable from '../methodologyComponents/StripedTable'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import KeyTermsTopicsAccordion from '../methodologyComponents/KeyTermsTopicsAccordion'
import HetNotice from '../../../styles/HetComponents/HetNotice'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import { buildTopicsString } from './linkUtils'

export const communitySafetyDataSources = [dataSourceMetadataMap.cdc_wisqars]

export const communitySafetyTopicsString = buildTopicsString(
  COMMUNITY_SAFETY_DROPDOWNIDS,
)

export const dataTypeConfigs = COMMUNITY_SAFETY_DROPDOWNIDS.flatMap(
  (dropdownId) => {
    return METRIC_CONFIG[dropdownId]
  },
)

const CommunitySafetyLink = () => {
  return (
    <section id='community-safety'>
      <article>
        <Helmet>
          <title>Community Safety - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Community Safety</h2>

        <StripedTable
          id='categories-table'
          applyThickBorder={false}
          columns={[
            { header: 'Category', accessor: 'category' },
            { header: 'Topics', accessor: 'topic' },
          ]}
          rows={[
            {
              category: 'Community Safety',
              topic: communitySafetyTopicsString,
            },
          ]}
        />

        <h3
          className='mt-12 text-title font-medium'
          id='community-safety-data-sourcing'
        >
          Data Sourcing
        </h3>
        <p>
          The CDC’s Web-based Injury Statistics Query and Reporting System
          (WISQARS) collects and provides data on gun deaths in the United
          States. This information is gathered from state and local injury
          surveillance programs and is used to understand the impact of
          firearm-related injuries across the country. WISQARS™ allows users to
          explore data by intent of injury, mechanism, geographic location, and
          demographics, supporting public health and policy decisions.
        </p>
        <HetNotice className='my-12' title='A note about CDC WISQARS'>
          The CDC’s WISQARS limits data released at state and county levels to
          protect privacy. Mortality data, collected from death certificates and
          processed by the National Center for Health Statistics, takes
          approximately 13 months to become official. Provisional data and
          annual updates mean that reported numbers may change and should be
          interpreted with caution. Additionally, postcensal population
          estimates are updated annually, affecting fatal injury rates over
          time.
        </HetNotice>

        <section>
          <div className='py-5'>
            <h4 className='text-text font-normal'>WISQARS Injuries Measures</h4>
            <h5 className='my-2'>Conditions</h5>
            <ul className='list-inside list-disc pl-4'>
              <>
                <li>
                  <HetTerm>Gun-Related Deaths by Homicides</HetTerm>
                </li>
                <li>
                  <HetTerm>Gun-Related Deaths by Suicides</HetTerm>
                </li>
              </>

              <li>
                <HetTerm>Gun-Related Deaths for Children</HetTerm>
              </li>
              <li>
                <HetTerm>Gun-Related Deaths for Young Adults</HetTerm>
              </li>

              <li>
                <HetTerm>Gun-Related Deaths for Black Men</HetTerm>
              </li>
            </ul>

            <h5 className='my-2'>Metrics</h5>
            <ul className='list-inside list-disc pl-4'>
              <li>
                <HetTerm>Deaths per 100k</HetTerm>: Rate of deaths caused by
                firearms per 100,000 individuals in the population.
              </li>
              <li>
                <HetTerm>Percent share</HetTerm>: This figure measures a
                particular group’s share of the total cases of gun-related
                deaths.
              </li>
              <li>
                <HetTerm>Population percent</HetTerm>: This figure measures a
                particular group’s share of the total measured population.
              </li>
            </ul>
          </div>

          <div className='py-5'>
            <h4 className='text-text font-normal'>Demographic Identifiers</h4>
            <p>
              <strong>Race/ethnicity:</strong> WISQARS' methodology includes
              race category data from 2018 onward, aligning with WISQARS’
              transition to single race categories from bridged race categories
              used in previous years. The dataset does not provide information
              on unknown races, ensuring that all race data for gun deaths are
              categorized under the specified groups. This approach helps
              maintain consistency and accuracy in representing demographic
              information in gun-related death statistics. Note that data for
              age and sex categories extends further back in time.
            </p>
            <p>
              <strong>Sex:</strong> WISQARS data on gun deaths is categorized by
              sex as male and female.
            </p>
            <p>
              <strong>Age:</strong> WISQARS provides the age of each individual
              at the time of death. We group and present this data in several
              ways, both as focused reports and as a demographic
              disaggregations.
            </p>
            <p>For our "Youth" reports we present:</p>
            <ul className='list-inside list-disc pl-4'>
              <li>0-17 years old (Children)</li>
              <li>18-25 years old (Young Adults)</li>
            </ul>
            <p>
              For our other reports, we categorize age into the following
              groups:
            </p>

            <ul className='list-inside list-disc pl-4'>
              <li>0-14 years old</li>
              <li>15-19 years old</li>
              <li>20-24 years old</li>
              <li>25-29 years old</li>
              <li>30-34 years old</li>
              <li>35-44 years old</li>
              <li>45-64 years old</li>
              <li>65 years old and over</li>
            </ul>
          </div>
        </section>

        <h3
          className='mt-12 text-title font-medium'
          id='community-safety-data-sources'
        >
          Data Sources
        </h3>

        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={communitySafetyDataSources.map((source, index) => ({
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

        <KeyTermsTopicsAccordion
          hashId='community-safety-key-terms'
          datatypeConfigs={dataTypeConfigs}
        />
      </article>
    </section>
  )
}

export default CommunitySafetyLink
