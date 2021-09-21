import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";
import styles from "../WhatIsHealthEquityPage.module.scss";
import parse from "html-react-parser";
import { BLOG_TAB_LINK } from "../../../utils/urlutils";
import { Helmet } from "react-helmet";
import AppbarLogo from "../../../assets/AppbarLogo.png";

function AllPosts({ articles }: { articles: any[] }) {
  return (
    <Grid
      container
      className={styles.NewsAndStoriesRow}
      direction="row"
      justify="center"
    >
      <Helmet>
        <title>Blog - Health Equity Tracker</title>
      </Helmet>
      <Grid item>
        <Typography className={styles.NewsAndStoriesHeaderText} variant="h1">
          News and stories
        </Typography>
        <span className={styles.NewsAndStoriesSubheaderText}>
          Read the latest news, posts, and stories related to health equity
        </span>
      </Grid>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="flex-start"
      >
        {articles.map((post: any) => {
          console.log(post, "cant find img here?");
          return (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              className={styles.NewsAndStoriesItem}
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
                className={styles.NewsAndStoriesTitleLink}
              >
                <Typography
                  className={styles.NewsAndStoriesTitleText}
                  variant="h3"
                >
                  {parse(post.title.rendered)}
                </Typography>
              </Link>
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  );
}

export default AllPosts;
