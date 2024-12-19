import { useRef } from 'react'
import type { DataTypeId } from '../../data/config/MetricConfigTypes'
import HetListBoxOption from '../../styles/HetComponents/HetListBoxOption'
import HetMadLibButton from '../../styles/HetComponents/HetMadLibButton'
import HetPopover from '../../styles/HetComponents/HetPopover'
import { usePopover } from '../../utils/hooks/usePopover'

interface DataTypeSelectorProps {
  newValue: DataTypeId
  options: Array<[DataTypeId, string]>
  onOptionUpdate: (option: string) => void
}

export default function DataTypeSelector(props: DataTypeSelectorProps) {
  const chosenOption = props.options.find(
    (i: string[]) => i[0] === props.newValue,
  )
  const currentDisplayName = chosenOption ? chosenOption[1] : ''
  const popoverRef = useRef(null)
  const popover = usePopover()

  return (
    <>
      <span ref={popoverRef}>
        <HetMadLibButton
          className='ml-0'
          isOpen={popover.isOpen}
          handleClick={popover.open}
        >
          {currentDisplayName}
        </HetMadLibButton>

        <HetPopover popover={popover}>
          {/* DataType SubTopic Dropdown */}
          <>
          <div className='m-0 flex p-0'>
          <menu className='m-0 px-0 py-2'>
                {props.options.map((item: string[]) => {
                  const [optionId, optionDisplayName] = item
                  return (
                    <HetListBoxOption
                      key={optionId}
                      selected={optionId === props.newValue}
                      onClick={() => {
                        popover.close()
                        props.onOptionUpdate(optionId)
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
