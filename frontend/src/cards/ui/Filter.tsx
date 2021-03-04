import React, { useState } from "react";
import ArrowDropUp from "@material-ui/icons/ArrowDropUp";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";
import TextField from "@material-ui/core/TextField";
import { Fips } from "../../data/utils/Fips";
import Popover from "@material-ui/core/Popover";
import Button from "@material-ui/core/Button";
import styles from "./Filter.module.scss";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { usePopover } from "../../utils/usePopover";

function Filter(props: {
  value: string;
  options: Record<string, string[]>;
  onOptionUpdate: (option: string) => void;
}) {
  const popover = usePopover();
  const subPopover = usePopover();

  const [value, setValue] = useState(props.value);
  const [category, setCategory] = useState(Object.keys(props.options)[0]);

  const updateValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <>
      <Button variant="text" onClick={popover.open}>
        Filter by: {value}
      </Button>
      <Popover
        open={popover.isOpen}
        anchorEl={popover.anchor}
        onClose={popover.close}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <List>
          {Object.keys(props.options).map((breakdown: string) => (
            <>
              {props.options[breakdown].length === 0 && (
                <ListItem button disabled>
                  {breakdown} [unavailable]
                </ListItem>
              )}
              {props.options[breakdown].length > 0 && (
                <ListItem
                  button
                  selected={breakdown === props.value}
                  onClick={(event: any) => {
                    setCategory(breakdown);
                    subPopover.open(event);
                  }}
                >
                  <ListItemText primary={breakdown} />
                </ListItem>
              )}
            </>
          ))}
        </List>
      </Popover>
      <Popover
        open={subPopover.isOpen}
        anchorEl={subPopover.anchor}
        onClose={subPopover.close}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <List>
          {props.options[category].map((breakdown: string) => (
            <ListItem
              button
              selected={breakdown === props.value}
              onClick={() => {
                popover.close();
                subPopover.close();
                setValue(breakdown);
                props.onOptionUpdate(breakdown);
              }}
            >
              <ListItemText primary={breakdown} />
              {props.options[breakdown]}
            </ListItem>
          ))}
        </List>
      </Popover>
    </>
  );
}

export default Filter;
