interface Tag {
  name: string
  link?: string
}

interface HetTagsProps {
  tags: string[] | Tag[]
}

export const HetTags: React.FC<HetTagsProps> = ({ tags }) => {
  return (
    <div className='md:flex md:flex-wrap mt-2'>
      {tags.map((tag) => {
        const tagName = typeof tag === 'string' ? tag : tag.name

        return (
          <span
            key={tagName}
            aria-label={tagName}
            className='text-tinyTag uppercase text-black font-sansTitle font-bold bg-tinyTagGray rounded-sm py-1 px-2 mr-2 mt-1 no-underline hover:bg-hoverTinyTagGray'
          >
            {tagName}
          </span>
        )
      })}
    </div>
  )
}
