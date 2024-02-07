import { Helmet } from 'react-helmet-async'
import StripedTable from '../methodologyComponents/StripedTable'
import ConditionVariable from '../methodologyContent/ConditionVariable'
import { missingDataArray } from '../methodologyContent/SourcesDefinitions'
import { behavioralHealthTopicsString } from './BehavioralHealthLink'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import {
  type DropdownVarId,
  METRIC_CONFIG,
} from '../../../data/config/MetricConfig'
import { DEMOGRAPHIC_TYPES } from '../../../data/query/Breakdowns'
import { covidTopicsString } from './Covid19Link'
import { pdohTopicsString } from './PdohLink'
import { hivTopicsString } from './HivLink'
import { chronicDiseaseTopicsString } from './ChronicDiseaseLink'
import { sdohTopicsString } from './SdohLink'

const numDataSources = Object.keys(dataSourceMetadataMap).length
// tally number of conditions (including sub-conditions like COVID) x # demographic options
const numVariables =
  Object.keys(METRIC_CONFIG).reduce(
    (tally, conditionKey) =>
      (tally += METRIC_CONFIG[conditionKey as DropdownVarId].length),
    0
  ) * DEMOGRAPHIC_TYPES.length

export default function TopicsLink() {
  return (
    <section id='#categories'>
      <article>
        <Helmet>
          <title>Topics by Category - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Topics by Category</h2>

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
          ]}
          rows={[
            {
              category: 'Behavioral Health',
              topic: behavioralHealthTopicsString,
            },
            {
              category: 'Chronic Diseases',
              topic: chronicDiseaseTopicsString,
            },
            {
              category: 'COVID-19',
              topic: covidTopicsString,
            },
            {
              category: 'HIV',
              topic: hivTopicsString,
            },
            {
              category: 'Political Determinants of Health (PDOH)',
              topic: pdohTopicsString,
            },
            {
              category: 'Social Determinants of Health (SDOH)',
              topic: sdohTopicsString,
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
