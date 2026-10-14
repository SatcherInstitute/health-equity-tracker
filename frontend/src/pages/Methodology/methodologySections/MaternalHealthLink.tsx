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
                Hispanic origin. Births to Hispanic mothers of any race,
                including those whose race is unknown, are counted as Hispanic
                or Latino. Births to non-Hispanic mothers are assigned to their
                race group. Births to non-Hispanic mothers with unknown race,
                and births with unknown Hispanic origin, are excluded. Cells
                that CDC WONDER suppresses for confidentiality are not included.
              </li>
              <li>
                <strong>Estimated maternal deaths:</strong> For each state and
                race/ethnicity group, we estimate the number of maternal deaths
                by multiplying the study’s rate by that group’s 2019 live births
                and dividing by 100,000. These are estimates derived from a
                modeled rate, not observed death counts.
              </li>
              <li>
                <strong>State totals for all groups:</strong> The study does not
                publish an all-groups rate for individual states. For 2019 only,
                we calculate one by adding the estimated deaths and live births
                across the race/ethnicity groups that have a matching
                denominator, so state trend charts do not include an all-groups
                line for earlier years. The study combines Asian, Native
                Hawaiian, and Pacific Islander mothers into one group, so we add
                CDC WONDER’s separate Asian and Native Hawaiian or Other Pacific
                Islander births together to match it. Births to mothers of more
                than one race are not included, because the study does not
                publish a rate for that group.
              </li>
            </ul>
            <p>
              <strong>Population percent</strong> reflects each group’s share of
              the total population from the American Community Survey, not its
              share of live births.
            </p>
          </div>

          <div className='py-5'>
            <h3
              className='font-normal text-text'
              id='maternal-mortality-pregnancy-checkbox'
            >
              The Pregnancy Checkbox and Long-Term Trends
            </h3>
            <p>
              A “pregnancy checkbox” was added to US death certificates and
              adopted by states between 2003 and 2017. It improved detection of
              pregnancy-related deaths but also flagged some incidental deaths
              as maternal, so part of the long-term national rise reflects
              expanded measurement rather than underlying risk alone. This
              affects the overall trend only, not the disparities between racial
              and ethnic groups, which persist across measurement approaches.
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

        <p>
          Infant mortality, low birthweight, and low-risk cesarean delivery are
          also sourced from America’s Health Rankings (
          <a href={`${urlMap.ahr}/IMR_MCH`}>infant mortality</a>,{' '}
          <a href={`${urlMap.ahr}/birthweight`}>low birthweight</a>,{' '}
          <a href={`${urlMap.ahr}/low_risk_cesarean`}>
            low-risk cesarean delivery
          </a>
          ), which analyzes the CDC National Center for Health Statistics’
          National Vital Statistics System: the linked birth/infant death files
          for infant mortality, and the natality files for low birthweight and
          low-risk cesarean delivery. America’s Health Rankings reports infant
          mortality per 1,000 live births, pooled over two years; we present it
          per 100,000, and each year shown is the second year of its two-year
          window. Low birthweight and low-risk cesarean delivery are percentages
          and are shown as published. Like severe maternal morbidity, these
          measures are shown as rates only: their denominators (live births) are
          not available by race, ethnicity, or age, so we do not calculate
          estimated totals, percent shares, or population comparisons.
        </p>

        <section>
          <div className='py-5'>
            <h3 className='font-normal text-text'>America’s Health Rankings</h3>
            <h4 className='my-2'>Conditions</h4>
            <ul className='list-inside list-disc pl-4'>
              <li>
                <HetTerm>Severe Maternal Morbidity</HetTerm>
              </li>
              <li>
                <HetTerm>Infant Mortality</HetTerm>
              </li>
              <li>
                <HetTerm>Low Birthweight</HetTerm>
              </li>
              <li>
                <HetTerm>Low-Risk Cesarean Delivery</HetTerm>
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
              <li>
                <HetTerm>Deaths per 100k live births</HetTerm>: This figure
                measures a particular group’s rate of infant deaths before the
                first birthday per every 100,000 live births.
              </li>
              <li>
                <HetTerm>Percent of live births</HetTerm>: The share of a
                particular group’s live births weighing less than 2,500 grams
                (about 5.5 pounds).
              </li>
              <li>
                <HetTerm>Percent of low-risk first births</HetTerm>: The share
                of a particular group’s low-risk first births (a single baby,
                born at term in the head-first position) delivered by cesarean.
              </li>
            </ul>
          </div>

          <div className='py-5'>
            <h3 className='font-normal text-text'>Demographic Identifiers</h3>
            <h4 className='my-2'>Severe maternal morbidity</h4>
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

            <h4 className='my-2'>Infant mortality and low birthweight</h4>
            <p>
              <strong>Race/ethnicity:</strong> The race and ethnicity of the
              person giving birth. Available for American Indian/Alaska Native,
              Asian, Black, Native Hawaiian/Pacific Islander, Hispanic,
              Multiracial, and White.
            </p>
            <p>
              <strong>Age:</strong> The age of the person giving birth, not the
              infant’s age: 15–19, 20–24, 25–29, 30–34, 35–39, and 40–44. Births
              to people under 15 or 45 and older are counted in the overall rate
              only.
            </p>
            <p>
              <strong>Sex:</strong> For infant mortality, the infant’s sex. Not
              available for low birthweight.
            </p>

            <h4 className='my-2'>Low-risk cesarean delivery</h4>
            <p>
              <strong>Race/ethnicity:</strong> The race and ethnicity of the
              person giving birth. Available for Black, Hispanic, and White
              only.
            </p>
            <p>
              <strong>Age and sex:</strong> Not available.
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
