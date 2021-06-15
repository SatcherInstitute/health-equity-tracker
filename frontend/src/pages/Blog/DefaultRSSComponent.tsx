import React, { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import Parser from "rss-parser";
import CircularProgress from "@material-ui/core/CircularProgress";

const DefaultRSSComponent = () => {
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
    <Grid container direction="row" justify="center">
      {!feed && <CircularProgress />}
      {!!feed &&
        feed.items.map((item: any) => {
          console.log(item);
          return (
            <Grid item xs={12} style={{ padding: "15px" }}>
              <h1>{item.title}</h1>
              <p>
                <i>published on {item.pubDate}</i>
              </p>
              <p>
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

export default DefaultRSSComponent;
