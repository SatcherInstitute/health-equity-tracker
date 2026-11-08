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
    <section id={id} className='my-4'>
      <div className='border-methodology-green flex w-full flex-row items-center rounded-md border border-solid'>
        <div className='text-explore-button mr-4 w-fit p-4'>
          <div className='fade-in-up-blur text-alt-green smplus:gap-4 flex w-fit flex-row items-center justify-start gap-1 rounded-sm px-0 py-0'>
            <span className='text-title smplus:text-smallest-header'>
              {icon}
            </span>
          </div>
        </div>
        <h2 className='text-alt-green text-title my-0 font-medium'>{title}</h2>
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
