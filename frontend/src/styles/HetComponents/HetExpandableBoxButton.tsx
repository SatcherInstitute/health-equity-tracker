import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material'

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
      onClick={() => {
        props.setExpanded(!props.expanded)
      }}
      className={`flex w-full cursor-pointer items-center justify-between border-none bg-listbox-color px-4 text-left text-black text-smallest leading-lh-list-box-title sm:text-text ${
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
