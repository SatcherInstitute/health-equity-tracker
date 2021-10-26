import {
  Box,
  Breadcrumbs,
  Card,
  Grid,
  Hidden,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import styles from "../WhatIsHealthEquityPage.module.scss";
import {
  fetchBlogData,
  useUrlSearchParams,
  ARTICLES_KEY,
  REACT_QUERY_OPTIONS,
  BLOG_TAB_LINK,
} from "../../../utils/urlutils";
import { Helmet } from "react-helmet";
import BlogCategories from "../../ui/BlogCategories";
import BlogAuthors from "../../ui/BlogAuthors";
import BlogPreviewCard from "./BlogPreviewCard";
import { useQuery } from "react-query";
import { Article } from "../BlogTab";
import { Crumb } from "../../../cards/ui/MapBreadcrumbs";
import { FALLBACK_BLOG_POSTS } from "./FallbackArticles.js";
import { useHistory } from "react-router";

export const ARTICLES_TERM = "Articles";

function PinnedArticles({ articles }: { articles: Article[] }) {
  return articles.length ? (
    <Card elevation={3}>
      <Typography
        tabIndex={-1}
        className={styles.FeaturedArticlesHeaderText}
        variant="h6"
      >
        Featured
      </Typography>
      <Grid container>
        {articles.map((post: any) => {
          return (
            <Grid
              item
              xs={12}
              sm={6}
              // md={3}
              className={styles.AllArticlesItem}
              key={post.id}
            >
              <BlogPreviewCard article={post} />
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
    fetchBlogData,
    REACT_QUERY_OPTIONS
  );

  let articles: Article[] = [];
  if (data) articles = data!.data;
  else if (error || isLoading) {
    articles = FALLBACK_BLOG_POSTS as any[];
  }

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
            (article: any) =>
              article._embedded["wp:term"] &&
              article._embedded["wp:term"][0].some(
                (term: { name: string }) => term.name === selectedCategory
              )
          )
        );
      }
    } else {
      setFilteredArticles(articles);
      setSelectedCategory("");
    }
  }, [categoryParam, categories, selectedCategory, articles]);

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
            (article: { acf: { contributing_author: string } }) =>
              article.acf.contributing_author === selectedAuthor
          )
        );
      }
    } else {
      setFilteredArticles(articles);
      setSelectedAuthor("");
    }
  }, [articles, authorParam, authors, selectedAuthor]);

  // extract and set authors (for ALL posts, not just filtered ones)
  useEffect(() => {
    const allAuthorsSet = new Set();

    articles &&
      articles.forEach(
        (article: any) =>
          article.acf.contributing_author &&
          allAuthorsSet.add(article.acf.contributing_author)
      );

    setAuthors(Array.from(allAuthorsSet) as string[]);
  }, [articles]);

  // extract and set categories (for ALL posts, not just filtered ones)
  useEffect(() => {
    const allCategoriesSet = new Set();

    articles &&
      articles.forEach((article: any) => {
        if (article._embedded["wp:term"] !== undefined) {
          article._embedded["wp:term"][0].forEach((term: { name: string }) =>
            allCategoriesSet.add(term.name)
          );
        }
      });

    setCategories(Array.from(allCategoriesSet) as string[]);
  }, [articles]);

  const pinnedArticles = articles?.filter((post: Article) => post?.sticky);

  // if (isLoading) return <i>loading...</i>;
  // if (error) return <i>Error loading posts.</i>;

  return (
    articles && (
      <Grid container className={styles.Grid}>
        <Helmet>
          <title>News - Health Equity Tracker</title>
        </Helmet>
        <Grid container className={styles.AllArticlesSection}>
          <Hidden smDown>
            <Grid item md={3} container direction="column" alignItems="center">
              <BlogCategories categories={categories} />
              <BlogAuthors authors={authors} />
            </Grid>
          </Hidden>

          <Grid item xs={12} sm={12} md={9}>
            <Box m={5}>
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
                    Read perspectives from Health Equity Initiative's team and
                    members, as well as blog posts from guest authors. We cover
                    cross-sectoral efforts, narratives, news, and stories of
                    hope, healing, community engagement, and partnerships to
                    advance health equity.
                  </p>
                </Grid>
              </div>
            </Box>

            <Grid item container>
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
                        history.push(BLOG_TAB_LINK);
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
                        md={4}
                        className={styles.AllArticlesItem}
                        key={post.id}
                      >
                        <BlogPreviewCard article={post} />
                      </Grid>
                    );
                  })}
              </Grid>
              <Grid container justify="center">
                {isLoading && <i>Loading recent articles...</i>}
                {error && !isLoading && (
                  <i>Problem loading; displaying only saved articles.</i>
                )}
              </Grid>
            </Grid>
          </Grid>
          <Hidden mdUp>
            <Grid
              item
              container
              xs={12}
              wrap="nowrap"
              direction="row"
              justify="space-around"
            >
              <Grid item>
                <BlogCategories categories={categories} />
              </Grid>

              <Grid item>
                <BlogAuthors authors={authors} />
              </Grid>
            </Grid>
          </Hidden>
        </Grid>
      </Grid>
    )
  );
}

export default AllPosts;
