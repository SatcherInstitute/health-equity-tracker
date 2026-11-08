import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import { useRef } from 'react'
import type { DropdownVarId } from '../../data/config/DropDownIds'
import type { DataTypeId } from '../../data/config/MetricConfigTypes'
import HetListBoxOption from '../../styles/HetComponents/HetListBoxOption'
import HetMadLibButton from '../../styles/HetComponents/HetMadLibButton'
import HetPopover from '../../styles/HetComponents/HetPopover'
import { usePopover } from '../../utils/hooks/usePopover'
import { EXPLORE_DATA_PAGE_LINK } from '../../utils/internalRoutes'
import {
  CATEGORIES_LIST,
  DEFAULT,
  type DefaultDropdownVarId,
  DROPDOWN_TOPIC_MAP,
  SELECTED_DROPDOWN_OVERRIDES,
} from '../../utils/MadLibs'

interface TopicSelectorProps {
  newValue: DataTypeId | DefaultDropdownVarId // DataTypeId OR default setting with no topic selected
  onOptionUpdate: (option: string) => void
  phraseSegment: any
}

export default function TopicSelector(props: TopicSelectorProps) {
  const options = Object.entries(props.phraseSegment).sort((a, b) =>
    a[0].localeCompare(b[0]),
  ) as Array<[DropdownVarId, string]>

  const chosenOption = options.find((i) => i[0] === props.newValue)

  // prefer the overrides, use normal name otherwise. fallback to empty string
  const currentDisplayName =
    SELECTED_DROPDOWN_OVERRIDES?.[chosenOption?.[0] as DropdownVarId] ??
    chosenOption?.[1] ??
    ''

  const popoverRef = useRef(null)
  const popover = usePopover()
  const noTopic = props.newValue === DEFAULT
  const dropdownTarget = `${props.newValue}-dropdown-topic`

  return (
    <>
      <span ref={popoverRef}>
        <HetMadLibButton handleClick={popover.open} isOpen={popover.isOpen}>
          <span className={`${dropdownTarget} text-alt-green`}>
            {currentDisplayName}
          </span>
        </HetMadLibButton>

        <HetPopover popover={popover}>
          {/* Condition Topic Dropdown */}
          <menu className='max-w-menu tiny:grid-cols-2 smplus:grid-cols-3 m-6 grid grid-cols-1 gap-2 p-0'>
            {CATEGORIES_LIST.map((category) => {
              return (
                <div key={category.title} className='mb-4'>
                  <h3
                    className='text-alt-black text-small leading-some-more-space sm:text-text m-0 mr-4 mb-1 p-0 font-semibold'
                    aria-label={category.title + ' options'}
                  >
                    {category.title}
                  </h3>
                  <ul className='m-0 p-0'>
                    {category.options.map((optionId: DropdownVarId) => {
                      return (
                        <HetListBoxOption
                          key={optionId}
                          selected={optionId === props.newValue}
                          onClick={() => {
                            popover.close()
                            props.onOptionUpdate(optionId)
                          }}
                          className='pl-1'
                        >
                          {DROPDOWN_TOPIC_MAP[optionId]}
                        </HetListBoxOption>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
            <div className='col-span-full flex w-full justify-end'>
              {!noTopic && (
                <a
                  className='bg-alt-white text-alt-black hover:bg-explore-bg-color no-underline'
                  href={EXPLORE_DATA_PAGE_LINK}
                >
                  <KeyboardBackspaceIcon className='text-alt-black text-small pb-0.75' />{' '}
                  <span className='text-alt-black text-smallest p-1'>
                    Clear selections
                  </span>
                </a>
              )}
            </div>
          </menu>
        </HetPopover>
      </span>
    </>
  )
}
