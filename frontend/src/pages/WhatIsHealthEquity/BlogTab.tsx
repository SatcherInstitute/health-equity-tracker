import React, { useEffect, useState } from "react";
import styles from "./WhatIsHealthEquityPage.module.scss";
import Grid from "@material-ui/core/Grid";
import { Helmet } from "react-helmet";
import axios from "axios";
import {
  BLOG_URL,
  WP_API,
  ALL_POSTS,
  BLOG_TAB_LINK,
} from "../../utils/urlutils";
import { Route, Switch } from "react-router-dom";
import AllPosts from "./Blog/AllPosts";
import SinglePost from "./Blog/SinglePost";

function BlogTab() {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    // fetch up to 10 posts
    axios
      .get(`${BLOG_URL + WP_API + ALL_POSTS}?_embed`)
      .then(async (posts) => {
        console.log(posts, "just fetched");
        // @ts-ignore
        setArticles(posts.data);
        //   // @ts-ignore
        //   const promisesForPostsWithImages = await posts.data.map(
        //     async (post: { featured_media: any; imageUrl: any }) => {
        //       // add fetched imageUrl to each fetched post
        //       const mediaResponse = await axios.get(
        //         `${BLOG_URL + WP_API + ALL_MEDIA}/${post.featured_media}`
        //       );
        //       post.imageUrl = mediaResponse.data.source_url;
        //       return post;
        //     }
        //   );
        //   return promisesForPostsWithImages;
        // })
        // .then((promisesForPostsWithImages) => {
        //   Promise.all(promisesForPostsWithImages).then((postsWithImages) => {
        //     // once all image urls are fetched; update state
        //     setArticles(postsWithImages);
        //   });
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
