import { Card, Grid } from '@mui/material'
import styles from './ModeSelectorBoxMobile.module.scss'
import { MADLIB_MODE_MAP, type MadLibId } from '../../utils/MadLibs'
import SimpleSelect from '../../pages/ui/SimpleSelect'
import { type ScrollableHashId } from '../../utils/hooks/useStepObserver'
import { reportProviderSteps } from '../ReportProviderSteps'
import JumpToSelect from '../../pages/ui/JumpToSelect'
import TopicInfoModalButton from '../../pages/ui/TopicInfoModalButton'
import DemographicTypeSelect from '../../pages/ui/DemographicTypeSelect'

interface ModeSelectorBoxMobileProps {
  trackerMode: MadLibId
  setTrackerMode: React.Dispatch<React.SetStateAction<MadLibId>>
  offerJumpToAgeAdjustment: boolean
  demographicOptionsMap: any
  disabledDemographicOptions?: string[][]
}

const scrollableHashIdMap: Record<string, ScrollableHashId> = {}
for (const [key, value] of Object.entries(reportProviderSteps)) {
  scrollableHashIdMap[value.label] = key as ScrollableHashId
}

export default function ModeSelectorBoxMobile(
  props: ModeSelectorBoxMobileProps
) {
  return (
    <div className="mode-selector-box-mobile">
      <Card raised={true} className={styles.ModeSelectorBoxMobile}>
        <Grid
          container
          justifyContent={{ xs: 'flex-end', sm: 'space-between' }}
        >
          <div>
            <DemographicTypeSelect
              demographicOptionsMap={props.demographicOptionsMap}
              disabledDemographicOptions={props.disabledDemographicOptions}
            />
            <SimpleSelect<MadLibId>
              label="Compare mode"
              optionsMap={MADLIB_MODE_MAP}
              selected={props.trackerMode}
              setSelected={props.setTrackerMode}
            />
            <JumpToSelect
              offerJumpToAgeAdjustment={props.offerJumpToAgeAdjustment}
            />
          </div>

          <TopicInfoModalButton />
        </Grid>
      </Card>
    </div>
  )
}
