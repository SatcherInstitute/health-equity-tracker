import React from "react";
import styles from "./WhatIsHealthEquityPage.module.scss";
import Grid from "@material-ui/core/Grid";
import { NEWS_TAB_LINK } from "../../utils/internalRoutes";
import { Route, Switch } from "react-router-dom";

const AllPosts = React.lazy(() => import("./News/AllPosts"));
const SinglePost = React.lazy(() => import("./News/SinglePost"));

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
  link: string;
  categories: number[];
  acf: {
    contributing_author: string;
    post_nominals: string;
    canonical_url: string;
    full_article_url: string;
    friendly_site_name: string;
    hide_on_production: boolean;
  };
  _embedded: {
    author: {
      id: number;
    };
    "wp:featuredmedia": {
      id: number;
      alt_text: string;
      source_url: string;
      media_details: {
        sizes: {
          medium: {
            source_url: string;
          };
          large: {
            source_url: string;
          };
          full: {
            source_url: string;
          };
        };
      };
    }[];
    "wp:term": { 0: { id: number; name: string; link: string }[] };
  };
}

export default function NewsTab() {
  return (
    <div className={styles.WhatIsHealthEquityPage}>
      <Grid container className={styles.Grid}>
        <Grid
          container
          className={styles.ResourcesAndNewsRow}
          direction="column"
          justifyContent="center"
        >
          <Switch>
            <Route path={`${NEWS_TAB_LINK}/:slug`}>
              <SinglePost />
            </Route>
            <Route path={`${NEWS_TAB_LINK}/`}>
              <AllPosts />
            </Route>
          </Switch>
        </Grid>
      </Grid>
    </div>
  );
}
