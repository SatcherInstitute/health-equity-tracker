import type React from 'react'
import ResourceItem from './ResourceItem'

interface ResourceSectionProps {
  id: string
  icon: React.ReactNode
  title: string
  description: string | JSX.Element
  resources: {
    title: string
    description: string | JSX.Element
    link?: string
  }[]
}

const ResourceSection: React.FC<ResourceSectionProps> = ({
  id,
  icon,
  title,
  description,
  resources,
}) => {
  return (
    <section id={id}>
      <div className='flex flex-row w-full items-center rounded-md border border-solid border-methodologyGreen'>
        <div className='text-exploreButton p-4 w-fit mr-4'>
          <div className='px-0 py-0 w-fit rounded-sm text-altGreen flex flex-row items-center justify-start gap-1 smMd:gap-4 fade-in-up-blur'>
            {icon}
          </div>
        </div>
        <h3 className='my-0 text-title font-medium text-altGreen'>{title}</h3>
      </div>
      <p>{description}</p>
      <ul className='list-none'>
        {resources.map((resource) => (
          <ResourceItem
            key={resource.title}
            title={resource.title}
            description={resource.description}
            link={resource.link}
          />
        ))}
      </ul>
    </section>
  )
}

export default ResourceSection
