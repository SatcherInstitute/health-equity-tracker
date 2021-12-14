import {
  Box,
  Breadcrumbs,
  Card,
  Grid,
  Hidden,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import styles from "./News.module.scss";
import {
  fetchNewsData,
  useUrlSearchParams,
  ARTICLES_KEY,
  REACT_QUERY_OPTIONS,
  NEWS_TAB_LINK,
  CONTACT_TAB_LINK,
  LinkWithStickyParams,
} from "../../../utils/urlutils";
import { Helmet } from "react-helmet-async";
import NewsCategories from "./NewsCategories";
import NewsAuthors from "./NewsAuthors";
import NewsPreviewCard from "./NewsPreviewCard";
import { useQuery } from "react-query";
import { Article } from "../NewsTab";
import { Crumb } from "../../../cards/ui/MapBreadcrumbs";
import { useHistory } from "react-router";
import { Skeleton } from "@material-ui/lab";
import SignupSection from "../../ui/SignupSection";

export const ARTICLES_TERM = "Articles";
const NUM_OF_LOADING_SKELETONS = 6;

// set flag based on dev / prod
const HIDE_DEV_POSTS = window.location.hostname === "healthequitytracker.org";

/*
displays several loading indicator elements while blog content is fetched
*/
function ArticlesSkeleton(props: { doPulse: boolean }) {
  return (
    <Grid spacing={1} justify="space-between" container>
      {[...Array(NUM_OF_LOADING_SKELETONS)].map((_, i) => {
        return (
          <Grid
            item
            xs={12}
            sm={5}
            container
            direction="column"
            alignItems="center"
            key={i}
          >
            <Skeleton
              animation={props.doPulse && "wave"}
              variant="rect"
              height={100}
              width={150}
            ></Skeleton>
            <Skeleton
              animation={false}
              variant="text"
              height={36}
              width={250}
            ></Skeleton>
            <Box mb={5}>
              <Skeleton
                animation={props.doPulse && "wave"}
                variant="text"
                height={36}
                width={175}
              ></Skeleton>
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
}

function PinnedArticles({ articles }: { articles: Article[] }) {
  return articles.length ? (
    <Card elevation={3}>
      <Typography
        tabIndex={-1}
        className={styles.FeaturedArticlesHeaderText}
        variant="h6"
      >
        Featured:
      </Typography>
      <Grid container>
        {articles.map((post: any) => {
          return (
            <Grid
              item
              xs={12}
              sm={6}
              className={styles.AllArticlesItem}
              key={post.id}
            >
              <NewsPreviewCard article={post} />
            </Grid>
          );
        })}
      </Grid>
    </Card>
  ) : null;
}

function AllPosts() {
  // articles matching client applied filters (author, category, etc)
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("");

  const history = useHistory();

  const categoryParam: string | null = useUrlSearchParams().get("category");
  const authorParam: string | null = useUrlSearchParams().get("author");

  const { isLoading, error, data }: any = useQuery(
    ARTICLES_KEY,
    fetchNewsData,
    REACT_QUERY_OPTIONS
  );

  let articles: Article[] = [];

  if (data) articles = data!.data;

  // hide PREVIEW ON DEV posts if this is PROD
  if (HIDE_DEV_POSTS)
    articles = articles.filter(
      (article) => article.acf.preview_on_dev !== true
    );

  useEffect(() => {
    // filter articles by category query param if present
    if (categoryParam) {
      setSelectedCategory(
        categories.find((category: string) => {
          return category === categoryParam;
        }) as string
      );
      setSelectedAuthor("");

      if (selectedCategory && articles) {
        setFilteredArticles(
          articles.filter(
            (article: Article) =>
              article._embedded["wp:term"] &&
              article._embedded["wp:term"][0].some(
                (term: { name: string }) => term.name === selectedCategory
              )
          )
        );
      }
    } else {
      setFilteredArticles(
        articles.filter((article: Article) => !article.sticky)
      );
      setSelectedCategory("");
    }
  }, [articles, categories, categoryParam, selectedCategory]);

  useEffect(() => {
    // filter articles by author query param if present
    if (authorParam) {
      setSelectedAuthor(
        authors.find((author: string) => {
          return author === authorParam;
        }) as string
      );
      setSelectedCategory("");

      if (selectedAuthor) {
        setFilteredArticles(
          articles.filter(
            (article: Article) =>
              article.acf.contributing_author === selectedAuthor
          )
        );
      }
    } else {
      setFilteredArticles(
        articles.filter((article: Article) => !article.sticky)
      );
      setSelectedAuthor("");
    }
  }, [articles, authorParam, authors, selectedAuthor]);

  // extract and populate list of authors (from ALL posts, not just filtered ones)
  useEffect(() => {
    const allAuthorsSet = new Set();

    articles &&
      articles.forEach(
        (article: Article) =>
          article.acf.contributing_author &&
          allAuthorsSet.add(article.acf.contributing_author)
      );

    setAuthors(Array.from(allAuthorsSet) as string[]);
  }, [articles]);

  // extract and populate list of categories (from ALL posts, not just filtered ones)
  useEffect(() => {
    const allCategoriesSet = new Set();

    articles &&
      articles.forEach((article: Article) => {
        if (article._embedded["wp:term"] !== undefined) {
          article._embedded["wp:term"][0].forEach((term: { name: string }) =>
            allCategoriesSet.add(term.name)
          );
        }
      });

    setCategories(Array.from(allCategoriesSet) as string[]);
  }, [articles]);

  // featured "sticky" articles
  const pinnedArticles = articles?.filter((post: Article) => post?.sticky);

  return (
    articles && (
      <Grid container className={styles.Grid}>
        <Helmet>
          <title>News - Health Equity Tracker</title>
        </Helmet>
        <Grid container className={styles.AllArticlesSection}>
          <Hidden smDown>
            <Grid item md={3} container direction="column" alignItems="center">
              <NewsCategories categories={categories} />
              <NewsAuthors authors={authors} />
            </Grid>
          </Hidden>

          <Grid item xs={12} sm={12} md={9}>
            <Box mx={5}>
              <div className={styles.AllArticlesHeader}>
                <Grid item>
                  <Typography
                    id="main"
                    tabIndex={-1}
                    className={styles.AllArticlesHeaderText}
                    variant="h2"
                  >
                    News and Stories
                  </Typography>
                </Grid>
                <Grid item>
                  <p className={styles.AllArticlesHeaderSubtext}>
                    We believe in the power of storytelling. The Health Equity
                    Tracker is designed to enable transformative change through
                    data, but we know that is only part of the picture. Here,
                    you will find news and stories from the Satcher Health
                    Leadership Institute, partners, guest authors, and other
                    contributors that go beyond the numbers to share insights
                    and analysis into the Health Equity movement.
                  </p>

                  <p className={styles.AllArticlesHeaderSubtext}>
                    Health Equity is fundamentally about empowering voices to be
                    heard, and experiences to be seen and shared. To share your
                    Health Equity news and stories, please{" "}
                    <LinkWithStickyParams to={CONTACT_TAB_LINK}>
                      contact us
                    </LinkWithStickyParams>
                    .
                  </p>
                </Grid>
              </div>
            </Box>

            <Grid item container justify="center">
              <Box m={5}>
                {/* show featured card with "sticky" articles marked PIN TO TOP if any */}
                {selectedAuthor?.length === 0 &&
                  selectedCategory?.length === 0 && (
                    <PinnedArticles articles={pinnedArticles} />
                  )}

                {/* if there is a filter in place, show the breadcrumbs */}
                {!(
                  selectedAuthor?.length === 0 && selectedCategory?.length === 0
                ) && (
                  <Breadcrumbs separator="›" aria-label={"filter applied"}>
                    <Crumb
                      text={ARTICLES_TERM}
                      isClickable={true}
                      onClick={() => {
                        history.push(NEWS_TAB_LINK);
                      }}
                    />
                    {selectedAuthor?.length > 0 && (
                      <Crumb
                        text={`Author: ${selectedAuthor}`}
                        isClickable={false}
                      />
                    )}
                    {selectedCategory?.length > 0 && (
                      <Crumb
                        text={`Category: ${selectedCategory}`}
                        isClickable={false}
                      />
                    )}
                  </Breadcrumbs>
                )}
              </Box>

              {/* all posts matching client applied filters */}
              <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="flex-start"
              >
                {filteredArticles &&
                  filteredArticles.map((post: any) => {
                    return (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        className={styles.AllArticlesItem}
                        key={post.id}
                      >
                        <Box my={2}>
                          <NewsPreviewCard article={post} />
                        </Box>
                      </Grid>
                    );
                  })}
              </Grid>
              <Grid container direction="column" justify="center">
                {isLoading && (
                  <>
                    <ArticlesSkeleton doPulse={true} />
                    <Box mt={5}>
                      <i>Updating articles...</i>
                    </Box>
                  </>
                )}
                {error && !isLoading && (
                  <>
                    <ArticlesSkeleton doPulse={false} />
                    <Box mt={5}>
                      <i>Problem updating articles.</i>
                    </Box>
                  </>
                )}
              </Grid>
            </Grid>
          </Grid>
          <Hidden mdUp>
            <Grid
              item
              container
              direction="row"
              justify="space-around"
              alignContent="center"
            >
              <Grid item xs={12}>
                <div className={styles.Divider}></div>
              </Grid>
              <Grid item xs={12} sm={6} container justify="center">
                <NewsCategories categories={categories} />
              </Grid>

              <Grid item xs={12} sm={6} container justify="center">
                <NewsAuthors authors={authors} />
              </Grid>
            </Grid>
          </Hidden>
        </Grid>
        <SignupSection />
      </Grid>
    )
  );
}

export default AllPosts;
