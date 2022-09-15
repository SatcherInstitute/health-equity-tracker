import React, { useState } from "react";
import LinkIcon from "@material-ui/icons/Link";
import styles from "../Card.module.scss";
import { IconButton, Snackbar } from "@material-ui/core";
import { ScrollableHashId } from "../../utils/hooks/useStepObserver";
import { useLocation } from "react-router-dom";
import { Alert } from "@material-ui/lab";

interface CopyLinkButtonProps {
  scrollToHash: ScrollableHashId;
}

export default function CopyLinkButton(props: CopyLinkButtonProps) {
  const location = useLocation();

  const [open, setOpen] = useState(false);

  const urlWithoutHash = window.location.href.split("#")[0];
  const cardHashLink = `${urlWithoutHash}#${props.scrollToHash}`;

  const handleClick = () => {
    navigator.clipboard.writeText(cardHashLink);
    setOpen(true);
    location.hash = `${props.scrollToHash}`;
  };

  return (
    <IconButton
      className={styles.CopyLinkButton}
      aria-label="copy link to card to clipboard"
      onClick={handleClick}
    >
      <LinkIcon />

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
      >
        <Alert>
          <b>Card link copied to clipboard.</b>
          {/* <p>{cardHashLink}</p>
					<a href={cardHashLink} target="_blank" rel="noreferrer">
						Open in new tab
					</a> */}
        </Alert>
      </Snackbar>
    </IconButton>
  );
}
