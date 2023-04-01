import React from "react";
import { NEWS_TAB_LINK } from "../../../utils/internalRoutes";
import styles from "./News.module.scss";
import AppbarLogo from "../../../assets/AppbarLogo.png";
import { getHtml, ReactRouterLinkButton } from "../../../utils/urlutils";
import { type Article } from "../NewsTab";
import { Box, Grid } from "@material-ui/core";
import LazyLoad from "react-lazyload";

export interface NewsPreviewCardProps {
  article: Article
  arrow?: "prev" | "next"
}

export default function NewsPreviewCard(props: NewsPreviewCardProps) {
  const { article } = props;

  return (
    <ReactRouterLinkButton
      url={`${NEWS_TAB_LINK}/${article.slug}`}
      className={styles.NewsPreviewHeaderText}
    >
      <Grid container wrap="nowrap" justifyContent="space-evenly">
        {/* Optional "Left/Previous" Arrow */}
        <Grid
          item
          xs={1}
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
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
          justifyContent="center"
        >
          <LazyLoad once height={100} offset={300}>
            <img
              height="100"
              src={
                article?._embedded?.["wp:featuredmedia"]?.[0]?.media_details
                  ?.sizes?.medium?.source_url || AppbarLogo
              }
              className={
                article._embedded["wp:featuredmedia"]
                  ? styles.NewsPreviewThumbnail
                  : styles.LogoThumbnail
              }
              alt=""
            />
          </LazyLoad>

          <Box mx={1}>
            <h3 className={styles.NewsPreviewTitleText}>
              {getHtml(article.title.rendered, true)}
            </h3>
          </Box>
        </Grid>

        {/* Optional "Right/Next" Arrow */}
        <Grid
          item
          xs={1}
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
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
