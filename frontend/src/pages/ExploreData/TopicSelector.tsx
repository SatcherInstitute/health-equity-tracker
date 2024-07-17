import { useRef } from 'react';
import { usePopover } from '../../utils/hooks/usePopover';
import {
  CATEGORIES_LIST,
  DEFAULT,
  SELECTED_DROPDOWN_OVERRIDES,
  type DefaultDropdownVarId,
  DROPDOWN_TOPIC_MAP,
} from '../../utils/MadLibs';
import {
  type DropdownVarId,
  type DataTypeId,
} from '../../data/config/MetricConfig';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { EXPLORE_DATA_PAGE_LINK } from '../../utils/internalRoutes';
import HetMadLibButton from '../../styles/HetComponents/HetMadLibButton';
import HetListItemButton from '../../styles/HetComponents/HetListItemButton';
import HetPopover from '../../styles/HetComponents/HetPopover';

interface TopicSelectorProps {
  newValue: DataTypeId | DefaultDropdownVarId; // DataTypeId OR default setting with no topic selected
  onOptionUpdate: (option: string) => void;
  phraseSegment: any;
}

export default function TopicSelector(props: TopicSelectorProps) {
  const options = Object.entries(props.phraseSegment).sort((a, b) =>
    a[0].localeCompare(b[0])
  ) as Array<[DropdownVarId, string]>;

  const chosenOption = options.find((i) => i[0] === props.newValue);

  // prefer the overrides, use normal name otherwise. fallback to empty string
  const currentDisplayName =
    SELECTED_DROPDOWN_OVERRIDES?.[chosenOption?.[0] as DropdownVarId] ??
    chosenOption?.[1] ??
    '';

  const popoverRef = useRef(null);
  const popover = usePopover();
  const noTopic = props.newValue === DEFAULT;
  const dropdownTarget = `${props.newValue}-dropdown-topic`;

  // Accessible colors
  const accessibleTextColor = '#000000'; // Black text
  const accessibleBackgroundColor = '#FFFFFF'; // White background
  const accessibleHoverColor = '#004085'; // Dark blue for hover state
  const accessibleBorderColor = '#0056b3'; // Blue for borders

  return (
    <>
      <span ref={popoverRef}>
        <HetMadLibButton handleClick={popover.open} isOpen={popover.isOpen}>
          <span className={dropdownTarget} style={{ color: accessibleTextColor }}>
            {currentDisplayName}
          </span>
        </HetMadLibButton>

        <HetPopover popover={popover}>
          {/* Condition Topic Dropdown */}
          <menu className="m-6 grid max-w-md grid-cols-1 gap-4 p-0 tiny:grid-cols-2 smMd:grid-cols-3">
            {CATEGORIES_LIST.map((category) => {
              return (
                <div key={category.title} className="mb-4">
                  <h3
                    className="m-0 mb-1 mr-4 p-0 text-small font-semibold leading-lhSomeMoreSpace sm:text-text"
                    aria-label={category.title + ' options'}
                    style={{ color: accessibleTextColor }}
                  >
                    {category.title}
                  </h3>
                  <ul className="m-0 p-0">
                    {category.options.map((optionId: DropdownVarId) => {
                      return (
                        <HetListItemButton
                          key={optionId}
                          selected={optionId === props.newValue}
                          onClick={() => {
                            popover.close();
                            props.onOptionUpdate(optionId);
                          }}
                          option="topicOption"
                          style={{
                            color: accessibleTextColor,
                            backgroundColor: accessibleBackgroundColor,
                            border: `1px solid ${accessibleBorderColor}`,
                          }}
                          hoverStyle={{
                            backgroundColor: accessibleHoverColor,
                            color: accessibleBackgroundColor,
                          }}
                        >
                          {DROPDOWN_TOPIC_MAP[optionId]}
                        </HetListItemButton>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
            <div className="col-span-full flex w-full justify-end">
              {!noTopic && (
                <a
                  className="no-underline hover:bg-standardInfo"
                  href={EXPLORE_DATA_PAGE_LINK}
                  style={{
                    color: accessibleTextColor,
                    backgroundColor: accessibleBackgroundColor,
                  }}
                >
                  <KeyboardBackspaceIcon
                    style={{
                      fontSize: 'small',
                      paddingBottom: '3px',
                      color: accessibleTextColor,
                    }}
                  />{' '}
                  <span className="p-1 text-smallest" style={{ color: accessibleTextColor }}>
                    Clear selections
                  </span>
                </a>
              )}
            </div>
          </menu>
        </HetPopover>
      </span>
    </>
  );
}