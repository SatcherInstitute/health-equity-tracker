interface GoalListItemProps {
  title: string
  text: string
}

export default function GoalListItem(props: GoalListItemProps) {
  return (
    <li className='flex w-full flex-col content-start px-6 py-2 md:w-4/12'>
      <h3 className='font-sans-title text-smallest-header px-0 py-4 text-left'>
        {props.title}
      </h3>
      <p className='font-sans-text my-0 text-left'>{props.text}</p>
    </li>
  )
}
