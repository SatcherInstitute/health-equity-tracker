import { Grid } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../WhatIsHealthEquityPage.module.scss";
import parse from "html-react-parser";
import { BLOG_TAB_LINK, useQuery } from "../../../utils/urlutils";
import { Helmet } from "react-helmet";
import AppbarLogo from "../../../assets/AppbarLogo.png";
import BlogCategories from "../../ui/BlogCategories";
import BlogAuthors from "../../ui/BlogAuthors";

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
    console.log(categoryParam, "cat param");
    if (categoryParam.current) {
      setSelectedCategory(
        categories.find(
          (category: any) => category.name === categoryParam.current
        )
      );

      if (selectedCategory) {
        setFilteredArticles(
          articles.filter((article) => {
            // console.log(article.categories, "categories");
            // console.log(selectedCategory.id, "sel cat id");
            return article.categories.includes(selectedCategory.id);
          })
        );
      }
    } else {
      setFilteredArticles(articles);
    }
  }, [articles, categories, selectedCategory]);

  useEffect(() => {
    console.log(authorParam, "author param");
    // filter articles by author query param if present
    if (authorParam.current) {
      console.log("yep");
      setSelectedAuthor(
        authors.find((author: string) => {
          // console.log(author, "iterated author");
          // console.log(authorParam, "author param");
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
      {console.log(articles, "all")}
      {console.log(filteredArticles, "filtered")}
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
                  <img
                    className={styles.AllPostsBigImg}
                    src={
                      post._embedded["wp:featuredmedia"]
                        ? post._embedded["wp:featuredmedia"][0].source_url
                        : AppbarLogo
                    }
                    alt=""
                  />
                  <Link
                    to={`${BLOG_TAB_LINK}/${post.slug}`}
                    className={styles.AllArticlesTitleLink}
                  >
                    <h3 className={styles.AllArticlesTitleText}>
                      {parse(post.title.rendered)}
                    </h3>
                  </Link>
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
