/* 
Mock Categories and Variables

COVID-19
- COVID Outcomes
- Vaccination Rates
- Vaccination Hesitancy
Chronic Conditions
- Diabetes
- COPD
- Asthma
- Cardiovascular Diseases
Social and Environmental
- Uninsured Individuals
- Poverty
- Unemployment
- Education Rates
- Food Insecurity
- Social Vulnerability Index
Mental Health
- Depression
- Anxiety
- Suicidality
- Dementia Related Disorders
- Trauma and Stressors
- Substance Use Disorder
Political Determinants
- Access to Care
- Cost of Care
- Gun Violence
- Immigration Issues
- Voter Participation
- Policy Ranking/Grading
 */

import React, { useState } from "react";
import ArrowDropUp from "@material-ui/icons/ArrowDropUp";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Fips } from "../../data/utils/Fips";
import Popover from "@material-ui/core/Popover";
import Button from "@material-ui/core/Button";
import styles from "./OptionsSelector.module.scss";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { usePopover } from "../../utils/usePopover";
import { CATEGORIES_LIST, DropdownVarId } from "../../utils/MadLibs";

function OptionsSelector(props: {
  value: string;
  options: Fips[] | string[][];
  onOptionUpdate: (option: string) => void;
}) {
  const popover = usePopover();

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

  const [textBoxValue, setTextBoxValue] = useState("");
  const updateTextBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextBoxValue(event.target.value);
  };

  const [autoCompleteOpen, setAutoCompleteOpen] = useState(false);
  const openAutoComplete = () => {
    if (textBoxValue.length >= 1) {
      setAutoCompleteOpen(true);
    }
  };
  const closeAutoComplete = () => {
    setAutoCompleteOpen(false);
  };

  return (
    <>
      <Button
        variant="text"
        className={styles.MadLibButton}
        onClick={popover.open}
      >
        {currentDisplayName}{" "}
        {popover.isOpen ? <ArrowDropUp /> : <ArrowDropDown />}
      </Button>

      <Popover
        className={styles.PopoverOverride}
        open={popover.isOpen}
        anchorEl={popover.anchor}
        onClose={popover.close}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {isFips && (
          <div className={styles.OptionsSelectorPopover}>
            <span className={styles.SearchForText}>Search for location</span>

            <Autocomplete
              disableClearable={true}
              options={props.options as Fips[]}
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
        {!isFips && (
          <div className={styles.VariablesBoxPopover}>
            {CATEGORIES_LIST.map((category) => {
              return (
                <div className={styles.CategoryList}>
                  <List>
                    <span className={styles.CategoryTitleText}>
                      {category.title}
                    </span>
                    {(props.options as string[][]).map((item: string[]) => {
                      const [optionId, optionDisplayName] = item;
                      return (
                        // place variables in their respective categories
                        category.options.includes(
                          optionId as DropdownVarId
                        ) && (
                          <ListItem
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
                    })}
                  </List>
                </div>
              );
            })}
          </div>
        )}
      </Popover>
    </>
  );
}

export default OptionsSelector;
