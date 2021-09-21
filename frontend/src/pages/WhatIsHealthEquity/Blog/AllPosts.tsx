import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";
import styles from "../WhatIsHealthEquityPage.module.scss";
import parse from "html-react-parser";
import { BLOG_TAB_LINK } from "../../../utils/urlutils";
import { Helmet } from "react-helmet";
import AppbarLogo from "../../../assets/AppbarLogo.png";
import BlogCategories from "../../ui/BlogCategories";

function AllPosts({ articles }: { articles: any[] }) {
  return (
    <Grid container className={styles.Grid}>
      <Helmet>
        <title>Blog - Health Equity Tracker</title>
      </Helmet>
      <Grid container className={styles.AllArticlesSection}>
        <Grid item xs={12} sm={12} md={3}>
          <Typography
            id="main"
            tabIndex={-1}
            className={styles.AllArticlesHeaderText}
            variant="h2"
          >
            Recent Posts
          </Typography>
          <BlogCategories />
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
