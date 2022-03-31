import { Snackbar } from "@material-ui/core";
import { Alert, Color } from "@material-ui/lab";
import React from "react";

const DELAY_BEFORE_CLOSE = 8_000;

interface UserMessageProps {
  message: string;
  severity?: Color;
  open: boolean;
  handleClose: any;
}

// Type 'Function' is not assignable to type ''.
//   Type 'Function' provides no match for the signature '(event: SyntheticEvent<any, Event>, reason: SnackbarCloseReason): void'.

export function UserMessage(props: UserMessageProps) {
  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      open={props.open}
      autoHideDuration={DELAY_BEFORE_CLOSE}
      onClose={props.handleClose}
    >
      <Alert severity={props.severity ?? "info"} onClose={props.handleClose}>
        {props.message}
      </Alert>
    </Snackbar>
  );
}
