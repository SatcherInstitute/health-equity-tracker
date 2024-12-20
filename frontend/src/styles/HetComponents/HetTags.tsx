import { Link } from 'react-router-dom'

interface Tag {
  name: string
  link?: string
}

interface HetTagsProps {
  tags: Tag[]
  onTagClick?: (tagName: string) => void
}

export const HetTags: React.FC<HetTagsProps> = ({ tags, onTagClick }) => {
  const handleClick = (tagName: string) => {
    if (onTagClick) {
      onTagClick(tagName)
    }
  }

  return (
    <div className='mt-2 md:flex md:flex-wrap'>
      {tags.map((tag) => (
        <button
          key={tag.name}
          type='button'
          aria-label={tag.name}
          className='mt-1 mr-2 rounded-sm border-none bg-tinyTagGray px-2 py-1 font-bold font-sansTitle text-black text-tinyTag uppercase no-underline hover:cursor-pointer hover:bg-hoverTinyTagGray'
          onClick={() => handleClick(tag.name)}
        >
          {tag.name}
        </button>
      ))}
    </div>
  )
}