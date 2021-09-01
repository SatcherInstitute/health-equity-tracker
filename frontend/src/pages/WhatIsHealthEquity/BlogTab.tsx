import React, { useEffect, useState } from "react";
import styles from "./WhatIsHealthEquityPage.module.scss";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Helmet } from "react-helmet";
import parse from "html-react-parser";
import axios from "axios";
import { BLOG_URL, WP_API, ALL_POSTS, ALL_MEDIA } from "../../utils/urlutils";
import { Link } from "react-router-dom";

function BlogTab() {
  const [articles, setArticles] = useState<any[]>([]);

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
        console.log("fetched, combined blog stuff", postsWithImages);
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
          <Grid
            container
            className={styles.NewsAndStoriesRow}
            direction="row"
            justify="center"
          >
            <Grid item>
              <Typography
                className={styles.NewsAndStoriesHeaderText}
                variant="h1"
              >
                News and stories
              </Typography>
              <span className={styles.NewsAndStoriesSubheaderText}>
                Read the latest news, posts, and stories related to health
                equity
              </span>
            </Grid>
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="flex-start"
            >
              {articles.map((post) => {
                return (
                  // FETCHED BLOG POSTS
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    className={styles.NewsAndStoriesItem}
                    key={post.id}
                  >
                    <Link to={{ pathname: `/${post.slug}`, state: { post } }}>
                      <img
                        className={styles.NewsAndStoriesBigImg}
                        src={post.media_info.source_url}
                        alt=""
                      />
                      <h2 className={styles.NewsAndStoriesTitleText}>
                        {parse(post.title.rendered)}
                      </h2>
                    </Link>
                    {/* <div className={styles.NewsAndStoriesSubtitleText}>
                      {parse(post.content.rendered)}
                    </div> */}
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default BlogTab;
