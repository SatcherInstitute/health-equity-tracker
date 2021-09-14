import { Grid, Typography } from "@material-ui/core";
import React from "react";
import styles from "../WhatIsHealthEquityPage.module.scss";
import parse from "html-react-parser";

function SinglePost() {
  return (
    <Grid
      container
      className={styles.NewsAndStoriesRow}
      direction="row"
      justify="center"
    >
      <Grid item>
        <Typography className={styles.NewsAndStoriesHeaderText} variant="h1">
          {/* {parse(fullArticle.title.rendered)} */}
          SINGLE POST
        </Typography>
        <span className={styles.NewsAndStoriesSubheaderText}>
          Read the latest news, posts, and stories related to health equity
        </span>
      </Grid>
      <Grid item>
        <div className={styles.FullArticleContainer}>
          {/* {parse(fullArticle.content.rendered)} */}
          SINGLE POST
        </div>
      </Grid>
    </Grid>
  );
}

export default SinglePost;
