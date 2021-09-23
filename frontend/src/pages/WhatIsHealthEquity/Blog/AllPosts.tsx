import { Grid } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import styles from "../WhatIsHealthEquityPage.module.scss";
import { useQuery } from "../../../utils/urlutils";
import { Helmet } from "react-helmet";
import BlogCategories from "../../ui/BlogCategories";
import BlogAuthors from "../../ui/BlogAuthors";
import BlogPreviewCard from "./BlogPreviewCard";

export interface AllPostsProps {
  articles: any[];
  categories: any[];
}

function AllPosts(props: AllPostsProps) {
  const { articles, categories } = props;

  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);

  const [authors, setAuthors] = useState<string[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<any>({});

  const [selectedAuthor, setSelectedAuthor] = useState<string>("");

  // const [categoryParam, setCategoryParam] = useState<string>("");
  // const [authorParam, setAuthorParam] = useState<string>("");

  const categoryParam = useRef(useQuery().get("category"));
  const authorParam = useRef(useQuery().get("author"));

  useEffect(() => {
    // filter articles by category query param if present
    if (categoryParam.current) {
      setSelectedCategory(
        categories.find(
          (category: any) => category.name === categoryParam.current
        )
      );

      if (selectedCategory) {
        setFilteredArticles(
          articles.filter((article) => {
            return article.categories.includes(selectedCategory.id);
          })
        );
      }
    } else {
      setFilteredArticles(articles);
    }
  }, [articles, categories, selectedCategory]);

  useEffect(() => {
    // filter articles by author query param if present
    if (authorParam.current) {
      setSelectedAuthor(
        authors.find((author: string) => {
          return author === authorParam.current;
        }) as string
      );

      if (selectedAuthor) {
        setFilteredArticles(
          articles.filter((article) => {
            return article.acf.contributing_author === selectedAuthor;
          })
        );
      }
    }
  }, [articles, authors, selectedAuthor]);

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
