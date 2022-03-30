import React from "react";
import LinkIcon from "@material-ui/icons/Link";
import { Button, Grid, Snackbar } from "@material-ui/core";
import styles from "../Card.module.scss";
import { CardId } from "../../utils/urlutils";
import { Alert } from "@material-ui/lab";

interface CardLinkProps {
  cardId: CardId;
}

export function CardLink(props: CardLinkProps) {
  const [open, setOpen] = React.useState(false);

  function handleClick(e: any) {
    const linkWithCardHash = window.location.href + props.cardId;
    navigator.clipboard.writeText(linkWithCardHash).then(
      () => {
        setOpen(true);

        /* clipboard successfully set */
        console.log(linkWithCardHash);
      },
      () => {
        /* clipboard write failed */
        console.log("BOO", linkWithCardHash);
      }
    );
  }

  const handleClose = (event: any) => {
    setOpen(false);
  };

  return (
    <>
      <Button
        // className={styles.CardLinkButton}
        color="primary"
        onClick={(e) => {
          // e.preventDefault();
          // e.stopPropagation();
          // e.nativeEvent.stopImmediatePropagation();
          handleClick(e);
        }}
      >
        <Grid container alignItems="center">
          <Grid item className={styles.CardLinkIcon} component="span">
            <LinkIcon />
          </Grid>
          <Grid item className={styles.CardLinkText} component="span">
            Get Link
          </Grid>
        </Grid>
      </Button>

      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
        className={styles.SnackBar}
      >
        <Alert severity="success" onClose={handleClose}>
          Direct link to {props.cardId} card copied to clipboard
        </Alert>
      </Snackbar>
    </>
  );
}
