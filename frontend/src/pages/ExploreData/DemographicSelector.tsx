import { useRef } from 'react'
import {
  DEMOGRAPHIC_DISPLAY_TYPES,
  type DemographicType,
} from '../../data/query/Breakdowns'
import HetListItemButton from '../../styles/HetComponents/HetListItemButton'
import HetMadLibButton from '../../styles/HetComponents/HetMadLibButton'
import HetPopover from '../../styles/HetComponents/HetPopover'
import { useParamState } from '../../utils/hooks/useParamState'
import { usePopover } from '../../utils/hooks/usePopover'
import { DEMOGRAPHIC_PARAM } from '../../utils/urlutils'

interface DemographicSelectorProps {
  newValue: DemographicType
  options: Array<[DemographicType, string]>
}

export default function DemographicSelector(props: DemographicSelectorProps) {
  const defaultDemo: DemographicType = props.options[0][0]

  const [demographicType, setDemographicType] = useParamState<DemographicType>(
    DEMOGRAPHIC_PARAM,
    defaultDemo,
  )

  const currentDisplayName = DEMOGRAPHIC_DISPLAY_TYPES[demographicType]
  const popoverRef = useRef(null)
  const popover = usePopover()

  return (
    <>
      <span ref={popoverRef}>
        <HetMadLibButton isOpen={popover.isOpen} handleClick={popover.open}>
          {currentDisplayName}
        </HetMadLibButton>

        <HetPopover popover={popover}>
          {/* Demographic Dropdown */}
          <>
            <menu className='m-3 flex p-5'>
              <ul className='m-0 pl-0'>
                {props.options.map((item: string[]) => {
                  const [optionId, optionDisplayName] = item
                  return (
                    <HetListItemButton
                      key={optionId}
                      selected={optionId === props.newValue}
                      onClick={() => {
                        popover.close()
                        setDemographicType(optionId as DemographicType)
                      }}
                      option='topicOption'
                    >
                      {optionDisplayName}
                    </HetListItemButton>
                  )
                })}
              </ul>
            </menu>
          </>
        </HetPopover>
      </span>
    </>
  )
}
