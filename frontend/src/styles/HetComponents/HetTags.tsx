interface Tag {
  name: string
  link?: string
}

interface HetTagsProps {
  tags: Tag[] | string[]
  onTagClick?: (tagName: string) => void
  activeTag?: string
}

export const HetTags: React.FC<HetTagsProps> = ({
  tags,
  onTagClick,
  activeTag,
}) => {
  const normalizedTags: Tag[] = tags.map((tag) =>
    typeof tag === 'string' ? { name: tag } : tag,
  )

  return (
    <div className='text-left md:flex md:flex-wrap'>
      {normalizedTags.map((tag) => {
        const isActive = tag.name === activeTag
        return (
          <button
            key={tag.name}
            type='button'
            aria-label={tag.name}
            aria-pressed={isActive}
            className={`mt-1 mr-2 rounded-sm border-none px-2 py-1 font-bold font-sans-title text-tiny-tag uppercase no-underline transition-colors duration-150 ${
              isActive
                ? 'cursor-default bg-alt-green text-alt-white'
                : 'cursor-pointer bg-tiny-tag-gray text-alt-black hover:bg-methodology-green'
            }`}
            onClick={() => onTagClick?.(tag.name)}
          >
            {tag.name}
          </button>
        )
      })}
    </div>
  )
}
