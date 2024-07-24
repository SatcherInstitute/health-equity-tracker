import { useRef } from 'react'
import { usePopover } from '../../utils/hooks/usePopover'
import {
  CATEGORIES_LIST,
  DEFAULT,
  SELECTED_DROPDOWN_OVERRIDES,
  type DefaultDropdownVarId,
  DROPDOWN_TOPIC_MAP,
} from '../../utils/MadLibs'
import type { DropdownVarId, DataTypeId } from '../../data/config/MetricConfig'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import { EXPLORE_DATA_PAGE_LINK } from '../../utils/internalRoutes'
import HetMadLibButton from '../../styles/HetComponents/HetMadLibButton'
import HetListItemButton from '../../styles/HetComponents/HetListItemButton'
import HetPopover from '../../styles/HetComponents/HetPopover'

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
          <span className={dropdownTarget + ' text-altGreen'}>
            {currentDisplayName}
          </span>
        </HetMadLibButton>

        <HetPopover popover={popover}>
          {/* Condition Topic Dropdown */}
          <menu className='m-6 grid max-w-md grid-cols-1 gap-4 p-0 tiny:grid-cols-2 smMd:grid-cols-3'>
            {CATEGORIES_LIST.map((category) => {
              return (
                <div key={category.title} className='mb-4'>
                  <h3
                    className='m-0 mb-1 mr-4 p-0 text-small font-semibold leading-lhSomeMoreSpace sm:text-text text-black'
                    aria-label={category.title + ' options'}
                  >
                    {category.title}
                  </h3>
                  <ul className='m-0 p-0'>
                    {category.options.map((optionId: DropdownVarId) => {
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
                          {DROPDOWN_TOPIC_MAP[optionId]}
                        </HetListItemButton>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
            <div className='col-span-full flex w-full justify-end'>
              {!noTopic && (
                <a
                  className='no-underline hover:bg-standardInfo text-black bg-white'
                  href={EXPLORE_DATA_PAGE_LINK}
                >
                  <KeyboardBackspaceIcon className='text-black text-small pb-[3px]' />{' '}
                  <span className='p-1 text-smallest text-black'>
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
