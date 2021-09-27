import React from "react";
import styles from "./WhatIsHealthEquityPage.module.scss";
import Grid from "@material-ui/core/Grid";
import {
  ALL_POSTS,
  BLOG_TAB_LINK,
  BLOG_URL,
  MAX_FETCH,
  WP_API,
  WP_EMBED_PARAM,
  WP_PER_PAGE_PARAM,
} from "../../utils/urlutils";
import { Route, Switch } from "react-router-dom";
import AllPosts from "./Blog/AllPosts";
import SinglePost from "./Blog/SinglePost";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ARTICLES_KEY } from "../../utils/useFetchBlog";
import axios from "axios";

const queryClient = new QueryClient();

function BlogTab() {
  const { isLoading, error, data }: any = useQuery(ARTICLES_KEY, () =>
    axios.get(
      `${
        BLOG_URL + WP_API + ALL_POSTS
      }?${WP_EMBED_PARAM}&${WP_PER_PAGE_PARAM}${MAX_FETCH}`
    )
  );

  if (isLoading) return <p>Loading...</p>;

  if (error) return <p>An error has occurred: {error.message}</p>;

  return (
    <div className={styles.WhatIsHealthEquityPage}>
      <Grid container className={styles.Grid}>
        <Grid
          container
          className={styles.ResourcesAndNewsRow}
          direction="column"
          justify="center"
        >
          <QueryClientProvider client={queryClient}>
            <Switch>
              <Route path={`${BLOG_TAB_LINK}/:slug`}>
                <SinglePost />
              </Route>
              <Route path={`${BLOG_TAB_LINK}/`}>
                <AllPosts />
              </Route>
            </Switch>
          </QueryClientProvider>
        </Grid>
      </Grid>
    </div>
  );
}

export default BlogTab;
