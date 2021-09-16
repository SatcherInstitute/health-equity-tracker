import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import styles from "../WhatIsHealthEquityPage.module.scss";
import parse from "html-react-parser";
import { useParams } from "react-router-dom";
import { BLOG_TAB_LINK, ReactRouterLinkButton } from "../../../utils/urlutils";

// @ts-ignore
function SinglePost(props) {
  const [fullArticle, setFullArticle] = useState<any>();
  const [prevArticle, setPrevArticle] = useState<any>();
  const [nextArticle, setNextArticle] = useState<any>();
  const { articles } = props;
  // @ts-ignore
  let { slug } = useParams();

  // on page load, get prev,full, next article based on fullArticle URL slug
  useEffect(() => {
    const fullArticleIndex = articles.findIndex(
      (article: any) => article.slug === slug
    );
    setFullArticle(articles[fullArticleIndex]);
    // previous and next articles wrap around both ends of the array
    setPrevArticle(
      articles[
        fullArticleIndex - 1 >= 0 ? fullArticleIndex - 1 : articles.length - 1
      ]
    );
    setNextArticle(articles[(fullArticleIndex + 1) % props.articles.length]);
  }, [articles, fullArticle, props.articles.length, props.fullArticle, slug]);

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
      </Grid>
      <Grid item>
        <div className={styles.FullArticleContainer}>
          {fullArticle && parse(fullArticle.content.rendered)}
        </div>
      </Grid>

      <Grid container className={styles.PrevNextSection}>
        <Grid item xs={4}>
          {prevArticle && (
            <ReactRouterLinkButton
              url={`${BLOG_TAB_LINK}/${prevArticle.slug}`}
              className={styles.PrevNextHeaderText}
              displayName={`« ${parse(prevArticle.title.rendered)}`}
            />
          )}
        </Grid>
        <Grid item xs={4}>
          <ReactRouterLinkButton
            url={BLOG_TAB_LINK}
            className={styles.PrevNextHeaderText}
            displayName="See all blog posts"
          />
        </Grid>
        <Grid item xs={4}>
          {nextArticle && (
            <ReactRouterLinkButton
              url={`${BLOG_TAB_LINK}/${nextArticle.slug}`}
              className={styles.PrevNextHeaderText}
              displayName={`${parse(nextArticle.title.rendered)} »`}
            />
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}

export default SinglePost;
