import React from "react";
import styles from "../Card.module.scss";
import Popover from "@material-ui/core/Popover";
import { PopoverElements } from "../../utils/usePopover";

function DisparityInfoPopover(props: { popover: PopoverElements }) {
  return (
    <Popover
      open={props.popover.isOpen}
      anchorEl={props.popover.anchor}
      onClose={props.popover.close}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <div className={styles.CardTitlePopover}>
        A <b>disparity</b> is defined by when if a health outcome is seen to a
        greater or lesser extent between populations.
      </div>
    </Popover>
  );
}

export default DisparityInfoPopover;
