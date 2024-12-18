import { Helmet } from 'react-helmet-async'
import { CATEGORIES_LIST } from '../../../utils/MadLibs'
import { slugify } from '../../../utils/urlutils'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import type { DataTypeConfig } from '../../../data/config/MetricConfigTypes'
import type { DropdownVarId } from '../../../data/config/DropDownIds'

export default function TopicDefinitionsLink() {
  return (
    <section id='topic-definitions'>
      <article>
        <Helmet>
          <title>Topic Definitions - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Topic Definitions</h2>

        {CATEGORIES_LIST.map((category) => {
          const categoryConfigs = category.options.flatMap(
            (topic: DropdownVarId) => {
              return METRIC_CONFIG[topic]
            },
          )

          return (
            <div
              id={slugify(category.title)}
              className='mx-auto my-4'
              key={category.title}
            >
              <div key={category.title}>
                <h3 className='mt-12 font-medium text-title'>
                  {category.title}
                </h3>

                {categoryConfigs.map((config: DataTypeConfig) => {
                  return (
                    <div
                      key={config.dataTypeId}
                      className='ml-0 self-start border-0 border-altDark font-sansText text-altGreen text-smallest first:border-t'
                    >
                      <span>
                        <strong>{config.fullDisplayName}</strong>
                      </span>
                      <p className='m-0 ml-1 self-start text-altBlack text-small'>
                        {config.definition?.text}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/*  */}
      </article>
    </section>
  )
}
