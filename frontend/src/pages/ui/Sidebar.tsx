import { Button, Card } from '@mui/material'
import { type ScrollableHashId } from '../../utils/hooks/useStepObserver'
import styles from './Sidebar.module.scss'
import { MADLIB_MODE_MAP, type MadLibId } from '../../utils/MadLibs'
import {
  DEMOGRAPHIC_BREAKDOWNS_MAP,
  AGE_BREAKDOWN_MAP,
  type BreakdownVar,
} from '../../data/query/Breakdowns'
import SimpleSelect from './SimpleSelect'
import TableOfContents from './TableOfContents'
import TopicInfoModal from '../ExploreData/TopicInfoModal'
import { type DataTypeConfig } from '../../data/config/MetricConfig'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  selectedDataTypeConfig1Atom,
  selectedDataTypeConfig2Atom,
  topicInfoModalIsOpenAtom,
} from '../../utils/sharedSettingsState'

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
  isRaceBySex?: boolean
}

export default function Sidebar(props: SidebarProps) {
  const selectedDataTypeConfig1 = useAtomValue(selectedDataTypeConfig1Atom)
  const selectedDataTypeConfig2 = useAtomValue(selectedDataTypeConfig2Atom)

  const configArray: DataTypeConfig[] = []
  if (selectedDataTypeConfig1) {
    configArray.push(selectedDataTypeConfig1)
  }
  if (
    selectedDataTypeConfig2 &&
    selectedDataTypeConfig2 !== selectedDataTypeConfig1
  ) {
    configArray.push(selectedDataTypeConfig2)
  }

  const setTopicInfoModalIsOpen = useSetAtom(topicInfoModalIsOpenAtom)

  const tocOffset = (props.floatTopOffset ?? 0) + TABLE_OF_CONTENT_PADDING

  return (
    <>
      <TopicInfoModal />

      <div className={styles.StickySidebarBox} style={{ top: tocOffset }}>
        <Card
          raised={true}
          sx={{
            margin: '8px 14px 0 8px',
            padding: '.5rem',
          }}
        >
          {configArray.length > 0 && (
            <Button
              sx={{
                color: 'black',
                fontWeight: '400',
                fontSize: '12px',
                textAlign: 'left',
                lineHeight: '1.3',
              }}
              onClick={() => {
                setTopicInfoModalIsOpen(true)
              }}
            >
              <InfoOutlinedIcon
                sx={{ m: '12px' }}
                fontSize="small"
                color="primary"
              />
              Learn more about selected topics
              {/* {configArray
                .map((config) => config.dataTypeShortLabel)
                .join(' & ')}{' '}
              info */}
            </Button>
          )}
        </Card>

        <div className="mode-selector-box">
          <Card raised={true} className={styles.SidebarModeSelectorBox}>
            <SimpleSelect<BreakdownVar>
              label="Demographic"
              optionsMap={
                props.isRaceBySex
                  ? AGE_BREAKDOWN_MAP
                  : DEMOGRAPHIC_BREAKDOWNS_MAP
              }
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
