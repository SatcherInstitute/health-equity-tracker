import React from "react";
import LinkIcon from "@material-ui/icons/Link";
import { Grid } from "@material-ui/core";
import styles from "../Card.module.scss";
import { CardId } from "../../utils/urlutils";

interface CardLinkProps {
  cardId: CardId;
}

export function CardLink(props: CardLinkProps) {
  function handleClick() {
    const linkWithCardHash = window.location.href + props.cardId;
    navigator.clipboard.writeText(linkWithCardHash).then(
      () => {
        /* clipboard successfully set */
        console.log(linkWithCardHash);
      },
      () => {
        /* clipboard write failed */
        console.log("BOO", linkWithCardHash);
      }
    );
  }

  return (
    <>
      <a
        href={window.location.href}
        className={styles.CardLinkButton}
        onClick={(e) => {
          e.preventDefault();
          handleClick();
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
      </a>
    </>
  );
}
