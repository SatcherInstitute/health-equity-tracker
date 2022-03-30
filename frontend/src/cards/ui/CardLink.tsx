import React from "react";
import LinkIcon from "@material-ui/icons/Link";
import { Grid } from "@material-ui/core";
import styles from "../Card.module.scss";

function handleClick() {
  navigator.clipboard.writeText("boop").then(
    () => {
      /* clipboard successfully set */
      console.log("YAY");
    },
    () => {
      /* clipboard write failed */
      console.log("BOO");
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
