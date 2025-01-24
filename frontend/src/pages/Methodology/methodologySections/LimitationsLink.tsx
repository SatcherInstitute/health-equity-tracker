import { Helmet } from 'react-helmet-async'

// TODO: Refactor the missingDataBlurbs to be structured data, then use both here and conditionally on the ExploreData pages. Use the endnote citation concept from the description fields on METRIC_CONFIG to handle any embedded links. See GitHub #2866

import type { DropdownVarId } from '../../../data/config/DropDownIds'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import type { DataTypeConfig } from '../../../data/config/MetricConfigTypes'
import { Fips } from '../../../data/utils/Fips'
import WhatDataAreMissing from '../../../reports/WhatDataAreMissing'

export default function LimitationsLink() {
  return (
    <section id='limitations'>
      <article>
        <Helmet>
          <title>Limitations and Missing Data - Health Equity Tracker</title>
        </Helmet>

        <h2 className='mt-12'>Limitations</h2>
        <p>While we strive for accuracy, some of the limitations include:</p>

        <h3>Data Accuracy and Completeness</h3>
        <p>
          Data collected from sources like the CDC may have inaccuracies or
          incompleteness due to errors in reporting, variations in data
          collection methods, or missing data from certain regions or
          populations. This can lead to biases or distortions in the
          representation of disease prevalence.
        </p>
        <h3>Temporal Lag</h3>
        <p>
          There might be a lag between the occurrence of a disease and its
          reporting. This delay can affect the timeliness of the data presented
          on the health equity tracker, potentially hindering real-time
          decision-making.
        </p>
        <h3>Geographical Resolution</h3>

        <p>
          While choropleth maps provide a visual representation of data at the
          regional level (e.g., states, counties), the granularity of the data
          may not be sufficient for detecting localized outbreaks or disparities
          within smaller geographic areas.
        </p>
        <h3>Population Heterogeneity</h3>

        <p>
          Population characteristics can vary significantly across different
          regions and demographic groups. Aggregating data at the state or
          county level may obscure important variations within populations, such
          as differences in socioeconomic status, access to healthcare, or
          cultural factors that influence health outcomes.
        </p>
        <h3>Ecological Fallacy</h3>

        <p>
          This occurs when inferences about individuals are drawn from
          group-level data. Just because a certain area has a high disease
          prevalence does not mean that every individual within that area is
          affected similarly. Drawing conclusions about individuals based solely
          on aggregated data can lead to erroneous assumptions.
        </p>
        <h3>Data Interpretation</h3>

        <p>
          Visualizations like choropleth maps can simplify complex data, but
          they can also oversimplify the underlying patterns. Care must be taken
          to ensure that interpretations of the maps consider the context,
          potential confounding variables, and limitations of the data source.
        </p>
        <h3>External Factors</h3>

        <p>
          Other external factors, such as changes in healthcare policies,
          diagnostic criteria, or environmental conditions, can influence
          disease prevalence and distribution. These factors may not be
          adequately captured in the data or accounted for in the analysis.
        </p>
        <div id='missing-data'>
          <h2 className='mt-12' id='limitations'>
            What Data Are Missing
          </h2>
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
