import HetDivider from '../../../styles/HetComponents/HetDivider'
import type { DataItem } from '../methodologyContent/RacesAndEthnicitiesDefinitions'

interface RaceEthnicityListProps {
  dataItem: DataItem
}
export default function RaceEthnicityList(props: RaceEthnicityListProps) {
  return (
    <>
      <h3 className='mt-16 mb-0 text-center font-sansTitle font-semibold text-exploreButton'>
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
              <h4 className='mt-8 mb-4 font-medium font-sansTitle text-text'>
                {def.key}
              </h4>
              <article className='mt-0 flex flex-col items-start pl-6'>
                <p className='mb-1 font-semibold text-smallest'>Definition</p>
                <p className='m-0 text-altBlack text-small italic'>
                  {def.description}
                </p>
                {def.considerations && def.considerations.length > 0 && (
                  <div>
                    {def.considerations.map((consideration) => (
                      <div key={consideration.title}>
                        <p className='mb-1 font-semibold text-smallest'>
                          {consideration.title}
                        </p>
                        {consideration.points.map((point, idx) => (
                          <p className='my-2 text-small' key={idx}>
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
                    className='mt-3 font-medium font-sansTitle text-altGreen leading-lhNormal no-underline'
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
