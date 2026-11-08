import type { DataItem } from '../methodologyContent/RacesAndEthnicitiesDefinitions'

interface RaceEthnicityListProps {
  dataItem: DataItem
}
export default function RaceEthnicityList(props: RaceEthnicityListProps) {
  return (
    <>
      <h3 className='font-sans-title text-explore-button mt-16 mb-0 text-center font-semibold'>
        {props.dataItem.topic}
      </h3>

      <div id={props.dataItem.topic} key={props.dataItem.topic}>
        {props.dataItem.definitions.map((def) => {
          return (
            <div
              className='mt-0 mb-4 flex flex-col items-start'
              id={def.path}
              key={def.key}
            >
              <h4 className='font-sans-title text-text mt-8 mb-4 font-medium'>
                {def.key}
              </h4>
              <article className='mt-0 flex flex-col items-start pl-6'>
                <p className='text-smallest mb-1 font-semibold'>Definition</p>
                <p className='text-alt-black text-small m-0 italic'>
                  {def.description}
                </p>
                {def.considerations && def.considerations.length > 0 && (
                  <div>
                    {def.considerations.map((consideration) => (
                      <div key={consideration.title}>
                        <p className='text-smallest mb-1 font-semibold'>
                          {consideration.title}
                        </p>
                        {consideration.points.map((point, idx) => (
                          <p className='text-small my-2' key={idx}>
                            {point}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                {def.resource && (
                  <a
                    href={def.resource}
                    className='font-sans-title text-alt-green mt-3 leading-normal font-medium no-underline'
                  >
                    Explore {def.key} resources →
                  </a>
                )}
              </article>
            </div>
          )
        })}
      </div>
    </>
  )
}
