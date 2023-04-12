import React, { useState } from 'react'
import { ArrowDropDown, ArrowRight } from '@mui/icons-material'
import Popover, { type PopoverOrigin } from '@mui/material/Popover'
import { usePopover, type PopoverElements } from '../../utils/hooks/usePopover'
import styles from './DropDownMenu.module.scss'
import {
  useMediaQuery,
  useTheme,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import { AGE, type DemographicGroup } from '../../data/utils/Constants'
import {
  type BreakdownVar,
  type BreakdownVarDisplayName,
} from '../../data/query/Breakdowns'
import { useHIVLabelSuffix } from '../../utils/hooks/useHIVLabelSuffix'
import { type VariableId } from '../../data/config/MetricConfig'

interface MenuPopoverProps {
  popover: PopoverElements
  // Map type indicates items are first level menu items, array indicates second level
  items:
    | Record<BreakdownVarDisplayName, DemographicGroup[]>
    | DemographicGroup[]
  onClick: (
    event: React.MouseEvent<HTMLElement>,
    value: DemographicGroup
  ) => void
  // Optional additional actions to do when the popover is closed
  onClose?: () => void
}

export function MenuPopover(props: MenuPopoverProps): JSX.Element {
  // calculate page size for responsive layout
  const theme = useTheme()
  const pageIsWide = useMediaQuery(theme.breakpoints.up('sm'))
  const anchorOrigin: PopoverOrigin = {
    vertical: 'top',
    horizontal: 'right',
  }
  const transformOrigin: PopoverOrigin = {
    vertical: 'top',
    horizontal: pageIsWide ? 'left' : 'center',
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
      return (
        <ListItem key={listItem} button disabled>
          {listItem} [unavailable]
        </ListItem>
      )
    } else {
      return (
        <ListItem
          key={listItem}
          button
          onClick={(event) => {
            props.onClick(event, listItem)
          }}
        >
          <ListItemText primary={listItem} />
          {hasChildren && <ArrowRight />}
        </ListItem>
      )
    }
  }

  return (
    <Popover
      className={styles.GroupListMenuBox}
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
        aria-label="List of Options"
        dense={true}
        className={styles.GroupListMenuBox}
      >
        {listItems.map((listItem) => renderListItem(listItem))}
      </List>
    </Popover>
  )
}

export interface DropDownMenuProps {
  // Dropdown's currently selected option.
  value: DemographicGroup
  // Map of first level menu option to submenu options.
  // If only one key is present, submenu options will render as first level.
  options: Record<string, DemographicGroup[]>
  // Update parent component with a newly selected value.
  onOptionUpdate: (
    category: DemographicGroup | undefined,
    filterSelection: DemographicGroup
  ) => void
  idSuffix?: string
  breakdownVar: BreakdownVar
  variableId: VariableId
  setSmallMultiplesDialogOpen: (smallMultiplesDialogOpen: boolean) => void
}

/*
   DropDownMenu is a dropdown menu with one or two levels of menu items.
   For example you can have:
     * Dropdown with one level listing all race options
     * Dropdown with one level to select race and a second level listing all race options
*/
function DropDownMenu(props: DropDownMenuProps) {
  const [firstMenuSelection, setFirstMenuSelection] = useState(
    Object.keys(props.options)[0]
  )
  const oneLevelMenu = Object.keys(props.options).length === 1

  const firstMenu = usePopover()
  const secondMenu = usePopover()

  const demOption = firstMenuSelection.toLowerCase()
  const article = props.breakdownVar === AGE ? 'an' : 'a'

  const suffix = useHIVLabelSuffix(
    props.breakdownVar,
    props.value,
    props.variableId
  )

  return (
    <div className={styles.SectionFilterBy}>
      <label
        className={styles.FilterBy}
        htmlFor={`groupMenu${props?.idSuffix ?? ''}`}
        aria-hidden={true}
      >
        {`Highlight ${article} ${demOption} group:`}
      </label>
      <Button
        variant="text"
        onClick={firstMenu.open}
        aria-haspopup="true"
        id={`groupMenu${props?.idSuffix ?? ''}`}
      >
        <u>
          {props.value}
          {suffix}
        </u>
        <ArrowDropDown />
      </Button>

      <MenuPopover
        aria-labelledby={`#groupMenu${props?.idSuffix ?? ''}`}
        popover={firstMenu}
        aria-expanded="true"
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
          value: DemographicGroup
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

export default DropDownMenu
