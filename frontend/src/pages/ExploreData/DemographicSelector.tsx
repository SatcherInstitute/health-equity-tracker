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
            <div className='m-0 flex p-0'>
              <menu className='m-0 px-0 py-2'>
                {props.options.map((item: string[]) => {
                  const [optionId, optionDisplayName] = item

                  return (
                    <HetListBoxOption
                      key={optionId}
                      selected={optionId === demographicType}
                      onClick={() => {
                        popover.close()
                        setDemographicType(optionId as DemographicType)
                      }}
                      className='mr-auto ml-6 p-6 text-left'
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
