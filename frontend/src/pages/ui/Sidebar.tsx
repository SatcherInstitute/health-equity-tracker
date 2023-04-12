import { Card } from '@mui/material'
import { type ScrollableHashId } from '../../utils/hooks/useStepObserver'
import styles from './Sidebar.module.scss'
import ShareButtons from '../../reports/ui/ShareButtons'
import { MADLIB_MODE_MAP, type MadLibId } from '../../utils/MadLibs'
import {
  DEMOGRAPHIC_BREAKDOWNS_MAP,
  type BreakdownVar,
} from '../../data/query/Breakdowns'
import SimpleSelect from './SimpleSelect'
import TableOfContents from './TableOfContents'

const TABLE_OF_CONTENT_PADDING = 15

/*
  reportStepHashIds: ScrollableHashId[]; Array of TOC "hashIds" used to map the hashId to the step display name
  isScrolledToTop?: boolean; Optionally send in top scroll status; when true none of the steps will be highlighted
*/

interface SidebarProps {
  reportStepHashIds: ScrollableHashId[]
  floatTopOffset?: number
  isScrolledToTop?: boolean
  reportTitle: string
  isMobile: boolean
  trackerMode: MadLibId
  setTrackerMode: React.Dispatch<React.SetStateAction<MadLibId>>
  trackerDemographic: BreakdownVar
  setDemoWithParam: (demographic: BreakdownVar) => void
}

export default function Sidebar(props: SidebarProps) {
  const tocOffset = (props.floatTopOffset ?? 0) + TABLE_OF_CONTENT_PADDING

  return (
    <>
      <Card raised={true} className={styles.ShareBox}>
        <ShareButtons
          isMobile={props.isMobile}
          reportTitle={props.reportTitle}
        />
      </Card>

      <div className={styles.StickySidebarBox} style={{ top: tocOffset }}>
        <div className="mode-selector-box">
          <Card raised={true} className={styles.SidebarModeSelectorBox}>
            <SimpleSelect<BreakdownVar>
              label="Demographic"
              optionsMap={DEMOGRAPHIC_BREAKDOWNS_MAP}
              selected={props.trackerDemographic}
              setSelected={props.setDemoWithParam}
            />
            <SimpleSelect<MadLibId>
              label="Compare mode"
              optionsMap={MADLIB_MODE_MAP}
              selected={props.trackerMode}
              setSelected={props.setTrackerMode}
            />
          </Card>
        </div>

        <Card raised={true} className={styles.TableOfContentsBox}>
          <TableOfContents
            reportStepHashIds={props.reportStepHashIds}
            isScrolledToTop={props.isScrolledToTop ?? false}
          />
        </Card>
      </div>
    </>
  )
}
