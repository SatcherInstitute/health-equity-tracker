import { useRef } from 'react'
import type { DataTypeId } from '../../data/config/MetricConfigTypes'
import HetListItemButton from '../../styles/HetComponents/HetListItemButton'
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
                        props.onOptionUpdate(optionId)
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
