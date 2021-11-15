import { Box, Button, Grid, TextField, Typography } from "@material-ui/core";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import styles from "./News.module.scss";
import parse from "html-react-parser";
import { useParams } from "react-router-dom";
import {
  NEWS_TAB_LINK,
  fetchNewsData,
  ReactRouterLinkButton,
  ARTICLES_KEY,
  REACT_QUERY_OPTIONS,
  CONTACT_TAB_LINK,
  LinkWithStickyParams,
} from "../../../utils/urlutils";
import { Helmet } from "react-helmet";
import AppbarLogo from "../../../assets/AppbarLogo.png";
import NewsPreviewCard from "./NewsPreviewCard";
import { useQuery } from "react-query";
import ShareDialog from "../../../reports/ui/ShareDialog";
import ShareIcon from "@material-ui/icons/Share";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { Article } from "../NewsTab";
import { FALLBACK_NEWS_POSTS } from "./FallbackArticles";

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
  const [shareModalOpen, setShareModalOpen] = useState(false);

  let { slug }: { slug: string } = useParams();

  const { isLoading, error, data } = useQuery(
    ARTICLES_KEY,
    fetchNewsData,
    REACT_QUERY_OPTIONS
  );
  let articles: Article[] = [];

  if (data) articles = data.data;
  if (error || isLoading) articles = FALLBACK_NEWS_POSTS as any[];

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

  const articleImage = fullArticle?._embedded["wp:featuredmedia"]
    ? fullArticle._embedded["wp:featuredmedia"][0].source_url
    : "https://healthequitytracker.org/img/graphics/laptop-HET.png";

  const articleUrl = fullArticle?.link || "https://healthequitytracker.org";

  return (
    <Grid container className={styles.Grid}>
      <Helmet>
        <title>{`News${
          fullArticle ? " - " + parse(fullArticle.title.rendered) : ""
        } - Health Equity Tracker`}</title>
        {/* if cross-posted from external site, should be input on WP as canonical_url */}
        {fullArticle && (
          <link
            rel="canonical"
            href={fullArticle.acf?.canonical_url || fullArticle.link}
          />
        )}
        <meta name="description" content={ARTICLE_DESCRIPTION} />

        {/* <!-- Google / Search Engine Tags --> */}
        <meta itemProp="name" content="Health Equity Tracker" />
        <meta itemProp="description" content={ARTICLE_DESCRIPTION} />
        <meta itemProp="image" content={articleImage} />

        {/* <!-- Facebook Meta Tags --> */}
        <meta property="og:url" content={articleUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Health Equity Tracker" />
        <meta property="og:description" content={ARTICLE_DESCRIPTION} />
        <meta property="og:image" content={articleImage} />

        {/* <!-- Twitter Meta Tags --> */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Health Equity Tracker" />
        <meta name="twitter:description" content={ARTICLE_DESCRIPTION} />
        <meta name="twitter:image" content={articleImage} />
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
            className={styles.SingleArticleHeaderText}
            variant="h2"
            paragraph={true}
          >
            {fullArticle && parse(fullArticle.title.rendered)}
          </Typography>

          <Typography
            className={styles.SingleArticleDetailText}
            variant="body1"
          >
            {fullArticle?.acf?.contributing_author
              ? `Authored by ${fullArticle.acf.contributing_author}`
              : ""}
            {fullArticle?.acf?.contributing_author &&
            fullArticle?.acf?.post_nominals
              ? `, ${fullArticle.acf.post_nominals}`
              : ""}
          </Typography>

          <Typography
            className={styles.SingleArticleDetailText}
            variant="body1"
          >
            {fullArticle?.date && <>Published {prettyDate(fullArticle.date)}</>}
          </Typography>

          <Box textAlign="end">
            <ShareDialog
              article={fullArticle}
              shareModalOpen={shareModalOpen}
              setShareModalOpen={setShareModalOpen}
            />
            <Button
              color="primary"
              startIcon={<ShareIcon />}
              onClick={() => setShareModalOpen(true)}
              data-tip="Share this article on social media"
            >
              Share
            </Button>
          </Box>
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
            {fullArticle ? parse(fullArticle.content.rendered) : <></>}
            {fullArticle?.acf?.full_article_url ? (
              <Button
                variant="contained"
                color="primary"
                className={styles.PrimaryButton}
                href={fullArticle.acf.full_article_url}
              >
                Continue Reading
                {fullArticle?.acf?.friendly_site_name
                  ? ` on ${fullArticle.acf.friendly_site_name}`
                  : ""}{" "}
                <OpenInNewIcon />
              </Button>
            ) : (
              <></>
            )}

            <Box mt={5}>
              <Typography className={styles.HeaderSubtext} variant="body1">
                {fullArticle?.acf?.canonical_url && (
                  <span className={styles.ReprintNotice}>
                    Note: this article was originally published on{" "}
                    <a href={fullArticle?.acf?.canonical_url}>another site</a>,
                    and is reprinted here with permission from the author.
                  </span>
                )}
              </Typography>
            </Box>
          </div>
        </Grid>

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
      </Grid>
      <Grid
        container
        direction="column"
        justify="center"
        className={styles.NewsEmailSignup}
      >
        <Grid item>
          <p className={styles.EmailSignupNewsText}>
            Please{" "}
            <LinkWithStickyParams to={CONTACT_TAB_LINK}>
              contact us
            </LinkWithStickyParams>{" "}
            with any questions or concerns.
          </p>
          <p className={styles.EmailSignupNewsText}>
            For more information about health equity, please sign up for our
            Satcher Health Leadership Institute newsletter.
          </p>
        </Grid>
        <Grid item container justify="center" alignItems="center">
          <form
            action="https://satcherinstitute.us11.list-manage.com/subscribe?u=6a52e908d61b03e0bbbd4e790&id=3ec1ba23cd&"
            method="post"
            target="_blank"
          >
            <TextField
              id="Enter email address to sign up" // Accessibility label
              name="MERGE0"
              variant="outlined"
              className={styles.NewsEmailTextField}
              type="email"
              aria-label="Enter Email Address for Newsletter signup"
              placeholder="Enter email address"
            />
            <Button
              type="submit"
              color="primary"
              variant="contained"
              className={styles.NewsEmailAddressFormSubmit}
              aria-label="Sign Up for Newsletter in a new window"
            >
              Sign up
            </Button>
          </form>
        </Grid>
      </Grid>
    </Grid>
  );
}
