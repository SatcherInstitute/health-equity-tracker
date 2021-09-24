import { Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import styles from "../WhatIsHealthEquityPage.module.scss";
import { useQuery } from "../../../utils/urlutils";
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
  const { articles, categories } = props;

  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>({});
  const [selectedAuthor, setSelectedAuthor] = useState<string>("");

  const categoryParam: string | null = useQuery().get("category");
  const authorParam: string | null = useQuery().get("author");

  useEffect(() => {
    // filter articles by category query param if present
    if (categoryParam) {
      setSelectedCategory(
        categories.find((category: any) => category.name === categoryParam)
      );

      if (selectedCategory) {
        setFilteredArticles(
          articles.filter((article) =>
            article.categories.includes(selectedCategory.id)
          )
        );
      }
    } else {
      setFilteredArticles(articles);
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

  return (
    <Grid container className={styles.Grid}>
      <Helmet>
        <title>Blog - Health Equity Tracker</title>
      </Helmet>
      <Grid container className={styles.AllArticlesSection}>
        <Grid
          item
          xs={12}
          md={3}
          container
          direction="column"
          alignItems="center"
        >
          <BlogCategories categories={categories} />
          <BlogAuthors authors={authors} />
        </Grid>
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
      </Grid>
    </Grid>
  );
}

export default AllPosts;
