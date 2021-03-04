import React, { useState } from "react";
import Popover, { PopoverOrigin } from "@material-ui/core/Popover";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { usePopover } from "../../utils/usePopover";

const ANCHOR_ORIGIN: PopoverOrigin = {
  vertical: "top",
  horizontal: "right",
};
const TRANSFORM_ORIGIN: PopoverOrigin = {
  vertical: "top",
  horizontal: "left",
};

function Filter(props: {
  value: string;
  options: Record<string, string[]>;
  onOptionUpdate: (option: string) => void;
}) {
  const popover = usePopover();
  const subPopover = usePopover();

  const [category, setCategory] = useState(Object.keys(props.options)[0]);

  return (
    <>
      <Button variant="text" onClick={popover.open}>
        Filter by: {props.value}
      </Button>
      <Popover
        open={popover.isOpen}
        anchorEl={popover.anchor}
        onClose={popover.close}
        anchorOrigin={ANCHOR_ORIGIN}
        transformOrigin={TRANSFORM_ORIGIN}
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
        anchorOrigin={ANCHOR_ORIGIN}
        transformOrigin={TRANSFORM_ORIGIN}
      >
        <List>
          {props.options[category].map((breakdown: string) => (
            <ListItem
              button
              selected={breakdown === props.value}
              onClick={() => {
                popover.close();
                subPopover.close();
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
