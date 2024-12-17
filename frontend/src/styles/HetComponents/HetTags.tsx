interface Tag {
  name: string
  link?: string
}

interface HetTagsProps {
  tags: Tag[]
}

export const HetTags: React.FC<HetTagsProps> = ({ tags }) => {
  return (
    <div className='md:flex md:flex-wrap mt-2'>
      {tags.map(({ name }) => (
        <span
          key={name}
          aria-label={name}
          className='text-tinyTag uppercase text-black font-sansTitle font-bold bg-tinyTagGray rounded-sm py-1 px-2 mr-2 mt-1 no-underline'
        >
          {name}
        </span>
      ))}
    </div>
  )
}
