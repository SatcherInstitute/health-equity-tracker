interface GoalListItemProps {
  title: string
  text: string
}

export default function GoalListItem(props: GoalListItemProps) {
  return (
    <li className='flex w-full flex-col content-start px-6 py-2 md:w-4/12'>
      <h3 className='px-0 py-4 text-left font-sans-title text-smallest-header'>
        {props.title}
      </h3>
      <p className='my-0 text-left font-sans-text'>{props.text}</p>
    </li>
  )
}
