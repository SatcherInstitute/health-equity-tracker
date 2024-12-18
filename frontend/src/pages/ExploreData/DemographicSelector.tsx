import { useRef } from 'react'
import {
  DEMOGRAPHIC_DISPLAY_TYPES,
  type DemographicType,
} from '../../data/query/Breakdowns'
import HetListBoxOption from '../../styles/HetComponents/HetListBoxOption'
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
            <div className='m-3 flex p-5'>
              <menu className='m-0 pl-0'>
                {props.options.map((item: string[]) => {
                  const [optionId, optionDisplayName] = item
                  return (
                    <HetListBoxOption
                      key={optionId}
                      selected={optionId === props.newValue}
                      onClick={() => {
                        popover.close()
                        setDemographicType(optionId as DemographicType)
                      }}
                    >
                      {optionDisplayName}
                    </HetListBoxOption>
                  )
                })}
              </menu>
            </div>
          </>
        </HetPopover>
      </span>
    </>
  )
}
