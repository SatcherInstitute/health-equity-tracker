interface HetTagsProps {
  tags: string[]
}

export const HetTags: React.FC<HetTagsProps> = ({ tags }) => {
  return (
    <div className='md:flex md:flex-wrap mt-2 hidden'>
      {tags.map((name, index) => (
        <span
          aria-label={name}
          key={index}
          className='text-tinyTag uppercase text-altBlack font-sansTitle font-bold bg-ashgray30 rounded-sm py-1 px-2 mr-2 mt-1'
        >
          {name}
        </span>
      ))}
    </div>
  )
}
