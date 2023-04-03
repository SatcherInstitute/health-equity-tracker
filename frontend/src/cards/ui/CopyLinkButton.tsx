import React, { useState } from "react";
import LinkIcon from "@material-ui/icons/Link";
import styles from "./CopyLinkButton.module.scss";
import { IconButton, Snackbar } from "@material-ui/core";
import { type ScrollableHashId } from "../../utils/hooks/useStepObserver";
import { Alert } from "@material-ui/lab";

interface CopyLinkButtonProps {
  scrollToHash: ScrollableHashId
}

export default function CopyLinkButton(props: CopyLinkButtonProps) {
  const [open, setOpen] = useState(false);

  const urlWithoutHash = window.location.href.split("#")[0];
  const cardHashLink = `${urlWithoutHash}#${props.scrollToHash}`;

  function handleClose() {
    setOpen(false);
  }

  function handleClick() {
    async function asyncHandleClick() {
      await navigator.clipboard.writeText(cardHashLink);
      setOpen(true);
    }
    asyncHandleClick().catch((error) => error);
  }

  let cardName = props.scrollToHash.replaceAll("-", " ");
  cardName = cardName[0].toUpperCase() + cardName.slice(1);

  return (
    <>
      <IconButton
        className={styles.CopyLinkButton}
        aria-label={`copy direct link to: ${cardName}`}
        onClick={handleClick}
      >
        <LinkIcon />
      </IconButton>
      <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
        <Alert onClose={handleClose} className={styles.SnackBarAlert}>
          Direct link to <b>{cardName}</b> copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}
