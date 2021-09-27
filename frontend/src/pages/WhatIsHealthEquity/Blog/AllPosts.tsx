import { Grid, Hidden } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import styles from "../WhatIsHealthEquityPage.module.scss";
import { useUrlSearchParams } from "../../../utils/urlutils";
import { Helmet } from "react-helmet";
import BlogCategories from "../../ui/BlogCategories";
import BlogAuthors from "../../ui/BlogAuthors";
import BlogPreviewCard from "./BlogPreviewCard";
import { Article } from "../../../utils/useFetchBlog";

export interface AllPostsProps {
  articles: any[];
  categories: any[];
}

function AllPosts(props: AllPostsProps) {
  const { articles } = props;

  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>({});
  const [selectedAuthor, setSelectedAuthor] = useState<string>("");

  const categoryParam: string | null = useUrlSearchParams().get("category");
  const authorParam: string | null = useUrlSearchParams().get("author");

  useEffect(() => {
    // filter articles by category query param if present
    if (categoryParam) {
      setSelectedCategory(
        categories.find((category: string) => {
          return category === categoryParam;
        }) as string
      );

      if (selectedCategory) {
        setFilteredArticles(
          articles.filter(
            (article) =>
              article._embedded["wp:term"] &&
              article._embedded["wp:term"][0].some(
                (term: { name: string }) => term.name === selectedCategory
              )
          )
        );
      }
    } else setFilteredArticles(articles);
  }, [articles, categoryParam, categories, selectedCategory]);

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
            (article) => article.acf.contributing_author === selectedAuthor
          )
        );
      }
    } else setFilteredArticles(articles);
  }, [articles, authorParam, authors, selectedAuthor]);

  // extract and set authors (for ALL posts, not just filtered ones)
  useEffect(() => {
    const allAuthorsSet = new Set();

    articles.forEach(
      (article) =>
        article.acf.contributing_author &&
        allAuthorsSet.add(article.acf.contributing_author)
    );

    setAuthors(Array.from(allAuthorsSet) as string[]);
  }, [articles]);

  // extract and set categories (for ALL posts, not just filtered ones)
  useEffect(() => {
    const allCategoriesSet = new Set();

    articles.forEach((article) => {
      if (article._embedded["wp:term"] !== undefined) {
        article._embedded["wp:term"][0].forEach((term: { name: string }) =>
          allCategoriesSet.add(term.name)
        );
      }
    });

    setCategories(Array.from(allCategoriesSet) as string[]);
  }, [articles]);

  return (
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
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="flex-start"
          >
            {filteredArticles.map((post: any) => {
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
  );
}

export default AllPosts;
