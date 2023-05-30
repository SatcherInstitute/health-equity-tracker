import {
  useRef,
  // useState
} from 'react'
import ArrowDropUp from '@mui/icons-material/ArrowDropUp'
import ArrowDropDown from '@mui/icons-material/ArrowDropDown'
import styles from './OptionsSelector.module.scss'
import { usePopover } from '../../utils/hooks/usePopover'
import {
  Box,
  Grid,
  ListItemText,
  ListItemButton,
  List,
  Button,
  Popover,
} from '@mui/material'
import { type DataTypeId } from '../../data/config/MetricConfig'

interface DataTypeOptionsSelectorProps {
  value: DataTypeId // DataTypeId OR fips as string OR default setting with no topic selected
  options: string[][]
  onOptionUpdate: (option: string) => void
}

export default function DataTypeOptionsSelector(
  props: DataTypeOptionsSelectorProps
) {
  const chosenOption = props.options.find((i: string[]) => i[0] === props.value)
  const currentDisplayName = chosenOption ? chosenOption[1] : ''
  const popoverRef = useRef(null)
  const popover = usePopover()
  const anchorO = 'bottom'
  const transformO = 'top'
  const dropdownTarget = `${props.value}-dropdown-datatype`

  return (
    <>
      <span ref={popoverRef}>
        {/* Clickable Madlib Button with Dropdown Arrow */}
        <Button
          variant="text"
          aria-haspopup="true"
          className={styles.MadLibButton}
          onClick={popover.open}
        >
          <span className={dropdownTarget}>
            {currentDisplayName}{' '}
            {popover.isOpen ? <ArrowDropUp /> : <ArrowDropDown />}
          </span>
        </Button>

        <Popover
          id="popoverBox"
          className={styles.PopoverOverride}
          aria-expanded="true"
          open={popover.isOpen}
          anchorEl={popover.anchor}
          onClose={popover.close}
          anchorOrigin={{
            vertical: anchorO,
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: transformO,
            horizontal: 'center',
          }}
        >
          <>
            <Box my={3} mx={3}>
              <Grid container>
                <List dense={true} role="menu">
                  {props.options.map((item: string[]) => {
                    const [optionId, optionDisplayName] = item
                    return (
                      <ListItemButton
                        role="menuitem"
                        className={styles.ListItem}
                        key={optionId}
                        selected={optionId === props.value}
                        onClick={() => {
                          popover.close()
                          props.onOptionUpdate(optionId)
                        }}
                      >
                        <ListItemText
                          className={styles.ListItemText}
                          primary={optionDisplayName}
                        />
                      </ListItemButton>
                    )
                  })}
                </List>
              </Grid>
            </Box>
          </>
        </Popover>
      </span>
    </>
  )
}
