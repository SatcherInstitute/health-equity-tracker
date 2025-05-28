import type React from 'react'
import ResourceItem from './ResourceItem'

interface ResourceSectionProps {
  id: string
  icon: React.ReactNode
  title: string
  description: React.ReactNode
  resources: {
    title: string
    description: React.ReactNode
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
      <div className='flex w-full flex-row items-center rounded-md border border-methodology-green border-solid'>
        <div className='mr-4 w-fit p-4 text-explore-button'>
          <div className='fade-in-up-blur flex w-fit flex-row items-center justify-start gap-1 rounded-sm px-0 py-0 text-alt-green smMd:gap-4'>
            {icon}
          </div>
        </div>
        <h2 className='my-0 font-medium text-alt-green text-title'>{title}</h2>
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
