import { Helmet } from 'react-helmet-async'

// TODO: Refactor the missingDataBlurbs to be structured data, then use both here and conditionally on the ExploreData pages. Use the endnote citation concept from the description fields on METRIC_CONFIG to handle any embedded links. See GitHub #2866

import WhatDataAreMissing from '../../../reports/WhatDataAreMissing'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import type { DataTypeConfig } from '../../../data/config/MetricConfigTypes'
import { Fips } from '../../../data/utils/Fips'
import type { DropdownVarId } from '../../../data/config/DropDownIds'

export default function LimitationsLink() {
  return (
    <section id='#limitations'>
      <article>
        <Helmet>
          <title>Limitations and Missing Data - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Limitations and Missing Data</h2>

        <h3 className='mt-12 text-title font-medium'>Limitations</h3>
        <p>While we strive for accuracy, some of the limitations include:</p>

        <h4 className='text-text font-light'>Data Accuracy and Completeness</h4>
        <p>
          Data collected from sources like the CDC may have inaccuracies or
          incompleteness due to errors in reporting, variations in data
          collection methods, or missing data from certain regions or
          populations. This can lead to biases or distortions in the
          representation of disease prevalence.
        </p>
        <h4 className='text-text font-light'>Temporal Lag</h4>
        <p>
          There might be a lag between the occurrence of a disease and its
          reporting. This delay can affect the timeliness of the data presented
          on the health equity tracker, potentially hindering real-time
          decision-making.
        </p>
        <h4 className='text-text font-light'>Geographical Resolution</h4>

        <p>
          While choropleth maps provide a visual representation of data at the
          regional level (e.g., states, counties), the granularity of the data
          may not be sufficient for detecting localized outbreaks or disparities
          within smaller geographic areas.
        </p>
        <h4 className='text-text font-light'>Population Heterogeneity</h4>

        <p>
          Population characteristics can vary significantly across different
          regions and demographic groups. Aggregating data at the state or
          county level may obscure important variations within populations, such
          as differences in socioeconomic status, access to healthcare, or
          cultural factors that influence health outcomes.
        </p>
        <h4 className='text-text font-light'>Ecological Fallacy</h4>

        <p>
          This occurs when inferences about individuals are drawn from
          group-level data. Just because a certain area has a high disease
          prevalence does not mean that every individual within that area is
          affected similarly. Drawing conclusions about individuals based solely
          on aggregated data can lead to erroneous assumptions.
        </p>
        <h4 className='text-text font-light'>Data Interpretation</h4>

        <p>
          Visualizations like choropleth maps can simplify complex data, but
          they can also oversimplify the underlying patterns. Care must be taken
          to ensure that interpretations of the maps consider the context,
          potential confounding variables, and limitations of the data source.
        </p>
        <h4 className='text-text font-light'>External Factors</h4>

        <p>
          Other external factors, such as changes in healthcare policies,
          diagnostic criteria, or environmental conditions, can influence
          disease prevalence and distribution. These factors may not be
          adequately captured in the data or accounted for in the analysis.
        </p>
        <div id='#missing-data'>
          <h3 className='mt-12 text-title font-medium' id='#limitations'>
            What Data Are Missing
          </h3>
          <WhatDataAreMissing
            metricConfigSubset={
              Object.entries(METRIC_CONFIG) as Array<
                [DropdownVarId, DataTypeConfig[]]
              >
            }
            fips1={new Fips('78')}
          />
        </div>
      </article>
    </section>
  )
}
