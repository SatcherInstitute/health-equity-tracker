import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import styles from "../WhatIsHealthEquityPage.module.scss";
import parse from "html-react-parser";
import { useParams } from "react-router-dom";

// @ts-ignore
function SinglePost(props) {
  const [fullArticle, setFullArticle] = useState<any>();
  const { articles } = props;
  // @ts-ignore
  let { slug } = useParams();

  // on page load, isolate correct full article from array based on URL slug
  useEffect(() => {
    setFullArticle(
      articles.find((article: any) => {
        return article.slug === slug;
      })
    );
    console.log("full article", fullArticle);
  }, [articles, fullArticle, props.fullArticle, slug]);

  return (
    <Grid
      container
      className={styles.NewsAndStoriesRow}
      direction="row"
      justify="center"
    >
      <Grid item>
        <Typography className={styles.NewsAndStoriesHeaderText} variant="h1">
          {fullArticle && parse(fullArticle.title.rendered)}
        </Typography>
        {/* <span className={styles.NewsAndStoriesSubheaderText}>
          Read the latest news, posts, and stories related to health equity
        </span> */}
      </Grid>
      <Grid item>
        <div className={styles.FullArticleContainer}>
          {fullArticle && parse(fullArticle.content.rendered)}
        </div>
      </Grid>
    </Grid>
  );
}

export default SinglePost;
