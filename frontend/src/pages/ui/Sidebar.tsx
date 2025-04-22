import type { DemographicType } from '../../data/query/Breakdowns'
import { MADLIB_MODE_MAP, type MadLibId } from '../../utils/MadLibs'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import SimpleSelect from './SimpleSelect'
import TableOfContents from './TableOfContents'
import TopicInfoModalButton from './TopicInfoModalButton'

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
  demographicType: DemographicType
  setDemographicType: (demographic: DemographicType) => void
  isRaceBySex?: boolean
  enabledDemographicOptionsMap: any
  disabledDemographicOptions?: string[][]
}

export default function Sidebar(props: SidebarProps) {
  const tocOffset = (props.floatTopOffset ?? 0) + TABLE_OF_CONTENT_PADDING

  return (
    <>
      <div className='sticky' style={{ top: tocOffset }}>
        <div className='rounded-sm bg-white shadow-raised md:m-cardGutter md:flex md:w-90p md:flex-col md:justify-center md:p-2'>
          <TopicInfoModalButton />
        </div>

        <div className='mode-selector-box'>
          <div className='rounded-sm bg-white shadow-raised md:m-cardGutter md:flex md:w-90p md:flex-col md:justify-center md:px-2 md:py-4'>
            <SimpleSelect<MadLibId>
              label='Compare mode'
              optionsMap={MADLIB_MODE_MAP}
              selected={props.trackerMode}
              setSelected={props.setTrackerMode}
            />
          </div>
        </div>

        <nav
          className='m-cardGutter flex w-90p justify-center rounded-sm bg-white py-4 shadow-raised'
          aria-label='page contents navigation'
        >
          <TableOfContents
            reportStepHashIds={props.reportStepHashIds}
            isScrolledToTop={props.isScrolledToTop ?? false}
          />
        </nav>
      </div>
    </>
  )
}
