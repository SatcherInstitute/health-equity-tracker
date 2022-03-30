import React from "react";
import LinkIcon from "@material-ui/icons/Link";
import { Grid } from "@material-ui/core";
import styles from "../Card.module.scss";
import { CardId } from "../../utils/urlutils";

function handleClick(id: CardId) {
  const currentUrl = window.location.href;
  navigator.clipboard.writeText(currentUrl).then(
    () => {
      /* clipboard successfully set */
      console.log(id, currentUrl);
    },
    () => {
      /* clipboard write failed */
      console.log("BOO", currentUrl);
    }
  );
}

export function CardLink() {
  return (
    <>
      <a
        href={window.location.href}
        className={styles.CardLinkButton}
        onClick={(e) => {
          e.preventDefault();
          handleClick("#table");
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
