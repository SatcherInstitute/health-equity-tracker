import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import StripedTable from '../methodologyComponents/StripedTable'
import { behavioralHealthTopicsString } from './BehavioralHealthLink'
import { chronicDiseaseTopicsString } from './ChronicDiseaseLink'
import { communitySafetyTopicsString } from './CommunitySafetyLink'
import { covidTopicsString } from './Covid19Link'
import { hivTopicsString } from './HivLink'
import { maternalHealthTopicsString } from './MaternalHealthLink'
import { pdohTopicsString } from './PdohLink'
import { sdohTopicsString } from './SdohLink'

const numDataSources = Object.keys(dataSourceMetadataMap).length

export default function TopicCategoriesLink() {
  return (
    <section id='categories'>
      <article>
        <title>Topics by Category - Health Equity Tracker</title>

        <p>
          The Health Equity Tracker (HET) was initially conceived in 2020 as a
          response to the COVID-19 pandemic to aggregate demographic data from
          severely affected communities. While our tool offers a detailed view
          of health outcomes categorized by race, ethnicity, sex, and other
          significant factors, it is essential to acknowledge the limitations.
          One of the inherent constraints is that the tracker currently
          aggregates data from sources that are nation-wide in scope. Our
          current {numDataSources} key sources, including the CDC and the U.S.
          Census Bureau are reputable, well established sources, but might not
          provide the availability and granularity of data that can be obtained
          from individual county or city-specific providers.
        </p>

        <p>
          Our focus extends beyond just pandemic-related statistics; the tracker
          encompasses thousands of report configurations, covering chronic
          diseases like COPD and diabetes, behavioral health indicators such as
          opioid misuse, and social and political determinants including
          uninsurance rates and poverty levels. These topics, along with
          multiple demographic and geographic filtering options, were
          deliberately chosen to provide a multi-dimensional view of health
          equity, guiding policymakers towards understanding the unique
          challenges and needs of diverse communities.
        </p>

        <h2 className='mt-12 font-medium text-title' id='categories'>
          Categories
        </h2>
        <StripedTable
          id='categories-table'
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
              category: 'Community Safety',
              topic: communitySafetyTopicsString,
            },
            {
              category: 'Maternal Health',
              topic: maternalHealthTopicsString,
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
      </article>
    </section>
  )
}
