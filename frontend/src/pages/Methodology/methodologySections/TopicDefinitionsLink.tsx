import type { DropdownVarId } from '../../../data/config/DropDownIds'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import type { DataTypeConfig } from '../../../data/config/MetricConfigTypes'
import { CATEGORIES_LIST } from '../../../utils/MadLibs'
import { slugify } from '../../../utils/urlutils'

export default function TopicDefinitionsLink() {
  return (
    <section id='topic-definitions'>
      <article>
        <title>Topic Definitions - Health Equity Tracker</title>

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
                <h2 className='mt-12 font-medium text-title'>
                  {category.title}
                </h2>

                {categoryConfigs.map((config: DataTypeConfig) => {
                  return (
                    <div
                      key={config.dataTypeId}
                      className='ml-0 self-start border-0 border-alt-dark font-sans-text text-alt-green text-smallest first:border-t'
                    >
                      <span>
                        <strong>{config.fullDisplayName}</strong>
                      </span>
                      <p className='m-0 ml-1 self-start text-alt-black text-small'>
                        {config.definition?.text}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </article>
    </section>
  )
}
