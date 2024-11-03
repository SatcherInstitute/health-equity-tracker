import type React from 'react'
import HetLaunchLink from '../../../styles/HetComponents/HetLaunchLink'

interface ResourceItemProps {
  title: string
  description: React.ReactNode
  link?: string
}

const ResourceItem: React.FC<ResourceItemProps> = ({
  title,
  description,
  link,
}) => {
  return (
    <li className='flex flex-row align-center'>
      <p className='p-0 mt-0 mb-4'>
        <span className='font-semibold text-black'>
          {title}
          {link ? (
            <>
              {' '}
              <HetLaunchLink href={link} label={title} />:
            </>
          ) : (
            ':'
          )}
        </span>{' '}
        {description}
      </p>
    </li>
  )
}

export default ResourceItem
