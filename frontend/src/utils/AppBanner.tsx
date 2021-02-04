import Typography from "@material-ui/core/Typography";
import React from "react";
import styles from "./AppBanner.module.scss";

function AppBanner(props: { text: string }) {
  return (
    <Typography variant="h6" className={styles.Banner}>
      {props.text}
    </Typography>
  );
}

export default AppBanner;
