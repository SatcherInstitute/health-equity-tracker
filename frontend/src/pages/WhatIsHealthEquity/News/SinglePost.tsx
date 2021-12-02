import { Box, Button, Grid, Typography, Link } from "@material-ui/core";

import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import styles from "./News.module.scss";
import { Redirect, useParams } from "react-router-dom";
import {
  NEWS_TAB_LINK,
  fetchNewsData,
  ReactRouterLinkButton,
  ARTICLES_KEY,
  REACT_QUERY_OPTIONS,
} from "../../../utils/urlutils";
import { Helmet } from "react-helmet-async";
import NewsPreviewCard from "./NewsPreviewCard";
import { useQuery } from "react-query";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { Article } from "../NewsTab";
import hetLogo from "../../../assets/AppbarLogo.png";
import { Skeleton } from "@material-ui/lab";
import SignupSection from "../../ui/SignupSection";
import ShareButtons from "../../../reports/ui/ShareButtons";
import { getHtml } from "../../../utils/urlutils";
import LazyLoad from "react-lazyload";

export const ARTICLE_DESCRIPTION =
  "Article from the Health Equity Tracker: a free-to-use data and visualization platform that is enabling new insights into the impact of COVID-19 and other determinants of health on marginalized groups in the United States.";

function prettyDate(dateString: string) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options as any);
}

export default function SinglePost() {
  const [fullArticle, setFullArticle] = useState<Article>();
  const [prevArticle, setPrevArticle] = useState<Article>();
  const [nextArticle, setNextArticle] = useState<Article>();

  let { slug }: { slug: string } = useParams();

  const { data, isLoading, error } = useQuery(
    ARTICLES_KEY,
    fetchNewsData,
    REACT_QUERY_OPTIONS
  );
  let articles: Article[] = [];

  if (data) articles = data.data;

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

  // const articleUrl = fullArticle?.link || "https://healthequitytracker.org";

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
        <Grid
          container
          className={styles.HeaderRow}
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Grid container item xs={10} md={4} className={styles.HeaderImgItem}>
            {isLoading && (
              <Skeleton width={300} height={300} animation="wave"></Skeleton>
            )}
            {error && (
              <Skeleton width={300} height={300} animation={false}></Skeleton>
            )}
            {!isLoading && !error && (
              <img
                src={articleImage}
                className={styles.SingleArticleHeaderImg || hetLogo}
                alt={articleImageAltText}
                width={200}
                height={100}
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
              className={styles.SingleArticleHeaderText}
              variant="h2"
              paragraph={true}
            >
              {isLoading ? (
                <Skeleton></Skeleton>
              ) : (
                <span
                  dangerouslySetInnerHTML={{
                    __html: fullArticle?.title?.rendered || "",
                  }}
                ></span>
              )}
            </Typography>

            <Typography
              className={styles.SingleArticleDetailText}
              variant="body1"
            >
              {fullArticle?.acf?.contributing_author ? (
                <>
                  Authored by{" "}
                  <Link
                    className={styles.FilterLink}
                    href={`${NEWS_TAB_LINK}?author=${fullArticle.acf.contributing_author}`}
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

            {articleCategories ? (
              <Typography
                className={styles.SingleArticleDetailText}
                variant="body1"
              >
                Categorized under:{" "}
                {articleCategories.map((categoryChunk, i) => (
                  <span key={categoryChunk.id}>
                    <Link
                      className={styles.CategoryTag}
                      href={`${NEWS_TAB_LINK}?category=${categoryChunk.name}`}
                    >
                      {categoryChunk.name}
                    </Link>
                    {i < articleCategories.length - 1 ? ", " : ""}
                  </span>
                ))}
              </Typography>
            ) : (
              <></>
            )}

            <ShareButtons article={fullArticle} />
          </Grid>
        </Grid>
        <Grid
          container
          className={styles.NewsAndStoriesRow}
          direction="row"
          justify="center"
        >
          <Grid item>
            <article className={styles.FullArticleContainer}>
              {fullArticle ? getHtml(fullArticle.content.rendered) : <></>}
              {fullArticle?.acf?.full_article_url ? (
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
              ) : (
                <></>
              )}

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

        <SignupSection />
      </Grid>
    </>
  );
}
