import ArrowDropDown from '@mui/icons-material/ArrowDropDown'
import ArrowDropUp from '@mui/icons-material/ArrowDropUp'

interface HetExpandableBoxButtonProps {
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  expandBoxLabel: string
}

export default function HetExpandableBoxButton(
  props: HetExpandableBoxButtonProps,
) {
  return (
    <button
      type='button'
      aria-expanded={props.expanded}
      onClick={() => {
        props.setExpanded(!props.expanded)
      }}
      className={`bg-standard-info text-alt-black text-smallest leading-list-box-title sm:text-text flex w-full cursor-pointer items-center justify-between border-none px-4 text-left ${
        props.expanded
          ? ''
          : 'text-ellipsis whitespace-nowrap sm:overflow-hidden'
      } `}
    >
      <span className='grow font-medium'>
        {!props.expanded ? 'Expand' : 'Collapse'} {props.expandBoxLabel}
      </span>

      {props.expanded ? <ArrowDropUp /> : <ArrowDropDown />}
    </button>
  )
}
