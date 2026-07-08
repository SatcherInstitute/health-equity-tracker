import type { ScrollableHashId } from '../utils/hooks/useStepObserver'

interface ChartTitleProps {
  title: string
  subtitle?: string
  filterButton?: React.ReactNode
  id?: string
}

// Single source of truth for the heading id that names both the card's
// <article> landmark and its chart SVG via aria-labelledby.
export function getChartTitleId(
  scrollToHash: ScrollableHashId,
  isCompareCard?: boolean,
): string {
  return `${scrollToHash}${isCompareCard ? '-2' : ''}-title`
}

export default function ChartTitle(props: ChartTitleProps) {
  return (
    <div className='mx-3 mt-0 mb-2'>
      <h2
        id={props.id}
        className='m-0 p-0 text-center font-medium text-alt-black text-title'
      >
        {props.title}
      </h2>
      {props.subtitle && (
        <h3 className='m-0 mt-2 p-0 text-center font-normal text-small italic'>
          {props.subtitle}
        </h3>
      )}
      {props.filterButton}
    </div>
  )
}
