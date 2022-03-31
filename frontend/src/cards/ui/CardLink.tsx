import React from "react";
import LinkIcon from "@material-ui/icons/Link";
import { Button, Grid } from "@material-ui/core";
import styles from "../Card.module.scss";
import { CardId } from "../../utils/urlutils";
import { UserMessage } from "./UserMessage";

interface CardLinkProps {
  cardId: CardId;
}

export function CardLink(props: CardLinkProps) {
  const [open, setOpen] = React.useState(false);

  const linkWithCardHash = window.location.href + props.cardId;
  const message = `Direct link to ${props.cardId
    .substring(1)
    .toLocaleUpperCase()} CARD copied to clipboard`;

  function handleClick() {
    navigator.clipboard.writeText(linkWithCardHash).then(
      () => {
        setOpen(true);
      },
      () => {
        /* if clipboard write failed */
        console.error("Error copying to clipboard", linkWithCardHash);
      }
    );
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <Button color="primary" onClick={handleClick}>
        <Grid container alignItems="center">
          <Grid item className={styles.CardLinkIcon} component="span">
            <LinkIcon />
          </Grid>
          <Grid item className={styles.CardLinkText} component="span">
            Link
          </Grid>
        </Grid>
      </Button>

      <UserMessage
        message={message}
        open={open}
        handleClose={handleClose}
        severity="success"
      />
    </>
  );
}
