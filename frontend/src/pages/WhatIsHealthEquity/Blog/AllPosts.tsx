import { Box, Card, Grid, Hidden, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import styles from "../WhatIsHealthEquityPage.module.scss";
import {
  fetchBlogData,
  useUrlSearchParams,
  ARTICLES_KEY,
  REACT_QUERY_OPTIONS,
  EXPLORE_DATA_PAGE_LINK,
} from "../../../utils/urlutils";
import { Helmet } from "react-helmet";
import BlogCategories from "../../ui/BlogCategories";
import BlogAuthors from "../../ui/BlogAuthors";
import BlogPreviewCard from "./BlogPreviewCard";
import { useQuery } from "react-query";
import { Article } from "../BlogTab";

function PinnedArticles({ articles }: { articles: Article[] }) {
  return (
    <Box m={5}>
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
    </Box>
  );
}

function AllPosts() {
  // articles matching client applied filters (author, category, etc)
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("");

  const categoryParam: string | null = useUrlSearchParams().get("category");
  const authorParam: string | null = useUrlSearchParams().get("author");

  const { isLoading, error, data }: any = useQuery(
    ARTICLES_KEY,
    fetchBlogData,
    REACT_QUERY_OPTIONS
  );
  const articles = data?.data;

  useEffect(() => {
    // filter articles by category query param if present
    if (categoryParam) {
      setSelectedCategory(
        categories.find((category: string) => {
          return category === categoryParam;
        }) as string
      );

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
    } else setFilteredArticles(articles);
  }, [categoryParam, categories, selectedCategory, articles]);

  useEffect(() => {
    // filter articles by author query param if present
    if (authorParam) {
      setSelectedAuthor(
        authors.find((author: string) => {
          return author === authorParam;
        }) as string
      );

      if (selectedAuthor) {
        setFilteredArticles(
          articles.filter(
            (article: { acf: { contributing_author: string } }) =>
              article.acf.contributing_author === selectedAuthor
          )
        );
      }
    } else setFilteredArticles(articles);
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

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>An error has occurred: {error.message}</p>;

  if (isLoading) return <i>loading...</i>;
  if (error) return <i>Error loading blog posts. {error}</i>;

  return (
    articles && (
      <Grid container className={styles.Grid}>
        <Helmet>
          <title>Blog - Health Equity Tracker</title>
        </Helmet>
        <Grid container className={styles.AllArticlesSection}>
          <Hidden smDown>
            <Grid item md={3} container direction="column" alignItems="center">
              <BlogCategories categories={categories} />
              <BlogAuthors authors={authors} />
            </Grid>
          </Hidden>

          <Grid item xs={12} sm={12} md={9}>
            <div className={styles.AllArticlesHeader}>
              <Grid item>
                <Typography
                  id="main"
                  tabIndex={-1}
                  className={styles.AllArticlesHeaderText}
                  variant="h2"
                >
                  Health Equity Tracker Blog
                </Typography>
              </Grid>
              <Grid item>
                <p className={styles.AllArticlesHeaderSubtext}>
                  Our blog features perspectives from Health Equity Initiative's
                  team and members, as well as guest authors. We cover
                  cross-sectoral efforts, narratives, news, and stories of hope,
                  healing, community engagement, and partnerships to advance
                  health equity.
                </p>
                <p>
                  To investigate inequities and compare health outcomes in your
                  area, click on{" "}
                  <a
                    href={EXPLORE_DATA_PAGE_LINK}
                    className={styles.AllArticlesExploreLink}
                  >
                    Explore the Data
                  </a>
                  .
                </p>
              </Grid>
            </div>

            <Grid item container>
              {/* "sticky" articles marked PIN TO TOP in wp dashboard. Only show if user hasn't applied filters */}
              {!selectedAuthor?.length && !selectedCategory?.length && (
                <PinnedArticles
                  articles={articles.filter((post: Article) => post.sticky)}
                />
              )}

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
