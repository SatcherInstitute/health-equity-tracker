import InsightReportButton from '../../pages/ui/InsightReportButton'
import JumpToSelect from '../../pages/ui/JumpToSelect'
import SimpleSelect from '../../pages/ui/SimpleSelect'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
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
  const isTinyAndUp = useIsBreakpointAndUp('tiny')
  const isSmAndUp = useIsBreakpointAndUp('sm')
  const selectMinWidth = isSmAndUp ? 110 : isTinyAndUp ? 80 : 60
  const insightLabel = isSmAndUp ? undefined : ''

  return (
    <div className='mode-selector-box-mobile m-2 flex items-center justify-between rounded-sm bg-alt-white p-2 shadow-raised md:hidden'>
      <div className='flex items-center gap-2'>
        <SimpleSelect<MadLibId>
          label={isSmAndUp ? 'Compare mode' : 'Compare'}
          minWidth={selectMinWidth}
          optionsMap={MADLIB_MODE_MAP}
          selected={props.trackerMode}
          setSelected={props.setTrackerMode}
        />
        <JumpToSelect
          offerJumpToAgeAdjustment={props.offerJumpToAgeAdjustment}
          label={'Jump to'}
          minWidth={selectMinWidth}
        />
      </div>
      {props.showInsightsButton && (
        <div className='mb-2 ml-2 shrink-0 sm:m-0'>
          <InsightReportButton
            variant={isSmAndUp ? 'outlined' : 'text'}
            label={insightLabel}
          />
        </div>
      )}
    </div>
  )
}
