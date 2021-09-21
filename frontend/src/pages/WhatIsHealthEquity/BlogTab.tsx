import React from "react";
import styles from "./WhatIsHealthEquityPage.module.scss";
import Grid from "@material-ui/core/Grid";
import { BLOG_TAB_LINK } from "../../utils/urlutils";
import { Route, Switch } from "react-router-dom";
import AllPosts from "./Blog/AllPosts";
import SinglePost from "./Blog/SinglePost";

function BlogTab({ articles }: { articles: any[] }) {
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
              <SinglePost articles={articles} />
            </Route>
            <Route path={`${BLOG_TAB_LINK}/`}>
              <AllPosts articles={articles} />
            </Route>
          </Switch>
        </Grid>
      </Grid>
    </div>
  );
}

export default BlogTab;
