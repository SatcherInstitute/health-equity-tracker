import type { ResourceGroup } from '../methodologyContent/ResourcesData'

interface ResourcesProps {
  resourceGroups: ResourceGroup[]
  id?: string
}

interface Resource {
  name: string | null | undefined
  url: string | undefined
}

export default function Resources(props: ResourcesProps) {
  const { resourceGroups, id } = props

  const renderResourcesList = (groups: Resource[]) => (
    <ul className='mx-1 my-0 list-none pl-0 text-smallest'>
      {groups.map((resource) => (
        <li key={resource.name ? resource.name : ''}>
          <a href={resource.url}>{resource.name}</a>
        </li>
      ))}
    </ul>
  )

  const renderResourceGroup = ({
    heading,
    resources,
  }: {
    heading: string
    resources: Resource[]
  }) => (
    <div className='w-full' id={id} key={heading}>
      <div className='w-full'>
        <h2 className='mt-12 font-medium text-title'>{heading} Resources</h2>
      </div>
      <div
        className={`w-full ${resources.length >= 10 ? 'md:w-1/2' : 'w-full'}`}
      >
        {renderResourcesList(
          resources.slice(0, Math.ceil(resources.length / 2)),
        )}
      </div>
      {resources.length >= 10 && (
        <div className='w-full md:w-1/2'>
          {renderResourcesList(
            resources.slice(Math.ceil(resources.length / 2)),
          )}
        </div>
      )}
    </div>
  )

  return (
    <section>
      <div className='mx-auto my-4'>
        <div className='w-full'>
          <div className='flex flex-col items-baseline lg:flex-row'>
            {resourceGroups.map(renderResourceGroup)}
          </div>
        </div>
      </div>
    </section>
  )
}
