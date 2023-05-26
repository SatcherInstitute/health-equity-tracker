import { Card } from '@mui/material'
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
import {
  type DropdownVarId,
  type VariableConfig,
} from '../../data/config/MetricConfig'
import { getDataTypesMap } from '../../data/config/MetricConfigUtils'

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
  dropdownVarId: DropdownVarId
  variableConfig: VariableConfig | null
  setVariableConfig: (v: VariableConfig) => void
  dropdownVarId2?: DropdownVarId
  variableConfig2?: VariableConfig | null
  setVariableConfig2?: (v: VariableConfig) => void
}

export default function Sidebar(props: SidebarProps) {
  const tocOffset = (props.floatTopOffset ?? 0) + TABLE_OF_CONTENT_PADDING

  const dataTypesMap = getDataTypesMap(props.dropdownVarId)
  const dataTypesMap2 = props.dropdownVarId2
    ? getDataTypesMap(props.dropdownVarId2)
    : undefined

  return (
    <>
      <div className={styles.StickySidebarBox} style={{ top: tocOffset }}>
        <div className="mode-selector-box">
          <Card raised={true} className={styles.SidebarModeSelectorBox}>
            {dataTypesMap &&
              props.variableConfig &&
              props.setVariableConfig && (
                <SimpleSelect<VariableConfig>
                  label="Type"
                  optionsMap={dataTypesMap}
                  selected={props.variableConfig}
                  setSelected={props.setVariableConfig}
                />
              )}
            {dataTypesMap2 &&
              props.variableConfig2 &&
              props.setVariableConfig2 && (
                <SimpleSelect<VariableConfig>
                  label="Compare Type"
                  optionsMap={dataTypesMap2}
                  selected={props.variableConfig2}
                  setSelected={props.setVariableConfig2}
                />
              )}
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
