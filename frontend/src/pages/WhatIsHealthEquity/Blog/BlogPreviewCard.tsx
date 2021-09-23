import React from "react";
import { BLOG_TAB_LINK, ReactRouterLinkButton } from "../../../utils/urlutils";
import styles from "../WhatIsHealthEquityPage.module.scss";
import AppbarLogo from "../../../assets/AppbarLogo.png";
import parse from "html-react-parser";

export interface BlogPreviewCardProps {
  article: any;
}

export default function BlogPreviewCard(props: BlogPreviewCardProps) {
  const { article } = props;

  return (
    <ReactRouterLinkButton
      url={`${BLOG_TAB_LINK}/${article.slug}`}
      className={styles.PrevNextHeaderText}
    >
      <img
        src={
          article._embedded["wp:featuredmedia"]
            ? article._embedded["wp:featuredmedia"][0].source_url
            : AppbarLogo
        }
        className={
          article._embedded["wp:featuredmedia"]
            ? styles.PrevNextThumbnail
            : styles.LogoThumbnail
        }
        alt="Article Thumbnail"
        role="link"
      />
      <br />
      <span>{`${parse(article.title.rendered)}`}</span>
    </ReactRouterLinkButton>
  );
}
