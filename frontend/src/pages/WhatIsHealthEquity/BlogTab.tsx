import React from "react";
import styles from "./WhatIsHealthEquityPage.module.scss";
import Grid from "@material-ui/core/Grid";
import { BLOG_TAB_LINK } from "../../utils/urlutils";
import { Route, Switch } from "react-router-dom";
import AllPosts from "./Blog/AllPosts";
import SinglePost from "./Blog/SinglePost";

export interface Article {
  id: number;
  date: string;
  modified: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  featured_media: number;
  sticky: boolean;
  categories: number[];
  acf: { contributing_author: string };
  _embedded: {
    author: {
      id: number;
    };
    "wp:featuredmedia": { id: number; source_url: string }[];
  };
}

export default function BlogTab() {
  return (
    <div className={styles.WhatIsHealthEquityPage}>
      <Grid container className={styles.Grid}>
        <Grid
          container
          className={styles.ResourcesAndNewsRow}
          direction="column"
          justify="center"
        >
          <Switch>
            <Route path={`${BLOG_TAB_LINK}/:slug`}>
              <SinglePost />
            </Route>
            <Route path={`${BLOG_TAB_LINK}/`}>
              <AllPosts />
            </Route>
          </Switch>
        </Grid>
      </Grid>
    </div>
  );
}
