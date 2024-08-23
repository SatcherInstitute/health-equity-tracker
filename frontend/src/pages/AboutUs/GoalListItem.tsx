import LazyLoad from 'react-lazyload'

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
        <LazyLoad offset={300} height={255} once>
          <img
            className='hidden h-auto max-h-aimToGo w-full max-w-aimToGo pb-0 md:block'
            src={props.src}
            alt={props.alt}
          />
        </LazyLoad>
      )}
      <h4 className='p-0 text-left font-sansTitle text-smallestHeader font-light'>
        {props.title}
      </h4>
      <p className='my-0 text-left font-sansText '>{props.text}</p>
    </li>
  )
}
