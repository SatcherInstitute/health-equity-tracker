import Resources from '../methodologyComponents/Resources'
import { PDOH_RESOURCES } from '../methodologyContent/ResourcesData'
import { Helmet } from 'react-helmet-async'
import StripedTable from '../methodologyComponents/StripedTable'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import HetNotice from '../../../styles/HetComponents/HetNotice'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import FormulaFormat from '../methodologyComponents/FormulaFormat'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { SDOH_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigSDOH'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import KeyTermsAccordion from '../methodologyComponents/KeyTermsAccordion'
import { DROPDOWN_TOPIC_MAP } from '../../../utils/MadLibs'

const sdohDataSources = [
  dataSourceMetadataMap.acs,
  dataSourceMetadataMap.ahr,
  dataSourceMetadataMap.cdc_svi_county,
]

export const missingAhrDataArray = [
  {
    id: '',
    topic: "Missing America's Health Rankings data",
    definitions: [
      {
        key: 'Population data',
        description:
          'AHR does not have population data available for: preventable hospitalizations, voter participation, and non-medical drug use. We have chosen not to show any percent share metrics for the measures without population data because the source only provides the metrics as rates. Without population data, it is difficult to accurately calculate Percent share measures, which could potentially result in misleading data.',
      },
    ],
  },
]

const datatypeConfigs = SDOH_CATEGORY_DROPDOWNIDS.map((dropdownId) => {
  return METRIC_CONFIG[dropdownId]
}).flat()

export const sdohTopicsString = SDOH_CATEGORY_DROPDOWNIDS.map((dropdownId) => {
  return DROPDOWN_TOPIC_MAP[dropdownId]
}).join(', ')

function SdohLink() {
  return (
    <section id='#sdoh'>
      <article>
        <Helmet>
          <title>Social Determinants of Health - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Social Determinants of Health</h2>

        <StripedTable
          id='#categories-table'
          applyThickBorder={false}
          columns={[
            { header: 'Category', accessor: 'category' },
            { header: 'Topics', accessor: 'topic' },
          ]}
          rows={[
            {
              category: 'Social Determinants of Health',
              topic: sdohTopicsString,
            },
          ]}
        />
        <h3 className='mt-12 text-title font-medium' id='#sdoh-data-sourcing'>
          Data Sourcing
        </h3>
        <p>
          Our tracker's data on social determinants of health, such as
          uninsurance rates and poverty levels, is largely sourced from{' '}
          <a href={'urlMap.amr'}>America’s Health Rankings (AHR)</a>. AHR itself
          gathers most of its data from the{' '}
          <a href={'urlMap.cdcBrfss'}>
            Behavioral Risk Factor Surveillance System (BRFSS)
          </a>{' '}
          survey run by the CDC, augmented by{' '}
          <a href={'urlMap.cdcWonder'}>CDC WONDER</a> and the{' '}
          <a href={'urlMap.censusVoting'}>U.S. Census</a>.
        </p>
        <HetNotice
          className='my-12'
          title="A note about the CDC's Behavioral Risk Factor Surveillance System
            (BRFSS) survey"
        >
          <p>
            It's important to note that because BRFSS is survey-based, it
            sometimes lacks sufficient data for smaller or marginalized racial
            groups, making some estimates less statistically robust.
          </p>
          <p>
            Additionally, BRFSS data by race and ethnicity is not available at
            the county level, limiting our tracker's granularity for these
            metrics.
          </p>
        </HetNotice>
        <p>
          We obtain our data for the following specific issues directly from
          America's Health Rankings (AHR). This data is based on{' '}
          <HetTerm>percent share</HetTerm> metrics that AHR provides in
          downloadable data files. Click on the following to explore the report:
        </p>
        <ul className='list-none pl-0'>
          <li className='font-sansTitle font-medium'>
            <a
              className='no-underline'
              href='https://healthequitytracker.org/exploredata?mls=1.avoided_care-3.00&group1=All'
            >
              care avoidance due to cost
            </a>
          </li>
        </ul>

        <p>
          AHR usually gives us rates as percentages. In some cases, they provide
          the number of cases for every 100,000 people. We keep the data in the
          format AHR provides it. If we need to change a{' '}
          <HetTerm>percentage rate</HetTerm> into a{' '}
          <HetTerm>cases per 100k rate</HetTerm>, we simply multiply the
          percentage by 1,000. For example, a 5% rate would become 5,000 per
          100,000 people.
        </p>
        <FormulaFormat
          leftSide='5% rate'
          rightSide={['5 out of 100', ' = ', '5,000 per 100,000 people']}
        />

        <h3 className='mt-12 text-title font-medium' id='#sdoh-data-sources'>
          Data Sources
        </h3>
        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={sdohDataSources.map((source, index) => ({
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
          hashId='#sdoh-key-terms'
          datatypeConfigs={datatypeConfigs}
        />

        <Resources id='#sdoh-resources' resourceGroups={[PDOH_RESOURCES]} />
      </article>
    </section>
  )
}

export default SdohLink
