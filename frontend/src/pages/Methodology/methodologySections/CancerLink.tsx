import { datasourceMetadataCdcWonder } from '../../../data/config/DatasetMetadataCdcWonder'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { CDC_CANCER_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigCancer'
import { CANCER_SCREENING_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigPhrmaBrfss'
import HetNotice from '../../../styles/HetComponents/HetNotice'
import HetTopicDemographics from '../../../styles/HetComponents/HetTopicDemographics'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import KeyTermsTopicsAccordion from '../methodologyComponents/KeyTermsTopicsAccordion'
import Resources from '../methodologyComponents/Resources'
import StripedTable from '../methodologyComponents/StripedTable'
import { CANCER_RESOURCES } from '../methodologyContent/ResourcesData'
import { buildTopicsString } from './linkUtils'

const cancerDataSources = [
  dataSourceMetadataMap.cdc_wonder,
  dataSourceMetadataMap.phrma_brfss,
]

const datatypeConfigs = [
  ...CDC_CANCER_CATEGORY_DROPDOWNIDS,
  ...CANCER_SCREENING_CATEGORY_DROPDOWNIDS,
].flatMap((dropdownId) => {
  return METRIC_CONFIG[dropdownId]
})

export const cancerTopicsString = buildTopicsString([
  ...CDC_CANCER_CATEGORY_DROPDOWNIDS,
  ...CANCER_SCREENING_CATEGORY_DROPDOWNIDS,
])

function CancerLink() {
  return (
    <section id='cancer'>
      <article>
        <title>Cancer and Cancer Screenings - Health Equity Tracker</title>

        <StripedTable
          id='categories-table'
          applyThickBorder={false}
          columns={[
            { header: 'Category', accessor: 'category' },
            { header: 'Topics', accessor: 'topic' },
          ]}
          rows={[
            {
              category: 'Cancer',
              topic: cancerTopicsString,
            },
          ]}
        />
        <h2 className='mt-12 font-medium text-title' id='cancer-data-sourcing'>
          Data Sourcing
        </h2>
        <p>CDC Wonder</p>
        <p>
          The CDC's Wide-ranging Online Data for Epidemiologic Research (WONDER)
          provides access to the United States Cancer Statistics (USCS), the
          official federal statistics on cancer incidence compiled from
          high-quality registries through the CDC's National Program of Cancer
          Registries (NPCR) and the National Cancer Institute's Surveillance,
          Epidemiology and End Results (SEER) program. The dataset covers
          1999-2022 and allows users to explore data by location, demographics,
          and cancer type, providing incidence counts, crude rates, and
          age-adjusted rates to support public health surveillance and policy
          decisions.
        </p>
        <p>CDC BRFSS</p>
        <p>
          For cancer screening adherence data, we use the Behavioral Risk Factor
          Surveillance System (BRFSS), the nation's largest continuously
          conducted health survey. BRFSS collects state-level data on preventive
          health services, including cancer screenings, through telephone
          surveys of U.S. residents across all 50 states, the District of
          Columbia, and three U.S. territories.
        </p>
        <HetNotice className='my-12'>
          Cancer incidence data coverage varies by state and year. While most
          recent data covers 100% of the U.S. population, earlier years exclude
          certain states (Mississippi 1999-2002, South Dakota 1999-2000), and
          Puerto Rico data is only available from 2005 onward. It's important to
          note that because BRFSS is survey-based, it sometimes lacks sufficient
          data for smaller or marginalized racial groups, making some estimates
          less statistically robust.
        </HetNotice>
        {/* KEEP THIS BRFSS NOTICE? DOES IT APPLY TO THE SCREENING DATA? */}
        {/* <NoteBrfss /> */}

        <h3
          className='mt-12 font-medium text-title'
          id='demographic-stratification'
        >
          Demographic Stratification
        </h3>
        <HetTopicDemographics
          topicIds={[...CDC_CANCER_CATEGORY_DROPDOWNIDS]}
          datasourceMetadata={{
            ...datasourceMetadataCdcWonder,
          }}
        />

        <h3 className='mt-12 font-medium text-title' id='cancer-data-sources'>
          Data Sources
        </h3>
        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={cancerDataSources.map((source) => ({
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
          hashId='cancer-key-terms'
          datatypeConfigs={datatypeConfigs}
        />

        <Resources id='cancer-resources' resourceGroups={[CANCER_RESOURCES]} />
      </article>
    </section>
  )
}

export default CancerLink
