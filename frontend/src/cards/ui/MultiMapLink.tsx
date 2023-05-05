import {
  type BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from '../../data/query/Breakdowns'
import styles from './MultiMapLink.module.scss'

/*
Generates the "COMPARES ACROSS GROUPS" button which opens the small multiples modal
*/
interface MultiMapLinkProps {
  setMultimapOpen: (multimapOpen: boolean) => void
  currentBreakdown: BreakdownVar
  currentVariable: string
}

export function MultiMapLink(props: MultiMapLinkProps) {
  const groupTerm =
    BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.currentBreakdown]
  return (
    <>
      <button
        onClick={() => {
          props.setMultimapOpen(true)
        }}
        className={styles.CompareAcrossLink}
        aria-label={
          'Open modal to Compare ' +
          props.currentVariable +
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
