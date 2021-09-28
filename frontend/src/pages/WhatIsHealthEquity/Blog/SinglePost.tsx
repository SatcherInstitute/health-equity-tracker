import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import styles from "../WhatIsHealthEquityPage.module.scss";
import parse from "html-react-parser";
import { useParams } from "react-router-dom";
import {
  BLOG_TAB_LINK,
  fetchBlogData,
  ReactRouterLinkButton,
  ARTICLES_KEY,
  REACT_QUERY_OPTIONS,
} from "../../../utils/urlutils";
import { Helmet } from "react-helmet";
import AppbarLogo from "../../../assets/AppbarLogo.png";
import BlogPreviewCard from "./BlogPreviewCard";
import { useQuery } from "react-query";

function prettyDate(dateString: string) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options as any);
}

export default function SinglePost() {
  const [fullArticle, setFullArticle] = useState<any>();
  const [prevArticle, setPrevArticle] = useState<any>();
  const [nextArticle, setNextArticle] = useState<any>();

  let { slug }: { slug: string } = useParams();

  const { isLoading, error, data }: any = useQuery(
    ARTICLES_KEY,
    fetchBlogData,
    REACT_QUERY_OPTIONS
  );
  const articles = data?.data;

  // on page load, get prev,full, next article based on fullArticle URL slug
  useEffect(() => {
    if (articles) {
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
    }
  }, [articles, slug]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>An error has occurred: {error.message}</p>;

  return (
    <Grid container className={styles.Grid}>
      {console.log(fullArticle && fullArticle)}
      <Helmet>
        <title>{`Blog${
          fullArticle ? " - " + parse(fullArticle.title.rendered) : ""
        } - Health Equity Tracker`}</title>
        {/* if cross-posted from external site, should be input on WP as canonical_url */}
        {fullArticle && (
          <link
            rel="canonical"
            href={fullArticle.acf?.canonical_url || fullArticle.link}
          />
        )}
      </Helmet>
      <Grid
        container
        className={styles.HeaderRow}
        direction="row"
        justify="center"
        alignItems="center"
      >
        <Grid container item xs={10} md={4} className={styles.HeaderImgItem}>
          {fullArticle && (
            <img
              src={
                fullArticle._embedded["wp:featuredmedia"]
                  ? fullArticle._embedded["wp:featuredmedia"][0].source_url
                  : AppbarLogo
              }
              className={styles.SingleArticleHeaderImg}
              alt=""
            />
          )}
        </Grid>
        <Grid
          item
          xs={12}
          sm={12}
          md={8}
          className={styles.SingleArticleHeaderTextItem}
        >
          <Typography
            id="main"
            tabIndex={-1}
            className={styles.SingleArticleHeaderText}
            variant="h2"
            paragraph={true}
          >
            {fullArticle && parse(fullArticle.title.rendered)}
          </Typography>

          <Typography
            className={styles.SingleArticleHeaderSubtext}
            variant="body1"
            paragraph={true}
          >
            {fullArticle?.acf?.contributing_author
              ? `Authored by ${fullArticle.acf.contributing_author}`
              : ""}
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
            {prevArticle && <BlogPreviewCard article={prevArticle} />}
          </Grid>
          <Grid item xs={4}>
            <ReactRouterLinkButton
              url={BLOG_TAB_LINK}
              className={styles.PrevNextHeaderText}
              displayName="All Posts"
            />
          </Grid>
          <Grid item xs={4}>
            {nextArticle && <BlogPreviewCard article={nextArticle} />}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
