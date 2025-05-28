import HetLazyLoader from '../../styles/HetComponents/HetLazyLoader'

interface GoalListItemProps {
  src?: string
  alt?: string
  title: string
  text: string
}

export default function GoalListItem(props: GoalListItemProps) {
  return (
    <li className='flex w-full flex-col content-start px-6 py-0 md:w-4/12'>
      {props.src && (
        <HetLazyLoader offset={300} height={255} once>
          <img
            className='hidden h-auto max-h-aim-to-go w-full max-w-aim-to-go pb-0 md:block'
            src={props.src}
            alt={props.alt}
          />
        </HetLazyLoader>
      )}
      <h3 className='p-0 text-left font-sans-title text-smallest-header'>
        {props.title}
      </h3>
      <p className='my-0 text-left font-sans-text '>{props.text}</p>
    </li>
  )
}
