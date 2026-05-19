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
  const isTiny = useIsBreakpointAndUp('tiny')
  const selectMinWidth = isTiny ? 110 : 80

  return (
    <div className='mode-selector-box-mobile m-2 flex items-center justify-between rounded-sm bg-alt-white p-2 shadow-raised md:hidden'>
      <div className='flex items-center gap-2'>
        <SimpleSelect<MadLibId>
          label={isTiny ? 'Compare mode' : 'Mode'}
          minWidth={selectMinWidth}
          optionsMap={MADLIB_MODE_MAP}
          selected={props.trackerMode}
          setSelected={props.setTrackerMode}
        />
        <JumpToSelect
          offerJumpToAgeAdjustment={props.offerJumpToAgeAdjustment}
          label={isTiny ? 'Jump to' : 'Jump'}
          minWidth={selectMinWidth}
        />
      </div>
      {props.showInsightsButton && (
        <div className='ml-2 shrink-0'>
          <InsightReportButton
            variant='outlined'
            label={isTiny ? undefined : 'Insights'}
          />
        </div>
      )}
    </div>
  )
}
