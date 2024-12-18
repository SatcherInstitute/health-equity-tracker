interface Tag {
  name: string
  link?: string
}

interface HetTagsProps {
  tags: string[] | Tag[]
}

export const HetTags: React.FC<HetTagsProps> = ({ tags }) => {
  return (
    <div className='mt-2 md:flex md:flex-wrap'>
      {tags.map((tag) => {
        // Ensure backward compatibility: If `tag` is a string, treat it as a name.
        const tagName = typeof tag === 'string' ? tag : tag.name

        return (
          <span
            key={tagName}
            aria-label={tagName}
            className='mt-1 mr-2 rounded-sm bg-tinyTagGray px-2 py-1 font-bold font-sansTitle text-black text-tinyTag uppercase no-underline hover:bg-hoverTinyTagGray'
          >
            {tagName}
          </span>
        )
      })}
    </div>
  )
}
