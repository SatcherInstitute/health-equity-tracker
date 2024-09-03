import HetDivider from '../../../styles/HetComponents/HetDivider'
import type { DataItem } from '../methodologyContent/RacesAndEthnicitiesDefinitions'

interface RaceEthnicityListProps {
  dataItem: DataItem
}
export default function RaceEthnicityList(props: RaceEthnicityListProps) {
  return (
    <>
      <h3 className='mt-16 mb-0 font-sansTitle text-center text-exploreButton font-semibold'>
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
              <h4 className='mt-8 mb-4 font-sansTitle text-text font-medium'>
                {def.key}
              </h4>
              <article className='mt-0 flex flex-col items-start pl-6'>
                <p className='text-smallest font-semibold mb-1'>Definition</p>
                <p className='m-0 italic text-altBlack text-small'>
                  {def.description}
                </p>
                {def.considerations && def.considerations.length > 0 && (
                  <div>
                    {def.considerations.map((consideration) => (
                      <div key={consideration.title}>
                        <p className='text-smallest font-semibold mb-1'>
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
                    className='font-sansTitle mt-3 font-medium leading-lhNormal text-altGreen no-underline'
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
