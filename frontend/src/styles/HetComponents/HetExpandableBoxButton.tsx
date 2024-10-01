import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material'

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
      className={`flex w-full px-4 text-black items-center text-left cursor-pointer justify-between border-none leading-lhListBoxTitle bg-listboxColor text-smallest sm:text-text ${
        props.expanded
          ? ''
          : 'text-ellipsis whitespace-nowrap  sm:overflow-hidden'
      } `}
    >
      <span className='flex-grow font-medium hide-on-screenshot'>
        {!props.expanded ? 'Expand' : 'Collapse'} {props.expandBoxLabel}
      </span>

      {props.expanded ? <ArrowDropUp /> : <ArrowDropDown />}
    </button>
  )
}
