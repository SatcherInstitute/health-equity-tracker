import { Box, Button, Grid, Typography } from "@material-ui/core";

import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import styles from "./News.module.scss";
import { Link, Redirect, useParams } from "react-router-dom";
import {
  fetchNewsData,
  ReactRouterLinkButton,
  ARTICLES_KEY,
  REACT_QUERY_OPTIONS,
} from "../../../utils/urlutils";
import { NEWS_TAB_LINK } from "../../../utils/internalRoutes";
import { Helmet } from "react-helmet-async";
import NewsPreviewCard from "./NewsPreviewCard";
import { useQuery } from "react-query";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { Article } from "../NewsTab";
import hetLogo from "../../../assets/AppbarLogo.png";
import { Skeleton } from "@material-ui/lab";
import SignupSection from "../../ui/SignupSection";
import ShareButtons, {
  ARTICLE_DESCRIPTION,
} from "../../../reports/ui/ShareButtons";
import { getHtml } from "../../../utils/urlutils";
import LazyLoad from "react-lazyload";

function prettyDate(dateString: string) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options as any);
}

export default function SinglePost() {
  const [fullArticle, setFullArticle] = useState<Article>();
  const [prevArticle, setPrevArticle] = useState<Article>();
  const [nextArticle, setNextArticle] = useState<Article>();

  let { slug }: { slug?: string } = useParams();

  // FETCH ARTICLES
  const { data, isLoading, error } = useQuery(
    ARTICLES_KEY,
    fetchNewsData,
    REACT_QUERY_OPTIONS
  );

  // on page load, get prev,full, next article based on fullArticle URL slug
  useEffect(() => {
    if (data?.data) {
      const fullArticleIndex = data.data.findIndex(
        (article: Article) => article.slug === slug
      );
      setFullArticle(data.data[fullArticleIndex]);
      // previous and next articles wrap around both ends of the array
      setPrevArticle(
        data.data[
          fullArticleIndex - 1 >= 0
            ? fullArticleIndex - 1
            : data.data.length - 1
        ]
      );
      setNextArticle(data.data[(fullArticleIndex + 1) % data.data.length]);
    }
  }, [data?.data, slug]);

  const articleCategories = fullArticle?._embedded?.["wp:term"]?.[0];

  // get the large version of the image if available, if not try for the full version
  const articleImage =
    fullArticle?._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes
      ?.large?.source_url ||
    fullArticle?._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes
      ?.full?.source_url;

  const articleImageAltText =
    fullArticle?._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || "";

  return (
    <>
      {error && (
        <Redirect
          to={{
            pathname: "/404",
          }}
        />
      )}
      <Grid container className={styles.Grid}>
        <Helmet>
          <title>{`News${
            fullArticle ? ` - ${fullArticle?.title?.rendered}` : ""
          } - Health Equity Tracker`}</title>
          {/* if cross-posted from external site, should be input on WP as canonical_url */}
          {fullArticle && (
            <link
              rel="canonical"
              href={fullArticle.acf?.canonical_url || fullArticle.link}
            />
          )}
          <meta name="description" content={ARTICLE_DESCRIPTION} />
        </Helmet>

        {/* HEADER ROW */}
        <Grid
          container
          className={styles.HeaderRow}
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          {/* IMAGE SECTION OF HEADER OR LOADING INDICATOR */}

          <Grid container item xs={10} md={4} className={styles.HeaderImgItem}>
            {isLoading && (
              <Skeleton width={300} height={300} animation="wave"></Skeleton>
            )}
            {error && (
              <Skeleton width={300} height={300} animation={false}></Skeleton>
            )}
            {!isLoading && !error && (
              <img
                src={articleImage || hetLogo}
                className={styles.SingleArticleHeaderImg || hetLogo}
                alt={articleImageAltText}
                width={200}
                height={100}
              />
            )}
          </Grid>

          {/* TEXT SECTION OF HEADER */}
          <Grid
            item
            xs={12}
            sm={12}
            md={8}
            className={styles.SingleArticleHeaderTextItem}
          >
            {/* ARTICLE TITLE OR LOADING INDICATOR */}
            <Typography
              className={styles.SingleArticleHeaderText}
              variant="h2"
              paragraph={true}
              component="div"
            >
              {isLoading ? (
                <Skeleton></Skeleton>
              ) : (
                getHtml(fullArticle?.title?.rendered || "")
              )}
            </Typography>

            {/* AUTHOR(S) OR LOADING OR NOTHING */}
            <Typography
              className={styles.SingleArticleDetailText}
              variant="body1"
            >
              {fullArticle?.acf?.contributing_author ? (
                <>
                  Authored by{" "}
                  <Link
                    className={styles.FilterLink}
                    to={`${NEWS_TAB_LINK}?author=${fullArticle.acf.contributing_author}`}
                  >
                    {fullArticle.acf.contributing_author}
                  </Link>
                </>
              ) : isLoading ? (
                <Skeleton></Skeleton>
              ) : (
                <></>
              )}

              {fullArticle?.acf?.contributing_author &&
              fullArticle?.acf?.post_nominals
                ? `, ${fullArticle.acf.post_nominals}`
                : ""}
            </Typography>

            {/* PUBLISH DATE WITH LOADING INDICATOR */}
            <Typography
              className={styles.SingleArticleDetailText}
              variant="body1"
            >
              {fullArticle?.date ? (
                <>Published {prettyDate(fullArticle.date)}</>
              ) : (
                <Skeleton width="50%"></Skeleton>
              )}
            </Typography>

            {/* OPTIONAL ARTICLE CATEGORIES */}
            {articleCategories && (
              <Typography
                className={styles.SingleArticleDetailText}
                variant="body1"
              >
                Categorized under:{" "}
                {articleCategories.map((categoryChunk, i) => (
                  <span key={categoryChunk.id}>
                    <Link
                      className={styles.CategoryTag}
                      to={`${NEWS_TAB_LINK}?category=${categoryChunk.name}`}
                    >
                      {categoryChunk.name}
                    </Link>
                    {i < articleCategories.length - 1 ? ", " : ""}
                  </span>
                ))}
              </Typography>
            )}

            {/* SOCIAL MEDIA ICONS */}
            <ShareButtons article={fullArticle} />
          </Grid>
        </Grid>

        {/* ARTICLE CONTENT SECTION */}
        <Grid
          container
          className={styles.NewsAndStoriesRow}
          direction="row"
          justifyContent="center"
        >
          <Grid item>
            <article className={styles.FullArticleContainer}>
              {/* RENDER WP ARTICLE HTML */}
              {fullArticle && getHtml(fullArticle.content?.rendered)}

              {/* OPTIONALLY RENDER CONTINUE READING BUTTON */}
              {fullArticle?.acf?.full_article_url && (
                <Box mt={5}>
                  <Button
                    variant="contained"
                    color="primary"
                    className={styles.FullLink}
                    href={fullArticle.acf.full_article_url}
                  >
                    Continue Reading
                    {fullArticle?.acf?.friendly_site_name
                      ? ` on ${fullArticle.acf.friendly_site_name}`
                      : ""}{" "}
                    <OpenInNewIcon />
                  </Button>
                </Box>
              )}

              {/* OPTIONALLY RENDER REPRINT NOTICE */}
              <Box mt={5}>
                <Typography className={styles.HeaderSubtext} variant="body1">
                  {fullArticle?.acf?.canonical_url && (
                    <span className={styles.ReprintNotice}>
                      Note: this article was originally published on{" "}
                      <a href={fullArticle?.acf?.canonical_url}>another site</a>
                      , and is reprinted here with permission.
                    </span>
                  )}
                </Typography>
              </Box>
            </article>
          </Grid>

          {/* PREV / NEXT ARTICLES NAV */}
          <LazyLoad offset={300} height={300} once>
            <Grid container className={styles.PrevNextSection}>
              <Grid item xs={12} md={4}>
                {prevArticle && (
                  <NewsPreviewCard article={prevArticle} arrow={"prev"} />
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                <ReactRouterLinkButton
                  url={NEWS_TAB_LINK}
                  className={styles.PrevNextHeaderText}
                  displayName="All Posts"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                {nextArticle && (
                  <>
                    <NewsPreviewCard article={nextArticle} arrow={"next"} />
                  </>
                )}
              </Grid>
            </Grid>
          </LazyLoad>
        </Grid>

        {/* EMAIL SIGNUP  */}
        <SignupSection />
      </Grid>
    </>
  );
}
