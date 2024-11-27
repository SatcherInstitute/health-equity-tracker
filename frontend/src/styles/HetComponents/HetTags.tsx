import type React from 'react'
import { Link } from 'react-router-dom'

interface Tag {
  name: string
  link?: string
}

interface HetTagsProps {
  tags: Tag[] | string[]
}

export const HetTags: React.FC<HetTagsProps> = ({ tags }) => {
  return (
    <div className='md:flex md:flex-wrap mt-2'>
      {tags.map((tag) => {
        const tagName = typeof tag === 'string' ? tag : tag.name
        const tagLink = typeof tag === 'string' ? undefined : tag.link

        return tagLink ? (
          <Link
            to={tagLink}
            key={tagName}
            aria-label={tagName}
            className='text-tinyTag uppercase text-black font-sansTitle font-bold bg-tinyTagGray rounded-sm py-1 px-2 mr-2 mt-1'
          >
            {tagName}
          </Link>
        ) : (
          <span
            key={tagName}
            aria-label={tagName}
            className='text-tinyTag uppercase text-black font-sansTitle font-bold bg-tinyTagGray rounded-sm py-1 px-2 mr-2 mt-1'
          >
            {tagName}
          </span>
        )
      })}
    </div>
  )
}
