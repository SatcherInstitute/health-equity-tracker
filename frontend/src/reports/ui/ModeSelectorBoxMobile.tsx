import { Card, Grid } from '@mui/material'
import styles from './ModeSelectorBoxMobile.module.scss'
import { MADLIB_MODE_MAP, type MadLibId } from '../../utils/MadLibs'
import { type DemographicType } from '../../data/query/Breakdowns'
import SimpleSelect from '../../pages/ui/SimpleSelect'
import { type ScrollableHashId } from '../../utils/hooks/useStepObserver'
import { reportProviderSteps } from '../ReportProviderSteps'
import JumpToSelect from '../../pages/ui/JumpToSelect'
import TopicInfoModalButton from '../../pages/ui/TopicInfoModalButton'

interface ModeSelectorBoxMobileProps {
  trackerMode: MadLibId
  setTrackerMode: React.Dispatch<React.SetStateAction<MadLibId>>
  demographicType: DemographicType
  setDemographicType: (demographic: DemographicType) => void
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
            <SimpleSelect<DemographicType>
              label="Demographic"
              optionsMap={props.demographicOptionsMap}
              disabledOptions={props.disabledDemographicOptions}
              selected={props.demographicType}
              setSelected={props.setDemographicType}
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
