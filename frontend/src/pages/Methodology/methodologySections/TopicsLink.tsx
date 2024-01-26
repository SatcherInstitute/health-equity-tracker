import { Helmet } from 'react-helmet-async'
import StripedTable from '../methodologyComponents/StripedTable'
import ConditionVariable from '../methodologyContent/ConditionVariable'
import { missingDataArray } from '../methodologyContent/SourcesDefinitions'
import { behavioralHealthTopicsString } from './BehavioralHealthLink'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { DEMOGRAPHIC_TYPES } from '../../../data/query/Breakdowns'

const numDataSources = Object.keys(dataSourceMetadataMap).length
// tally number of conditions (including sub-conditions like COVID) x # demographic options
const numVariables =
  Object.keys(METRIC_CONFIG).reduce(
    (tally, conditionKey) => (tally += METRIC_CONFIG[conditionKey].length),
    0
  ) * DEMOGRAPHIC_TYPES.length

export default function TopicsLink() {
  return (
    <section id='#categories'>
      <article>
        <Helmet>
          <title>Categories and Limitations - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Categories and Limitations</h2>

        <p>
          The Health Equity Tracker (HET) was initially conceived in 2020 as a
          response to the COVID-19 pandemic to aggregate demographic data from
          severely affected communities. While our tool offers a detailed view
          of health outcomes categorized by race, ethnicity, sex, and other
          significant factors, it is essential to acknowledge the limitations.
          One of the inherent constraints is that the tracker currently
          aggregates data from {numDataSources} key sources, including the CDC
          and the U.S. Census Bureau. While these are reputable sources, the
          availability and granularity of data can sometimes be restrictive.
        </p>

        <p>
          Our focus extends beyond just pandemic-related statistics; the tracker
          encompasses {numVariables} variables, covering chronic diseases like
          COPD and diabetes, behavioral health indicators such as opioid misuse,
          and social and political determinants including uninsurance rates and
          poverty levels. These topics were deliberately chosen to provide a
          multi-dimensional view of health equity, guiding policymakers towards
          understanding the unique challenges and needs of diverse communities.
        </p>

        <h3 className='mt-12 text-title font-medium' id='#categories'>
          Categories
        </h3>
        <StripedTable
          id='#categories-table'
          applyThickBorder={false}
          columns={[
            { header: 'Category', accessor: 'category' },
            { header: 'Topics', accessor: 'topic' },
            { header: 'Data Types', accessor: 'dataType' },
            { header: 'Demographic Breakdowns', accessor: 'demographicType' },
          ]}
          rows={[
            {
              category: 'Behavioral Health',
              topic: behavioralHealthTopicsString,
              demographicType: 'Race/ethnicity, Sex, Age',
            },
            {
              category: 'Chronic Diseases',
              topic:
                'Asthma, Cardiovascular Diseases, Chronic Kidney Disease, COPD, Diabetes',
              demographicType: 'Race/ethnicity, Sex, Age',
            },
            {
              category: 'COVID-19',
              topic: 'COVID-19, COVID-19 Vaccinations',
              demographicType: 'Race/ethnicity, Sex, Age',
              dataType: 'Cases, Deaths, Hospitalizations',
            },
            {
              category: 'HIV',
              topic:
                'HIV, HIV (Black Women), Linkage to HIV Care, PrEP Coverage, HIV Stigma',
              demographicType: 'Race/ethnicity, Sex, Age',
              dataType: 'Prevalence, New diagnoses, Deaths',
            },
            {
              category: 'Political Determinants of Health',
              topic:
                'Incarceration, Voter Participation, Women Serving in Legislative Office',
              demographicType: 'Race/ethnicity, Sex, Age',
              dataType:
                'Prison, Jail, Women serving in US Congress, Women serving in State legislatures',
            },
            {
              category: 'Social Determinants of Health',
              topic:
                'Care Avoidance Due to Cost, Poverty, Uninsured Individuals, Preventable Hospitalization',
              demographicType: 'Race/ethnicity, Sex, Age',
            },
          ]}
        />
        <h3 className='mt-12 text-title font-medium' id='#limitations'>
          Limitations
        </h3>
        <p>
          One challenge is inconsistent breakdown values across datasets. We do
          our best to standardize the values. However, this may not always be
          possible. This matters most when attempting to join with population
          statistics to compute a rate. For comparing two health outcomes, it’s
          less critical since a visualization can still show the different
          values.
        </p>
        <div id='#missing-data'>
          <ConditionVariable definitionsArray={missingDataArray} />
        </div>
      </article>
    </section>
  )
}
