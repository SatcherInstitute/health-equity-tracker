import { datasourceMetadataAhr } from '../../../data/config/DatasetMetadataAhr'
import { datasourceMetadataMaternalMortality } from '../../../data/config/DatasetMetadataMaternalHealthCategory'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { MATERNAL_HEALTH_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigMaternalHealth'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import HetTopicDemographics from '../../../styles/HetComponents/HetTopicDemographics'
import { urlMap } from '../../../utils/externalUrls'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import KeyTermsTopicsAccordion from '../methodologyComponents/KeyTermsTopicsAccordion'
import StripedTable from '../methodologyComponents/StripedTable'
import { buildTopicsString } from './linkUtils'

const maternalHealthDataSources = [
  dataSourceMetadataMap.maternal_health,
  dataSourceMetadataMap.ahr,
]

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

          <div className='py-5'>
            <h3
              className='font-normal text-text'
              id='maternal-mortality-denominators'
            >
              Live Birth Denominators and Estimated Counts
            </h3>
            <p>
              Maternal mortality rates are modeled estimates published by the
              study authors, expressed per 100,000 live births. The study does
              not publish the underlying counts at every level, so the tracker
              pairs its rates with live birth denominators as follows.
            </p>
            <ul className='list-inside list-disc pl-4'>
              <li>
                <strong>National:</strong> Counts of maternal deaths and live
                births for 1999 and 2019 are taken directly from the table
                published with the study. These counts are used to calculate
                each group’s share of total maternal deaths.
              </li>
              <li>
                <strong>State:</strong> The study does not publish state-level
                counts. For the most recent year (2019), we use live birth
                counts from the{' '}
                <a href={urlMap.cdcWonderNatality}>
                  CDC WONDER Natality (expanded) database
                </a>
                , grouped by the mother’s state of residence, single race, and
                Hispanic origin. Births to Hispanic mothers of any race are
                counted as Hispanic or Latino. Births to non-Hispanic mothers
                are assigned to their race group, and births with unknown race
                or Hispanic origin are excluded. Cells that CDC WONDER
                suppresses for confidentiality are not included.
              </li>
              <li>
                <strong>Estimated maternal deaths:</strong> For each state and
                race/ethnicity group, we estimate the number of maternal deaths
                by multiplying the study’s rate by that group’s 2019 live births
                and dividing by 100,000. These are estimates derived from a
                modeled rate, not observed death counts.
              </li>
              <li>
                <strong>State totals for all groups:</strong> For 2019, each
                state’s all-groups rate is recalculated by adding the estimated
                deaths and live births across the race/ethnicity groups that
                have a matching denominator. The study combines Asian, Native
                Hawaiian, and Pacific Islander mothers into one group, while CDC
                WONDER reports them separately, so this group does not currently
                have a state-level denominator and is not included in these
                totals.
              </li>
            </ul>
            <p>
              <strong>Population percent</strong> reflects each group’s share of
              the total population from the American Community Survey, not its
              share of live births.
            </p>
          </div>
        </section>

        <p>
          Severe maternal morbidity is sourced from{' '}
          <a href={`${urlMap.ahr}/severe_maternal_morbidity`}>
            America’s Health Rankings
          </a>
          , which draws on the AHRQ Healthcare Cost and Utilization Project
          State Inpatient Databases via the HRSA Maternal and Child Health
          Bureau’s Federally Available Data. America’s Health Rankings reports
          this measure per 10,000 delivery hospitalizations; we present it per
          100,000 for consistency with other tracker rates.
        </p>

        <section>
          <div className='py-5'>
            <h3 className='font-normal text-text'>America’s Health Rankings</h3>
            <h4 className='my-2'>Conditions</h4>
            <ul className='list-inside list-disc pl-4'>
              <li>
                <HetTerm>Severe Maternal Morbidity</HetTerm>
              </li>
            </ul>

            <h4 className='my-2'>Metrics</h4>
            <ul className='list-inside list-disc pl-4'>
              <li>
                <HetTerm>Cases per 100k</HetTerm>: This figure measures a
                particular group’s rate of significant, life-threatening
                complications during delivery per every 100,000 delivery
                hospitalizations.
              </li>
            </ul>
          </div>

          <div className='py-5'>
            <h3 className='font-normal text-text'>Demographic Identifiers</h3>
            <p>
              <strong>Race/ethnicity:</strong> Available for American
              Indian/Alaska Native, Asian/Pacific Islander (combined), Black,
              Hispanic, White, and an aggregated other-race group.
            </p>
            <p>
              <strong>Age:</strong> Available for maternal age groups (under 20,
              20–24, 25–29, 30–34, and 35 and older).
            </p>
            <p>
              <strong>Sex:</strong> Not applicable — this measure covers
              delivery hospitalizations only.
            </p>
          </div>
        </section>

        <h3
          className='mt-12 font-medium text-title'
          id='demographic-stratification'
        >
          Demographic Stratification
        </h3>
        <HetTopicDemographics
          topicIds={[...MATERNAL_HEALTH_CATEGORY_DROPDOWNIDS]}
          datasourceMetadata={{
            ...datasourceMetadataMaternalMortality,
            ...datasourceMetadataAhr,
          }}
        />

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
          rows={maternalHealthDataSources.map((source) => ({
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
