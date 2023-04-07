import { Card } from '@mui/material'
import styles from './ModeSelectorBoxMobile.module.scss'
import DemographicSelect from '../../pages/ui/DemographicSelect'
import ModeSelect from '../../pages/ui/ModeSelect'
import { type MadLibId } from '../../utils/MadLibs'
import { type BreakdownVar } from '../../data/query/Breakdowns'

interface ModeSelectorBoxMobileProps {
  trackerMode: MadLibId
  setTrackerMode: React.Dispatch<React.SetStateAction<MadLibId>>
  trackerDemographic: BreakdownVar
  setDemoWithParam: (demographic: BreakdownVar) => void
}

export default function ModeSelectorBoxMobile(
  props: ModeSelectorBoxMobileProps
) {
  return (
    <div className="mode-selector-box-mobile">
      <Card raised={true} className={styles.ModeSelectorBoxMobile}>
        <DemographicSelect
          trackerDemographic={props.trackerDemographic}
          setDemoWithParam={props.setDemoWithParam}
        />
        <ModeSelect
          trackerMode={props.trackerMode}
          setTrackerMode={props.setTrackerMode}
        />
      </Card>
    </div>
  )
}
