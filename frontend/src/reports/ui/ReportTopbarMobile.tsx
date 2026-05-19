import InsightReportButton from '../../pages/ui/InsightReportButton'
import JumpToSelect from '../../pages/ui/JumpToSelect'
import SimpleSelect from '../../pages/ui/SimpleSelect'
import { MADLIB_MODE_MAP, type MadLibId } from '../../utils/MadLibs'

interface ReportTopbarMobileProps {
  trackerMode: MadLibId
  setTrackerMode: React.Dispatch<React.SetStateAction<MadLibId>>
  offerJumpToAgeAdjustment: boolean
  enabledDemographicOptionsMap: any
  disabledDemographicOptions?: string[][]
  showInsightsButton?: boolean
}

export default function ReportTopbarMobile(props: ReportTopbarMobileProps) {
  return (
    <div className='mode-selector-box-mobile m-2 flex items-center justify-between rounded-sm bg-alt-white p-2 shadow-raised md:hidden'>
      <div className='flex shrink items-center overflow-hidden'>
        <SimpleSelect<MadLibId>
          label='Mode'
          minWidth={80}
          optionsMap={MADLIB_MODE_MAP}
          selected={props.trackerMode}
          setSelected={props.setTrackerMode}
        />
        <JumpToSelect
          offerJumpToAgeAdjustment={props.offerJumpToAgeAdjustment}
          label='Jump'
          minWidth={80}
        />
      </div>
      {props.showInsightsButton && (
        <div className='shrink-0'>
          <InsightReportButton variant='outlined' label='Insights' />
        </div>
      )}
    </div>
  )
}
