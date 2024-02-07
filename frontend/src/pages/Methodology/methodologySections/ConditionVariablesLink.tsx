import { Helmet } from 'react-helmet-async'
import { CATEGORIES_LIST } from '../../../utils/MadLibs'
import { slugify } from '../../../utils/urlutils'

export default function ConditionVariablesLink() {
  return (
    <section id='condition-variables'>
      <article>
        <Helmet>
          <title>Condition Variables - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Condition Variables</h2>

        {CATEGORIES_LIST.map((category) => {
          return (
            <div
              id={slugify(category.title)}
              className='mx-auto my-4'
              key={category.title}
            >
              <div key={category.title}>
                <h3 className='mt-12 text-title font-medium'>
                  {category.title}
                </h3>
                {/*
                <div
                  className='ml-0 self-start border-0 border-altDark font-sansText text-smallest text-altGreen first:border-t'
                >
                  <span>
                    <strong>{item.fullDisplayName}</strong>
                  </span>
                  <p className='m-0 ml-1 self-start text-smallest text-altBlack'>
                    {item.description}
                  </p>
                </div>
                <div
                  className='ml-0 self-start border-0 border-altDark font-sansText text-smallest text-altGreen first:border-t'
                >
                  <span>
                    <strong>{item.key}</strong>
                  </span>
                  <p className='m-0 ml-1 self-start text-smallest text-altBlack'>
                    {item.description}
                  </p>
                </div> */}
              </div>
            </div>
          )
        })}

        {/*  */}
      </article>
    </section>
  )
}
