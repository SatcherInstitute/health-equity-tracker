import { Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../WhatIsHealthEquityPage.module.scss";
import parse from "html-react-parser";
import {
  BLOG_TAB_LINK,
  useQuery,
  ALL_CATEGORIES,
  BLOG_URL,
  WP_API,
} from "../../../utils/urlutils";
import { Helmet } from "react-helmet";
import AppbarLogo from "../../../assets/AppbarLogo.png";
import BlogCategories from "../../ui/BlogCategories";
import BlogAuthors from "../../ui/BlogAuthors";
import axios from "axios";

function AllPosts({ articles }: { articles: any[] }) {
  const [categories, setCategories] = useState<any[]>([]);
  const categoryParam = useQuery().get("category");
  let selectedCategory: { id: any } = { id: null };

  // filter articles by query param if present
  if (categoryParam) {
    selectedCategory = categories.find(
      (category: any) => category.name === categoryParam
    );

    if (selectedCategory) {
      articles = articles.filter((article) => {
        console.log(article.categories, "categories");
        console.log(selectedCategory.id, "sel cat id");
        return article.categories.includes(selectedCategory.id);
      });
    }
  }

  // fetch categories
  useEffect(() => {
    axios
      .get(`${BLOG_URL + WP_API + ALL_CATEGORIES}`)
      .then((categories) => {
        // console.log(categories);
        setCategories(categories.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

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
          <BlogAuthors articles={articles} />
        </Grid>
        <Grid item xs={12} sm={12} md={9}>
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="flex-start"
          >
            {articles.map((post: any) => {
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
