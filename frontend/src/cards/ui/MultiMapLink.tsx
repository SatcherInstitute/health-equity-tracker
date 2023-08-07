import { useAtomValue } from 'jotai'
import { DEMOGRAPHIC_TYPE_DISPLAY_NAMES_LOWER_CASE } from '../../data/query/Breakdowns'
import { selectedDemographicTypeAtom } from '../../utils/sharedSettingsState'
import styles from './MultiMapLink.module.scss'

/*
Generates the "COMPARES ACROSS GROUPS" button which opens the small multiples modal
*/
interface MultiMapLinkProps {
  setMultimapOpen: (multimapOpen: boolean) => void
  currentDataType: string
}

export function MultiMapLink(props: MultiMapLinkProps) {
  const demographicType = useAtomValue(selectedDemographicTypeAtom)

  const groupTerm = DEMOGRAPHIC_TYPE_DISPLAY_NAMES_LOWER_CASE[demographicType]
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
