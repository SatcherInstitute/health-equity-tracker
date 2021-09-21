import { Grid, Hidden, Typography } from "@material-ui/core";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import styles from "../WhatIsHealthEquityPage.module.scss";
import parse from "html-react-parser";
import { useParams } from "react-router-dom";
import { BLOG_TAB_LINK, ReactRouterLinkButton } from "../../../utils/urlutils";
import { Helmet } from "react-helmet";

function prettyDate(dateString: string) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options as any);
}

export default function SinglePost({ articles }: { articles: any[] }) {
  const [fullArticle, setFullArticle] = useState<any>();
  const [prevArticle, setPrevArticle] = useState<any>();
  const [nextArticle, setNextArticle] = useState<any>();

  let { slug }: { slug: string } = useParams();

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
    setNextArticle(articles[(fullArticleIndex + 1) % articles.length]);
  }, [articles, fullArticle, slug]);

  return (
    <Grid container className={styles.Grid}>
      <Helmet>
        <title>{`Blog${
          fullArticle ? " - " + parse(fullArticle.title.rendered) : ""
        } - Health Equity Tracker`}</title>
      </Helmet>
      <Grid
        container
        className={styles.HeaderRow}
        direction="row"
        justify="center"
        alignItems="center"
      >
        <Hidden smDown>
          <Grid container item md={4} className={styles.HeaderImgItem}>
            {fullArticle && (
              <img
                src={
                  fullArticle._embedded["wp:featuredmedia"][0].source_url ||
                  "/img/stock/woman-in-wheelchair-with-tea.png"
                }
                className={styles.HeaderImg}
                alt=""
              />
            )}
          </Grid>
        </Hidden>
        <Grid item xs={12} sm={12} md={8} className={styles.HeaderTextItem}>
          <Typography
            id="main"
            tabIndex={-1}
            className={styles.HeaderText}
            variant="h2"
            paragraph={true}
          >
            {fullArticle && parse(fullArticle.title.rendered)}
          </Typography>

          <Typography
            className={styles.HeaderSubtext}
            variant="body1"
            paragraph={true}
          >
            {fullArticle &&
              `Authored by ${fullArticle._embedded.author[0].name}`}
          </Typography>

          <Typography className={styles.HeaderSubtext} variant="body1">
            {fullArticle && (
              <span className={styles.DefinitionSourceSpan}>
                Published {prettyDate(fullArticle.date)}
              </span>
            )}
          </Typography>
        </Grid>
      </Grid>
      <Grid
        container
        className={styles.NewsAndStoriesRow}
        direction="row"
        justify="center"
      >
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
              displayName="All Posts"
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
    </Grid>
  );
}
