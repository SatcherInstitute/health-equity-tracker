import React, { useEffect, useState } from "react";
import styles from "./WhatIsHealthEquityPage.module.scss";
import Grid from "@material-ui/core/Grid";
// import Typography from "@material-ui/core/Typography";
import { Helmet } from "react-helmet";
// import parse from "html-react-parser";
import axios from "axios";
import {
  BLOG_URL,
  WP_API,
  ALL_POSTS,
  ALL_MEDIA,
  BLOG_TAB_LINK,
} from "../../utils/urlutils";
import { BrowserRouter, Route, Switch } from "react-router-dom";
// import { Button } from "@material-ui/core";
import AllPosts from "./Blog/AllPosts";
import SinglePost from "./Blog/SinglePost";

function BlogTab() {
  const [articles, setArticles] = useState<any[]>([]);
  // const [fullArticle, setFullArticle] = useState<any>();

  // on page load make /media and /posts API calls into temp arrays, combine and store in state
  useEffect(() => {
    function getMedia() {
      return axios.get(`${BLOG_URL + WP_API + ALL_MEDIA}`);
    }
    function getPosts() {
      return axios.get(`${BLOG_URL + WP_API + ALL_POSTS}`);
    }

    let mediaResponse: any[] = [];
    let postsResponse: any[] = [];

    Promise.all([getMedia(), getPosts()])
      .then((res) => {
        mediaResponse = res[0].data;
        postsResponse = res[1].data;

        // iterate fetched posts
        const postsWithImages = postsResponse.map((post: any) => {
          // populate featured_media object info into each post
          const media_info = mediaResponse.find(
            (img) => img.id === post.featured_media
          );
          post = { media_info, ...post };
          return post;
        });
        setArticles(postsWithImages);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className={styles.WhatIsHealthEquityPage}>
      <Helmet>
        <title>Blog - Health Equity Tracker</title>
      </Helmet>
      <Grid container className={styles.Grid}>
        <Grid
          container
          className={styles.ResourcesAndNewsRow}
          direction="column"
          justify="center"
        >
          <BrowserRouter>
            <Switch>
              <Route exact path={`${BLOG_TAB_LINK}/`}>
                <AllPosts articles={articles} />
              </Route>
              <Route path={`${BLOG_TAB_LINK}/:slug`}>
                <SinglePost articles={articles} />
              </Route>
            </Switch>
          </BrowserRouter>
        </Grid>
      </Grid>
    </div>
  );
}

export default BlogTab;
