import React, { useState } from "react";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";
import ArrowRight from "@material-ui/icons/ArrowRight";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Popover, { PopoverOrigin } from "@material-ui/core/Popover";
import { usePopover, PopoverElements } from "../../utils/usePopover";

const ANCHOR_ORIGIN: PopoverOrigin = {
  vertical: "top",
  horizontal: "right",
};
const TRANSFORM_ORIGIN: PopoverOrigin = {
  vertical: "top",
  horizontal: "left",
};

function ListPopover(props: {
  currentSelection: string;
  popover: PopoverElements;
  items: Record<string, string[]> | string[];
  onClick: (event: React.MouseEvent<HTMLElement>, value: string) => void;
}) {
  const hasChildren = !Array.isArray(props.items);
  const listItems: string[] = hasChildren
    ? Object.keys(props.items)
    : (props.items as string[]);

  const renderListItem = (listItem: string) => {
    if (
      hasChildren &&
      (props.items as Record<string, string[]>)[listItem].length === 0
    ) {
      return (
        <ListItem button disabled>
          {listItem} [unavailable]
        </ListItem>
      );
    } else {
      return (
        <ListItem
          button
          selected={listItem === props.currentSelection}
          onClick={(event) => {
            props.onClick(event, listItem);
          }}
        >
          <ListItemText primary={listItem} />
          {hasChildren && <ArrowRight />}
        </ListItem>
      );
    }
  };

  return (
    <Popover
      open={props.popover.isOpen}
      anchorEl={props.popover.anchor}
      onClose={props.popover.close}
      anchorOrigin={ANCHOR_ORIGIN}
      transformOrigin={TRANSFORM_ORIGIN}
    >
      <List>
        {listItems.map((listItem: string) => renderListItem(listItem))}
      </List>
    </Popover>
  );
}

function TwoLevelDropDown(props: {
  value: string;
  options: Record<string, string[]>;
  onOptionUpdate: (option: string) => void;
}) {
  const firstMenu = usePopover();
  const secondMenu = usePopover();

  const [firstMenuSelection, setFirstMenuSelection] = useState(
    Object.keys(props.options)[0]
  );

  const oneLevelMenu = Object.keys(props.options).length === 1;

  return (
    <>
      <Button variant="text" onClick={firstMenu.open}>
        Filter by:<u>{props.value}</u>
        <ArrowDropDown />
      </Button>

      <ListPopover
        popover={firstMenu}
        currentSelection={firstMenuSelection}
        items={oneLevelMenu ? Object.values(props.options)[0] : props.options}
        onClick={(event: React.MouseEvent<HTMLElement>, value: string) => {
          if (oneLevelMenu) {
            props.onOptionUpdate(value);
            firstMenu.close();
          } else {
            setFirstMenuSelection(value);
            secondMenu.open(event);
          }
        }}
      />

      <ListPopover
        popover={secondMenu}
        currentSelection={props.value}
        items={props.options[firstMenuSelection]}
        onClick={(
          unused_event: React.MouseEvent<HTMLElement>,
          value: string
        ) => {
          firstMenu.close();
          secondMenu.close();
          props.onOptionUpdate(value);
        }}
      />
    </>
  );
}

export default TwoLevelDropDown;
