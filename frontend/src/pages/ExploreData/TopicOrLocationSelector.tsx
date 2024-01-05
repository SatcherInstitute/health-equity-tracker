import { useRef } from 'react'
import { Fips, isFipsString } from '../../data/utils/Fips'
import { usePopover } from '../../utils/hooks/usePopover'
import {
  CATEGORIES_LIST,
  DEFAULT,
  SELECTED_DROPDOWN_OVERRIDES,
  type DefaultDropdownVarId,
  DROPDOWN_TOPIC_MAP,
} from '../../utils/MadLibs'
import {
  type DropdownVarId,
  type DataTypeId,
} from '../../data/config/MetricConfig'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import { EXPLORE_DATA_PAGE_LINK } from '../../utils/internalRoutes'
import HetMadLibButton from '../../styles/HetComponents/HetMadLibButton'
import HetListItemButton from '../../styles/HetComponents/HetListItemButton'
import HetPopover from '../../styles/HetComponents/HetPopover'
import HetLocationSearch from '../../styles/HetComponents/HetLocationSearch'

interface TopicOrLocationSelectorProps {
  value: DataTypeId | string | DefaultDropdownVarId // DataTypeId OR fips as string OR default setting with no topic selected
  options: Fips[] | string[][]
  onOptionUpdate: (option: string) => void
}

export default function TopicOrLocationSelector(
  props: TopicOrLocationSelectorProps
) {
  const newValue: any | DataTypeId | string | DefaultDropdownVarId = props.value
  const isFips = isFipsString(newValue)
  let currentDisplayName
  if (isFips) {
    currentDisplayName = new Fips(newValue).getFullDisplayName()
  } else {
    const chosenOption = (props.options as string[][]).find(
      (i: string[]) => i[0] === newValue
    )
    // prefer the overrides, use normal name otherwise. fallback to empty string
    currentDisplayName =
      SELECTED_DROPDOWN_OVERRIDES?.[chosenOption?.[0] as DropdownVarId] ??
      chosenOption?.[1] ??
      ''
  }

  const popoverRef = useRef(null)
  const popover = usePopover()
  const noTopic = props.value === DEFAULT

  const dropdownTarget = `${props.value}-dropdown-${isFips ? 'fips' : 'topic'}`

  return (
    <>
      <span ref={popoverRef}>
        <HetMadLibButton handleClick={popover.open} isOpen={popover.isOpen}>
          <span className={dropdownTarget}>{currentDisplayName}</span>
        </HetMadLibButton>

        <HetPopover popover={popover}>
          {/* Location Dropdown */}
          {isFips && (
            <HetLocationSearch
              value={props.value}
              onOptionUpdate={props.onOptionUpdate}
              popover={popover}
              options={props.options as Fips[]}
            />
          )}
          {/* Condition Dropdown */}
          {!isFips && (
            <>
              <menu className='m-5 grid grid-cols-1 gap-5 tiny:grid-cols-2 lg:grid-cols-3'>
                {CATEGORIES_LIST.map((category) => {
                  return (
                    <div key={category.title} className='mb-4'>
                      <h3
                        className='m-0 mr-4 p-0 text-small font-bold sm:text-text'
                        aria-label={category.title + ' options'}
                      >
                        {category.title}
                      </h3>
                      <ul className='m-0 pl-0'>
                        {category.options.map((optionId: DropdownVarId) => {
                          return (
                            <HetListItemButton
                              key={optionId}
                              selected={optionId === props.value}
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
                <div className='flex w-full items-end justify-end'>
                  {!noTopic && (
                    <a
                      className='no-underline hover:bg-standardInfo'
                      href={EXPLORE_DATA_PAGE_LINK}
                    >
                      <KeyboardBackspaceIcon
                        style={{
                          fontSize: 'small',
                          paddingBottom: '3px',
                        }}
                      />{' '}
                      <span className='p-1 text-smallest'>
                        Clear selections
                      </span>
                    </a>
                  )}
                </div>
              </menu>
            </>
          )}
        </HetPopover>
      </span>
    </>
  )
}
