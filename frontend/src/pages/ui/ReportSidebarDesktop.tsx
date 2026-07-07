import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import { MADLIB_MODE_MAP, type MadLibId } from '../../utils/MadLibs'
import InsightReportButton from './InsightReportButton'
import SimpleSelect from './SimpleSelect'
import TableOfContents from './TableOfContents'
import TopicInfoModalButton from './TopicInfoModalButton'

const TABLE_OF_CONTENT_PADDING = 15

interface ReportSidebarDesktopProps {
  reportStepHashIds: ScrollableHashId[]
  floatTopOffset?: number
  isScrolledToTop?: boolean
  reportTitle: string
  isMobile: boolean
  trackerMode: MadLibId
  setTrackerMode: React.Dispatch<React.SetStateAction<MadLibId>>
  isRaceBySex?: boolean
  enabledDemographicOptionsMap: any
  disabledDemographicOptions?: string[][]
  showInsightsButton?: boolean
}

function SidebarCard({ children }: { children: React.ReactNode }) {
  return (
    <div className='rounded-sm bg-alt-white shadow-raised md:m-card-gutter md:flex md:w-90p md:flex-col md:justify-center md:p-2'>
      {children}
    </div>
  )
}

export default function ReportSidebarDesktop(props: ReportSidebarDesktopProps) {
  const tocOffset = (props.floatTopOffset ?? 0) + TABLE_OF_CONTENT_PADDING

  return (
    <>
      <div className='sticky' style={{ top: tocOffset }}>
        {props.showInsightsButton && (
          <SidebarCard>
            <InsightReportButton />
          </SidebarCard>
        )}
        <SidebarCard>
          <TopicInfoModalButton />
        </SidebarCard>
        <div className='mode-selector-box'>
          <SidebarCard>
            <SimpleSelect<MadLibId>
              label='Compare mode'
              optionsMap={MADLIB_MODE_MAP}
              selected={props.trackerMode}
              setSelected={props.setTrackerMode}
            />
          </SidebarCard>
        </div>
        <SidebarCard>
          <TableOfContents
            reportStepHashIds={props.reportStepHashIds}
            isScrolledToTop={props.isScrolledToTop ?? false}
          />
        </SidebarCard>
      </div>
    </>
  )
}
