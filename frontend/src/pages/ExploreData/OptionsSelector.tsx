import React, { useRef, useState } from "react";
import ArrowDropUp from "@material-ui/icons/ArrowDropUp";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete"; // can't lazy load due to typing issue
import { Fips } from "../../data/utils/Fips";
import Popover from "@material-ui/core/Popover";
import Button from "@material-ui/core/Button";
import styles from "./OptionsSelector.module.scss";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { usePopover } from "../../utils/hooks/usePopover";
import {
  CATEGORIES_LIST,
  DEFAULT,
  DefaultDropdownVarId,
} from "../../utils/MadLibs";
import { Box, Grid } from "@material-ui/core";
import { DropdownVarId, VariableId } from "../../data/config/MetricConfig";
import { usePrefersReducedMotion } from "../../utils/hooks/usePrefersReducedMotion";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";

function OptionsSelector(props: {
  value: VariableId | string | DefaultDropdownVarId; // condition data type OR fips code as string OR default setting with no topic selected
  options: Fips[] | string[][];
  onOptionUpdate: (option: string) => void;
}) {
  const isFips =
    props.options[0] && props.options[0] instanceof Fips ? true : false;
  let currentDisplayName;
  if (isFips) {
    currentDisplayName = new Fips(props.value).getFullDisplayName();
  } else {
    const chosenOption = (props.options as string[][]).find(
      (i: string[]) => i[0] === props.value
    );
    currentDisplayName = chosenOption ? chosenOption[1] : "";
  }

  const popoverRef = useRef(null);
  const popover = usePopover();

  const [, setTextBoxValue] = useState("");
  const updateTextBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextBoxValue(event.target.value);
  };

  const [autoCompleteOpen, setAutoCompleteOpen] = useState(false);
  const openAutoComplete = () => {
    setAutoCompleteOpen(true);
  };

  const closeAutoComplete = () => {
    setAutoCompleteOpen(false);
  };

  function getGroupName(option: Fips): string {
    if (option.isUsa()) return "National";
    if (option.isState()) return "States";
    if (option.isTerritory()) return "Territories";
    return `${option.getParentFips().getDisplayName()} ${
      option.getParentFips().isTerritory() ? " County Equivalents" : " Counties"
    }`;
  }

  const anchorO = "bottom"; // noTopicChosen ? "center" : "bottom";
  const transformO = "top"; // noTopicChosen ? "center" : "top";

  const noTopic = props.value === DEFAULT;

  // only pulse the condition button when no topic is selected and dropdown menu is closed (and user hasn't set their machine to prefer reduced motion)
  const prefersReducedMotion = usePrefersReducedMotion();
  const doPulse =
    !prefersReducedMotion && !isFips && noTopic && !popover.isOpen;

  const dropdownId = `${props.value}-dropdown-${isFips ? "fips" : "topic"}`;

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
          {currentDisplayName}{" "}
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
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: transformO,
            horizontal: "center",
          }}
        >
          {!isFips && noTopic && (
            <Grid container justifyContent="space-between">
              <h2 className={styles.PopoverTitle}>
                {" "}
                Select a topic to get started
              </h2>
            </Grid>
          )}

          {/* Location Dropdown */}
          {isFips && (
            <div className={styles.OptionsSelectorPopover}>
              <span className={styles.SearchForText}>Search for location</span>

              <Autocomplete
                disableClearable={true}
                autoHighlight={true}
                options={props.options as Fips[]}
                groupBy={(option) => getGroupName(option)}
                clearOnEscape={true}
                getOptionLabel={(fips) => fips.getFullDisplayName()}
                getOptionSelected={(fips) => fips.code === props.value}
                renderOption={(fips) => <>{fips.getFullDisplayName()}</>}
                open={autoCompleteOpen}
                onOpen={openAutoComplete}
                onClose={closeAutoComplete}
                renderInput={(params) => (
                  <TextField
                    placeholder="County, State, Territory, or United States"
                    margin="dense"
                    variant="outlined"
                    onChange={updateTextBox}
                    {...params}
                  />
                )}
                onChange={(e, fips) => {
                  props.onOptionUpdate(fips.code);
                  setTextBoxValue("");
                  popover.close();
                }}
              />
              <span className={styles.NoteText}>
                City and census tract location is currently unavailable
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
                        // md={4}
                        key={category.title}
                        className={styles.CategoryList}
                      >
                        <h3
                          className={styles.CategoryTitleText}
                          aria-label={category.title + " options"}
                        >
                          {category.title}
                        </h3>
                        <List dense={true} role="menu">
                          {(props.options as string[][]).map(
                            (item: string[]) => {
                              const [optionId, optionDisplayName] = item;
                              return (
                                // place variables in their respective categories
                                category.options.includes(
                                  optionId as DropdownVarId
                                ) && (
                                  <ListItem
                                    role="menuitem"
                                    key={optionId}
                                    button
                                    selected={optionId === props.value}
                                    onClick={() => {
                                      popover.close();
                                      props.onOptionUpdate(optionId);
                                    }}
                                  >
                                    <ListItemText primary={optionDisplayName} />
                                  </ListItem>
                                )
                              );
                            }
                          )}
                        </List>
                      </Grid>
                    );
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
                          popover.close();
                          props.onOptionUpdate(DEFAULT);
                        }}
                      >
                        <KeyboardBackspaceIcon style={{ fontSize: "small" }} />{" "}
                        <span className={styles.GoBackButtonText}>Go back</span>
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
  );
}

export default OptionsSelector;
