import {
  type DemographicType,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
} from '../../data/query/Breakdowns'
import styles from './MultiMapLink.module.scss'

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
        className={styles.CompareAcrossLink}
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
