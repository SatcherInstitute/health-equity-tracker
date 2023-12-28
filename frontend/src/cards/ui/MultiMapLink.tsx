import {
  type DemographicType,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
} from '../../data/query/Breakdowns'

/*
Generates the "COMPARES ACROSS GROUPS" button which opens the small multiples modal
*/
interface MultiMapLinkProps {
  setMultimapOpen: (multimapOpen: boolean) => void
  demographicType: DemographicType
  currentDataType: string
}

export function MultiMapLink(props: MultiMapLinkProps) {
  const groupTerm = DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]
  return (
    <>
      <button
        onClick={() => {
          props.setMultimapOpen(true)
        }}
        className='bg-transparent cursor-pointer border-0 p-0 text-altGreen underline'
        aria-label={
          'Open modal to Compare ' +
          props.currentDataType +
          ' across ' +
          groupTerm +
          ' groups'
        }
      >
        Launch small multiples view
      </button>{' '}
      to compare across {groupTerm} groups.
    </>
  )
}
