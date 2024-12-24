import { useRef } from 'react'
import HetListBoxOption from '../../styles/HetComponents/HetListBoxOption'
import HetMadLibButton from '../../styles/HetComponents/HetMadLibButton'
import HetPopover from '../../styles/HetComponents/HetPopover'
import { usePopover } from '../../utils/hooks/usePopover'

interface BaseSelectorProps<T extends string> {
  options: Array<[T, string]>
  selectedValue: T
  onSelect: (value: T) => void
  buttonClassName?: string
}

export default function BaseSelector<T extends string>({
  options,
  selectedValue,
  onSelect,
  buttonClassName = '',
}: BaseSelectorProps<T>) {
  const currentOption = options.find(([value]) => value === selectedValue)
  const currentDisplayName = currentOption ? currentOption[1] : ''
  const popoverRef = useRef(null)
  const popover = usePopover()

  return (
    <>
      <span ref={popoverRef}>
        <HetMadLibButton
          className={buttonClassName}
          isOpen={popover.isOpen}
          handleClick={popover.open}
        >
          {currentDisplayName}
        </HetMadLibButton>

        <HetPopover popover={popover}>
          <div className='m-0 flex p-0'>
            <menu className='m-0 px-0 py-2'>
              {options.map(([optionId, optionDisplayName]) => (
                <HetListBoxOption
                  key={optionId}
                  selected={optionId === selectedValue}
                  onClick={() => {
                    popover.close()
                    onSelect(optionId)
                  }}
                  className='mr-auto ml-6 p-6 text-left'
                >
                  {optionDisplayName}
                </HetListBoxOption>
              ))}
            </menu>
          </div>
        </HetPopover>
      </span>
    </>
  )
}
