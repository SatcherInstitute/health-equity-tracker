import React, { useState, useEffect, FunctionComponent } from "react";
import rssEnhancer, { InjectionRSSProps } from "react-rss";
import Grid from "@material-ui/core/Grid";
import styles from "./WhatIsHealthEquityPage.module.scss";
import Typography from "@material-ui/core/Typography";
import Parser from "rss-parser";

const DefaultRSSComponent: FunctionComponent<
  { label: string } & InjectionRSSProps
> = (props) => {
  let [feed, setFeed] = useState<any>();

  useEffect(() => {
    // You need to restrict it at some point
    // This is just dummy code and should be replaced by actual
    if (!feed) {
      getToken();
    }
    // eslint-disable-next-line
  }, []);

  const getToken = async () => {
    let parser = new Parser();
    const parsed = await parser.parseURL("https://satcherinstitute.org/feed/");
    setFeed(parsed);
  };

  return (
    <Grid
      container
      className={styles.NewsAndStoriesRow}
      direction="row"
      justify="center"
    >
      <h1>krista feed</h1>
      {!!feed}
      <h1> other stuff</h1>
      {!!feed &&
        feed.items.map((item: any) => {
          console.log(item);
          return (
            <Grid
              item
              xs={12}
              className={styles.ResourceItem}
              style={{ padding: "15px" }}
            >
              <Typography className={styles.ResourcesHeaderText} variant="h1">
                {item.title}
              </Typography>
              <p>
                <i>published on {item.pubDate}</i>
              </p>
              <p className={styles.MainResourceSubtitleText}>
                <div
                  dangerouslySetInnerHTML={{ __html: item["content:encoded"] }}
                ></div>
              </p>
            </Grid>
          );
        })}
    </Grid>
  );
};

export default rssEnhancer(
  DefaultRSSComponent,
  "https://satcherinstitute.org/feed/"
);
