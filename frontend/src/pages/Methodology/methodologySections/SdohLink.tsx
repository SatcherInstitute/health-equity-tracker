import { datasourceMetadataAcs } from '../../../data/config/DatasetMetadataAcs'
import { datasourceMetadataAhr } from '../../../data/config/DatasetMetadataAhr'
import { datasourceMetadataChr } from '../../../data/config/DatasetMetadataChr'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { SDOH_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigSDOH'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import HetTopicDemographics from '../../../styles/HetComponents/HetTopicDemographics'
import { urlMap } from '../../../utils/externalUrls'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import AhrMetrics from '../methodologyComponents/AhrMetrics'
import KeyTermsTopicsAccordion from '../methodologyComponents/KeyTermsTopicsAccordion'
import NoteBrfss from '../methodologyComponents/NoteBrfss'
import Resources from '../methodologyComponents/Resources'
import StripedTable from '../methodologyComponents/StripedTable'
import { PDOH_RESOURCES } from '../methodologyContent/ResourcesData'
import { buildTopicsString } from './linkUtils'

const ACS_CONDITION_EARLIEST_YEAR = '2012'
const ACS_CONDITION_CURRENT_YEAR = '2022'

const sdohDataSources = [
  dataSourceMetadataMap.acs,
  dataSourceMetadataMap.ahr,
  dataSourceMetadataMap.chr,
  dataSourceMetadataMap.geo_context,
]

const datatypeConfigs = SDOH_CATEGORY_DROPDOWNIDS.flatMap((dropdownId) => {
  return METRIC_CONFIG[dropdownId]
})

export const sdohTopicsString = buildTopicsString(SDOH_CATEGORY_DROPDOWNIDS)

function SdohLink() {
  return (
    <section id='sdoh'>
      <article>
        <title>Social Determinants of Health - Health Equity Tracker</title>

        <StripedTable
          id='categories-table'
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
        <h2 className='mt-12 font-medium text-title' id='sdoh-data-sourcing'>
          Data Sourcing
        </h2>
        <p>
          Our tracker's data on some social determinants of health including{' '}
          <HetTerm>preventable hospitalizations</HetTerm> are sourced from{' '}
          <a href={urlMap.ahr}>America’s Health Rankings (AHR)</a> and{' '}
          <a href={urlMap.chr}>County Health Rankings (CHR)</a>, both of which
          primarily rely on the{' '}
          <a href={urlMap.cdcBrfss}>
            Behavioral Risk Factor Surveillance System (BRFSS)
          </a>{' '}
          survey run by the CDC, augmented by{' '}
          <a href={urlMap.cdcWonder}>CDC WONDER</a> and the{' '}
          <a href={urlMap.censusVoting}>U.S. Census</a>.
        </p>
        <NoteBrfss />

        <h3
          className='mt-12 font-medium text-title'
          id='sdoh-acs-data-sourcing'
        >
          Poverty and Uninsurance: American Community Survey
        </h3>
        <p>
          Data on <HetTerm>poverty</HetTerm> and{' '}
          <HetTerm>uninsured people</HetTerm> comes directly from the{' '}
          <a href={urlMap.acs5}>
            American Community Survey (ACS) 5-year estimates
          </a>
          , a continuous survey conducted by the U.S. Census Bureau. The ACS
          collects information annually from approximately 3.5 million addresses
          and publishes 5-year rolling estimates to provide reliable data at the
          national, state, and county levels.
        </p>
        <p>
          <strong>Poverty</strong> is measured using ACS table series B17001
          (Poverty Status in the Past 12 Months by Sex by Age), which identifies
          individuals whose household income fell below the federal poverty
          threshold in the prior 12 months. Race-stratified counts are drawn
          from race-specific variants of this table (e.g., B17001A for White
          alone, B17001B for Black or African American alone).
        </p>
        <p>
          <strong>Health insurance coverage</strong> is measured using ACS table
          series C27001 (Health Insurance Coverage Status by Age), which
          identifies individuals without any comprehensive health insurance
          plan. The ACS definition excludes plans that cover only specific
          conditions (e.g., cancer policies, long-term care) and does not count
          dental, vision, life, or disability insurance as comprehensive
          coverage. Race-stratified counts are drawn from race-specific table
          variants (e.g., C27001A for White alone, C27001B for Black or African
          American alone).
        </p>
        <p>
          The tracker uses ACS 5-year estimates from{' '}
          {ACS_CONDITION_EARLIEST_YEAR} through {ACS_CONDITION_CURRENT_YEAR},
          covering national, state, and county geographies broken down by
          race/ethnicity, age, and sex.
        </p>

        <AhrMetrics category='social-determinants' />

        <h3
          className='mt-12 font-medium text-title'
          id='demographic-stratification'
        >
          Demographic Stratification
        </h3>
        <HetTopicDemographics
          topicIds={[...SDOH_CATEGORY_DROPDOWNIDS]}
          datasourceMetadata={{
            ...datasourceMetadataChr,
            ...datasourceMetadataAhr,
            ...datasourceMetadataAcs,
          }}
        />

        <h3 className='mt-12 font-medium text-title' id='sdoh-data-sources'>
          Data Sources
        </h3>
        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={sdohDataSources.map((source) => ({
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
          hashId='sdoh-key-terms'
          datatypeConfigs={datatypeConfigs}
        />

        <Resources id='sdoh-resources' resourceGroups={[PDOH_RESOURCES]} />
      </article>
    </section>
  )
}

export default SdohLink
