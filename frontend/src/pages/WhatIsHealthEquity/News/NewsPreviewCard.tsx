import React from "react";
import { NEWS_TAB_LINK, ReactRouterLinkButton } from "../../../utils/urlutils";
import styles from "./News.module.scss";
import AppbarLogo from "../../../assets/AppbarLogo.png";
import parse from "html-react-parser";
import { Article } from "../NewsTab";
import { Box, Grid } from "@material-ui/core";

export interface NewsPreviewCardProps {
  article: Article;
  arrow?: "prev" | "next";
}

export default function NewsPreviewCard(props: NewsPreviewCardProps) {
  const { article } = props;

  return (
    <ReactRouterLinkButton
      url={`${NEWS_TAB_LINK}/${article.slug}`}
      className={styles.NewsPreviewHeaderText}
    >
      <Grid container wrap="nowrap" justify="space-evenly">
        <Grid
          item
          xs={1}
          container
          direction="column"
          alignItems="center"
          justify="center"
        >
          {props.arrow === "prev" ? (
            <span className={styles.PrevNextArrow}>«</span>
          ) : (
            " "
          )}
        </Grid>

        <Grid
          item
          xs={11}
          container
          direction="column"
          alignItems="center"
          justify="center"
        >
          <img
            src={
              article._embedded["wp:featuredmedia"]
                ? article._embedded["wp:featuredmedia"][0].source_url
                : AppbarLogo
            }
            className={
              article._embedded["wp:featuredmedia"]
                ? styles.NewsPreviewThumbnail
                : styles.LogoThumbnail
            }
            alt="Article Thumbnail"
            role="link"
          />

          <Box mx={1}>
            <span>{`${parse(article.title.rendered)}`}</span>
          </Box>
        </Grid>

        <Grid
          item
          xs={1}
          container
          direction="column"
          alignItems="center"
          justify="center"
        >
          {props.arrow === "next" ? (
            <span className={styles.PrevNextArrow}>»</span>
          ) : (
            " "
          )}
        </Grid>
      </Grid>
    </ReactRouterLinkButton>
  );
}
