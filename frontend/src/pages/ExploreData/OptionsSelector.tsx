import React, { useRef, useState } from 'react'
import ArrowDropUp from '@mui/icons-material/ArrowDropUp'
import ArrowDropDown from '@mui/icons-material/ArrowDropDown'
import { Fips, USA_DISPLAY_NAME, USA_FIPS } from '../../data/utils/Fips'
import styles from './OptionsSelector.module.scss'
import { usePopover } from '../../utils/hooks/usePopover'
import {
  CATEGORIES_LIST,
  DEFAULT,
  type DefaultDropdownVarId,
} from '../../utils/MadLibs'
import {
  Box,
  Grid,
  ListItemText,
  ListItem,
  List,
  Button,
  Popover,
  Autocomplete,
  TextField,
} from '@mui/material'
import {
  type DropdownVarId,
  type VariableId,
} from '../../data/config/MetricConfig'
import { usePrefersReducedMotion } from '../../utils/hooks/usePrefersReducedMotion'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

function OptionsSelector(props: {
  value: VariableId | string | DefaultDropdownVarId // condition data type OR fips as string OR default setting with no topic selected
  options: Fips[] | string[][]
  onOptionUpdate: (option: string) => void
}) {
  const isFips = !!(props.options[0] && props.options[0] instanceof Fips)
  let currentDisplayName
  if (isFips) {
    currentDisplayName = new Fips(props.value).getFullDisplayName()
  } else {
    const chosenOption = (props.options as string[][]).find(
      (i: string[]) => i[0] === props.value
    )
    currentDisplayName = chosenOption ? chosenOption[1] : ''
  }

  const popoverRef = useRef(null)
  const popover = usePopover()

  const [, setTextBoxValue] = useState('')
  const updateTextBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextBoxValue(event.target.value)
  }

  const [autoCompleteOpen, setAutoCompleteOpen] = useState(false)
  const openAutoComplete = () => {
    setAutoCompleteOpen(true)
  }

  const closeAutoComplete = () => {
    setAutoCompleteOpen(false)
  }

  function getGroupName(option: Fips): string {
    if (option.isUsa()) return 'National'
    if (option.isState()) return 'States'
    if (option.isTerritory()) return 'Territories'
    return `${option.getParentFips().getDisplayName()} ${
      option.getParentFips().isTerritory() ? ' County Equivalents' : ' Counties'
    }`
  }

  const anchorO = 'bottom'
  const transformO = 'top'

  const noTopic = props.value === DEFAULT

  // only pulse the condition button when no topic is selected and dropdown menu is closed (and user hasn't set their machine to prefer reduced motion)
  const prefersReducedMotion = usePrefersReducedMotion()
  const doPulse = !prefersReducedMotion && !isFips && noTopic && !popover.isOpen

  const dropdownId = `${props.value}-dropdown-${isFips ? 'fips' : 'topic'}`

  function handleUsaButton() {
    props.onOptionUpdate(USA_FIPS)
    popover.close()
  }

  const isUsa = props.value === '00'

  return (
    <>
      <span ref={popoverRef}>
        {/* Clickable Madlib Button with Dropdown Arrow */}
        <Button
          id={dropdownId}
          variant="text"
          aria-haspopup="true"
          className={doPulse ? styles.MadLibButtonPulse : styles.MadLibButton}
          onClick={popover.open}
        >
          {currentDisplayName}{' '}
          {popover.isOpen ? <ArrowDropUp /> : <ArrowDropDown />}
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
          {/* Location Dropdown */}
          {isFips && (
            <div className={styles.OptionsSelectorPopover}>
              <h3 className={styles.SearchForText}>Search for location</h3>

              <Autocomplete
                disableClearable={true}
                autoHighlight={true}
                options={props.options as Fips[]}
                groupBy={(option) => getGroupName(option)}
                clearOnEscape={true}
                getOptionLabel={(fips) => fips.getFullDisplayName()}
                isOptionEqualToValue={(fips) => fips.code === props.value}
                renderOption={(props, fips: Fips) => {
                  return <li {...props}>{fips.getFullDisplayName()}</li>
                }}
                open={autoCompleteOpen}
                onOpen={openAutoComplete}
                onClose={closeAutoComplete}
                renderInput={(params) => (
                  <TextField
                    placeholder=""
                    autoFocus // eslint-disable-line jsx-a11y/no-autofocus
                    margin="dense"
                    variant="outlined"
                    onChange={updateTextBox}
                    {...params}
                  />
                )}
                onChange={(e, fips) => {
                  props.onOptionUpdate(fips.code)
                  setTextBoxValue('')
                  popover.close()
                }}
              />
              <span className={styles.NoteText}>
                County, state, territory, or{' '}
                {isUsa ? (
                  USA_DISPLAY_NAME
                ) : (
                  <button
                    className={styles.UsaButton}
                    onClick={handleUsaButton}
                  >
                    United States
                  </button>
                )}
                . Some source data is unavailable at county and territory
                levels.
              </span>
            </div>
          )}
          {/* Condition Dropdown */}
          {!isFips && (
            <>
              <Box my={3} mx={3}>
                <Grid container>
                  {CATEGORIES_LIST.map((category) => {
                    return (
                      <Grid
                        item
                        xs={6}
                        sm={4}
                        key={category.title}
                        className={styles.CategoryList}
                      >
                        <h3
                          className={styles.CategoryTitleText}
                          aria-label={category.title + ' options'}
                        >
                          {category.title}
                        </h3>
                        <List dense={true} role="menu">
                          {(props.options as string[][]).map(
                            (item: string[]) => {
                              const [optionId, optionDisplayName] = item
                              return (
                                // place variables in their respective categories
                                category.options.includes(
                                  optionId as DropdownVarId
                                ) && (
                                  <ListItem
                                    role="menuitem"
                                    className={styles.ListItem}
                                    key={optionId}
                                    button
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
                                  </ListItem>
                                )
                              )
                            }
                          )}
                        </List>
                      </Grid>
                    )
                  })}
                  <Grid
                    item
                    xs={12}
                    container
                    alignItems="flex-end"
                    justifyContent="flex-end"
                  >
                    {!noTopic && (
                      <Button
                        className={styles.GoBackButton}
                        onClick={() => {
                          popover.close()
                          props.onOptionUpdate(DEFAULT)
                        }}
                      >
                        <KeyboardBackspaceIcon
                          style={{
                            fontSize: 'small',
                          }}
                        />{' '}
                        <span className={styles.GoBackButtonText}>
                          Clear topic selection
                        </span>
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </>
          )}
        </Popover>
      </span>
    </>
  )
}

export default OptionsSelector
