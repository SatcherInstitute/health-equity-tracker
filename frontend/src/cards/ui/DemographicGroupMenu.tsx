import { ArrowDropDown, ArrowRight } from '@mui/icons-material'
import {
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material'
import Popover, { type PopoverOrigin } from '@mui/material/Popover'
import type React from 'react'
import { useState } from 'react'
import type { DataTypeId } from '../../data/config/MetricConfigTypes'
import type {
  DemographicType,
  DemographicTypeDisplayName,
} from '../../data/query/Breakdowns'
import type { DemographicGroup } from '../../data/utils/Constants'
import { getConfigFromDataTypeId } from '../../utils/MadLibs'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { type PopoverElements, usePopover } from '../../utils/hooks/usePopover'

interface MenuPopoverProps {
  popover: PopoverElements
  // Map type indicates items are first level menu items, array indicates second level
  items:
    | Record<DemographicTypeDisplayName, DemographicGroup[]>
    | DemographicGroup[]
  onClick: (
    event: React.MouseEvent<HTMLElement>,
    value: DemographicGroup,
  ) => void
  // Optional additional actions to do when the popover is closed
  onClose?: () => void
}

function MenuPopover(props: MenuPopoverProps): JSX.Element {
  // calculate page size for responsive layout
  const isSm = useIsBreakpointAndUp('sm')
  const anchorOrigin: PopoverOrigin = {
    vertical: 'top',
    horizontal: 'right',
  }
  const transformOrigin: PopoverOrigin = {
    vertical: 'top',
    horizontal: isSm ? 'left' : 'center',
  }

  const hasChildren = !Array.isArray(props.items)
  const listItems: DemographicGroup[] | string[] = hasChildren
    ? Object.keys(props.items)
    : (props.items as DemographicGroup[])

  const renderListItem = (listItem: string | DemographicGroup) => {
    if (
      hasChildren &&
      (props.items as Record<string, DemographicGroup[]>)[listItem].length === 0
    ) {
      return <ListItem key={listItem}>{listItem} [unavailable]</ListItem>
    } else {
      return (
        <ListItemButton
          key={listItem}
          onClick={(event) => {
            props.onClick(event, listItem)
          }}
        >
          <ListItemText primary={listItem} />
          {hasChildren && <ArrowRight />}
        </ListItemButton>
      )
    }
  }

  return (
    <Popover
      className=' w-auto max-w-[95vw] overflow-x-auto p-4'
      open={props.popover.isOpen}
      anchorEl={props.popover.anchor}
      onClose={() => {
        props.popover.close()
        if (props.onClose) {
          props.onClose()
        }
      }}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
    >
      <List
        aria-label='List of Options'
        dense={true}
        className=' w-auto max-w-[95vw] overflow-x-auto p-4'
      >
        {listItems.map((listItem) => renderListItem(listItem))}
      </List>
    </Popover>
  )
}

interface DemographicGroupMenuProps {
  // Dropdown's currently selected option.
  value: DemographicGroup
  // Map of first level menu option to submenu options.
  // If only one key is present, submenu options will render as first level.
  options: Record<string, DemographicGroup[]>
  // Update parent component with a newly selected value.
  onOptionUpdate: (
    category: DemographicGroup | undefined,
    filterSelection: DemographicGroup,
  ) => void
  idSuffix?: string
  demographicType: DemographicType
  dataTypeId: DataTypeId
  setMultimapOpen: (multimapOpen: boolean) => void
}

/*
   DemographicGroupMenu is a dropdown menu with one or two levels of menu items.
   For example you can have:
     * Dropdown with one level listing all race options
     * Dropdown with one level to select race and a second level listing all race options
*/
function DemographicGroupMenu(props: DemographicGroupMenuProps) {
  const [firstMenuSelection, setFirstMenuSelection] = useState(
    Object.keys(props.options)[0],
  )
  const oneLevelMenu = Object.keys(props.options).length === 1

  const firstMenu = usePopover()
  const secondMenu = usePopover()

  const demOption = firstMenuSelection

  const selectedConfig = getConfigFromDataTypeId(props.dataTypeId)
  const ageSubPop = selectedConfig?.ageSubPopulationLabel ?? ''
  const suffix =
    props.value === 'All' && props.demographicType === 'age' && ageSubPop
      ? ` (${ageSubPop.replace('Ages ', '')})`
      : ''

  return (
    <div className='flex'>
      <label
        className='flex items-center px-2 py-[6px] text-small'
        htmlFor={`groupMenu${props?.idSuffix ?? ''}`}
        aria-hidden={true}
      >
        {demOption}:
      </label>
      <Button
        variant='text'
        onClick={firstMenu.open}
        aria-haspopup='true'
        id={`groupMenu${props?.idSuffix ?? ''}`}
        className='text-small underline'
      >
        {props.value}
        {suffix}

        <ArrowDropDown
          sx={{
            mb: '2px',
          }}
        />
      </Button>

      <MenuPopover
        aria-labelledby={`#groupMenu${props?.idSuffix ?? ''}`}
        popover={firstMenu}
        aria-expanded='true'
        items={oneLevelMenu ? Object.values(props.options)[0] : props.options}
        onClick={(event: React.MouseEvent<HTMLElement>, value) => {
          if (oneLevelMenu) {
            props.onOptionUpdate(undefined, value)
            firstMenu.close()
          } else {
            setFirstMenuSelection(value)
            secondMenu.open(event)
          }
        }}
      />

      {/* sub-menu feature: not currently in use */}
      <MenuPopover
        popover={secondMenu}
        items={props.options[firstMenuSelection]}
        onClick={(
          _unusedEvent: React.MouseEvent<HTMLElement>,
          value: DemographicGroup,
        ) => {
          firstMenu.close()
          secondMenu.close()
          props.onOptionUpdate(firstMenuSelection, value)
        }}
        onClose={firstMenu.close}
      />
    </div>
  )
}

export default DemographicGroupMenu
