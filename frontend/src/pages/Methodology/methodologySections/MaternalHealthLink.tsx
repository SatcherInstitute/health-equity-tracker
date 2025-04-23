import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { MATERNAL_HEALTH_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigMaternalHealth'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import KeyTermsTopicsAccordion from '../methodologyComponents/KeyTermsTopicsAccordion'
import StripedTable from '../methodologyComponents/StripedTable'
import { buildTopicsString } from './linkUtils'

const maternalHealthDataSources = [dataSourceMetadataMap.maternal_health]

export const maternalHealthTopicsString = buildTopicsString(
  MATERNAL_HEALTH_CATEGORY_DROPDOWNIDS,
)

const dataTypeConfigs = MATERNAL_HEALTH_CATEGORY_DROPDOWNIDS.flatMap(
  (dropdownId) => {
    return METRIC_CONFIG[dropdownId]
  },
)

const MaternalHealthLink = () => {
  return (
    <section id='maternal-health'>
      <article>
        <title>Maternal Health - Health Equity Tracker</title>

        <StripedTable
          id='categories-table'
          applyThickBorder={false}
          columns={[
            { header: 'Category', accessor: 'category' },
            { header: 'Topics', accessor: 'topic' },
          ]}
          rows={[
            {
              category: 'Maternal Health',
              topic: maternalHealthTopicsString,
            },
          ]}
        />

        <h2
          className='mt-12 font-medium text-title'
          id='maternal-health-data-sourcing'
        >
          Data Sourcing
        </h2>
        <p>
          Trends in State-Level Maternal Mortality by Racial and Ethnic Group in
          the United States. By ingesting figures published on JAMA as part of
          this study, we are able to visualize trends in maternal mortality by
          race/ethnicity in the United States by state, by race, and by year.
        </p>

        <section>
          <div className='py-5'>
            <h3 className='font-normal text-text'>JAMA Network</h3>
            <h4 className='my-2'>Conditions</h4>
            <ul className='list-inside list-disc pl-4'>
              <li>
                <HetTerm>Maternal Mortality</HetTerm>
              </li>
            </ul>

            <h4 className='my-2'>Metrics</h4>
            <ul className='list-inside list-disc pl-4'>
              <li>
                <HetTerm>Deaths per 100k</HetTerm>: This figure measures a
                particular group’s rate of maternal deaths per every 100,000
                live births.
              </li>
              <li>
                <HetTerm>Percent share</HetTerm>: This figure measures a
                particular group’s share of the total maternal deaths.
              </li>
              <li>
                <HetTerm>Population percent</HetTerm>: This figure measures a
                particular group’s share of the total measured population.
              </li>
            </ul>
          </div>

          <div className='py-5'>
            <h3 className='font-normal text-text'>Demographic Identifiers</h3>
            <p>
              <strong>Race/ethnicity:</strong> This source uses race/ethnicity
              categories that align with those we retrieve from the Census data.
            </p>
          </div>
        </section>

        <h3
          className='mt-12 font-medium text-title'
          id='maternal-health-data-sources'
        >
          Data Sources
        </h3>

        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={maternalHealthDataSources.map((source, index) => ({
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
          hashId='maternal-health-key-terms'
          datatypeConfigs={dataTypeConfigs}
        />
      </article>
    </section>
  )
}

export default MaternalHealthLink
