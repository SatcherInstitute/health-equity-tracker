interface Tag {
  name: string
  link?: string
}

interface HetTagsProps {
  tags: Tag[] | string[]
  onTagClick?: (tagName: string) => void
}

export const HetTags: React.FC<HetTagsProps> = ({ tags, onTagClick }) => {
  const normalizedTags: Tag[] = tags.map((tag) =>
    typeof tag === 'string' ? { name: tag } : tag,
  )

  const handleClick = (tagName: string) => {
    if (onTagClick) {
      onTagClick(tagName)
    }
  }

  return (
    <div className='text-left md:flex md:flex-wrap'>
      {normalizedTags.map((tag) => (
        <button
          key={tag.name}
          type='button'
          aria-label={tag.name}
          className='mt-1 mr-2 rounded-sm border-none bg-tiny-tag-gray px-2 py-1 font-bold font-sans-title text-black text-tiny-tag uppercase no-underline hover:cursor-pointer hover:bg-hover-tiny-tag-gray'
          onClick={() => handleClick(tag.name)}
        >
          {tag.name}
        </button>
      ))}
    </div>
  )
}
