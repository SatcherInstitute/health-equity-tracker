import React, { useState } from "react";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";
import ArrowRight from "@material-ui/icons/ArrowRight";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Popover, { PopoverOrigin } from "@material-ui/core/Popover";
import { usePopover, PopoverElements } from "../../utils/usePopover";
import styles from "./DropDownMenu.module.scss";
import { Menu } from "@material-ui/core";

const ANCHOR_ORIGIN: PopoverOrigin = {
  vertical: "top",
  horizontal: "right",
};
const TRANSFORM_ORIGIN: PopoverOrigin = {
  vertical: "top",
  horizontal: "left",
};

function MenuPopover(props: {
  popover: PopoverElements;
  // Map type indicates items are first level menu items, array indicates second level
  items: Record<string, string[]> | string[];
  onClick: (event: React.MouseEvent<HTMLElement>, value: string) => void;
  // Optional additional actions to do when the popover is closed
  onClose?: () => void;
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
        <ListItem key={listItem} button disabled>
          {listItem} [unavailable]
        </ListItem>
      );
    } else {
      return (
        <ListItem
          key={listItem}
          button
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
      onClose={() => {
        props.popover.close();
        if (props.onClose) {
          props.onClose();
        }
      }}
      anchorOrigin={ANCHOR_ORIGIN}
      transformOrigin={TRANSFORM_ORIGIN}
    >
      <Menu
        open={props.popover.isOpen}
        className={styles.GroupListMenuBox}
        onClose={() => {
          props.popover.close();
          if (props.onClose) {
            props.onClose();
          }
        }}
      >
        <List aria-label="List of Options" dense={true}>
          {listItems.map((listItem: string) => renderListItem(listItem))}
        </List>
      </Menu>
    </Popover>
  );
}

/*
   DropDownMenu is a dropdown menu with one or two levels of menu items.
   For example you can have:
     * Dropdown with one level listing all race options
     * Dropdown with one level to select race and a second level listing all race options
*/
function DropDownMenu(props: {
  // Dropdown's currently selected option.
  value: string;
  // Map of first level menu option to submenu options.
  // If only one key is present, submenu options will render as first level.
  options: Record<string, string[]>;
  // Update parent component with a newly selected value.
  onOptionUpdate: (
    category: string | undefined,
    filterSelection: string | undefined
  ) => void;
}) {
  const firstMenu = usePopover();
  const secondMenu = usePopover();

  const [firstMenuSelection, setFirstMenuSelection] = useState(
    Object.keys(props.options)[0]
  );

  const oneLevelMenu = Object.keys(props.options).length === 1;
  return (
    <>
      <div className={styles.FilterBy}>Select group:</div>
      <Button variant="text" onClick={firstMenu.open} aria-haspopup="true">
        <u>{props.value}</u>
        <ArrowDropDown />
      </Button>

      <MenuPopover
        popover={firstMenu}
        aria-expanded="true"
        items={oneLevelMenu ? Object.values(props.options)[0] : props.options}
        onClick={(event: React.MouseEvent<HTMLElement>, value: string) => {
          if (oneLevelMenu) {
            props.onOptionUpdate(undefined, value);
            firstMenu.close();
          } else {
            setFirstMenuSelection(value);
            secondMenu.open(event);
          }
        }}
      />

      <MenuPopover
        popover={secondMenu}
        items={props.options[firstMenuSelection]}
        onClick={(
          unused_event: React.MouseEvent<HTMLElement>,
          value: string
        ) => {
          firstMenu.close();
          secondMenu.close();
          props.onOptionUpdate(firstMenuSelection, value);
        }}
        onClose={firstMenu.close}
      />
    </>
  );
}

export default DropDownMenu;
