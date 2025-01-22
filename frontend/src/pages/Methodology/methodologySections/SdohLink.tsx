import { Helmet } from 'react-helmet-async'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { SDOH_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigSDOH'
import HetTerm from '../../../styles/HetComponents/HetTerm'
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

const sdohDataSources = [
  dataSourceMetadataMap.acs,
  dataSourceMetadataMap.ahr,
  dataSourceMetadataMap.chr,
  dataSourceMetadataMap.geo_context,
]

// delete this, load from missingDataBlurbs instead
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

const datatypeConfigs = SDOH_CATEGORY_DROPDOWNIDS.flatMap((dropdownId) => {
  return METRIC_CONFIG[dropdownId]
})

export const sdohTopicsString = buildTopicsString(SDOH_CATEGORY_DROPDOWNIDS)

function SdohLink() {
  return (
    <section id='sdoh'>
      <article>
        <Helmet>
          <title>Social Determinants of Health - Health Equity Tracker</title>
        </Helmet>

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

        <AhrMetrics />

        <h3 className='mt-12 font-medium text-title' id='sdoh-data-sources'>
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
