import React, { useEffect, useState } from "react";
import styles from "./WhatIsHealthEquityPage.module.scss";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Helmet } from "react-helmet";
import parse from "html-react-parser";
import axios from "axios";
import {
  BLOG_URL,
  WP_API,
  ALL_POSTS,
  FEATURED_IMAGE_FROM,
} from "../../utils/urlutils";

function BlogTab() {
  const [wordpressPosts, setWordpressPosts] = useState<any[]>([]);
  const [featuredImages, setFeaturedImages] = useState<string[]>([]);

  // populate wordpress articles array on page load
  useEffect(() => {
    function fetchWordpressData() {
      try {
        axios.get(`${BLOG_URL + WP_API + ALL_POSTS}`).then((res) => {
          // console.log(res);
          setWordpressPosts(res.data);
        });
      } catch (e) {
        console.error(e);
      }
    }
    fetchWordpressData();
  }, []);

  useEffect(() => {
    function fetchFeaturedImages() {
      try {
        for (let post of wordpressPosts) {
          // console.log(post);
          axios
            .get(`${BLOG_URL + WP_API + FEATURED_IMAGE_FROM + post.id}`)
            .then((res) => {
              // console.log(res.data[0].source_url);
              setFeaturedImages((featuredImages) => [
                ...featuredImages,
                res.data[0]?.source_url || "",
              ]);
              // console.log(featuredImages);
            });
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchFeaturedImages();
  }, [wordpressPosts]);

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
              {wordpressPosts.map((post, index) => {
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
                    <img
                      className={styles.NewsAndStoriesBigImg}
                      src={featuredImages[index]}
                      alt=""
                    />
                    <h2 className={styles.NewsAndStoriesTitleText}>
                      {parse(post.title.rendered)}
                    </h2>

                    <div className={styles.NewsAndStoriesSubtitleText}>
                      {parse(post.excerpt.rendered)}
                    </div>
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
