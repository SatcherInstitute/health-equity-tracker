import React from "react";
import {
  EmailShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  EmailIcon,
  FacebookIcon,
  LinkedinIcon,
  TwitterIcon,
} from "react-share";
import { Grid } from "@material-ui/core";
import { getMadLibPhraseText, MadLib } from "../../utils/MadLibs";
import styles from "./ShareButtons.module.scss";
import sass from "../../styles/variables.module.scss";
import { Article } from "../../pages/WhatIsHealthEquity/NewsTab";
import { getHtml } from "../../utils/urlutils";

export const ARTICLE_DESCRIPTION =
  "Article from the Health Equity Tracker: a free-to-use data and visualization platform that is enabling new insights into the impact of COVID-19 and other determinants of health on marginalized groups in the United States.";

export const shareIconAttributes = {
  iconFillColor: sass.altGreen,
  bgStyle: { fill: "none" },
  size: 32,
};

export interface ShareButtonProps {
  madLib?: MadLib;
  article?: Article;
}

function ShareButtons(props: ShareButtonProps) {
  let sharedUrl: string = window.location.href;
  let title: string = "Health Equity Tracker";
  if (props.madLib) {
    title += ": " + getMadLibPhraseText(props.madLib);
  }
  if (props.article) {
    title +=
      ((": “" + getHtml(props.article.title.rendered, true)) as string) + "”";
  }

  return (
    <Grid
      container
      justifyContent={props.madLib ? "flex-end" : "flex-start"}
      alignItems={"center"}
    >
      <Grid item>
        <p className={styles.ShareLabel}>Share:</p>
      </Grid>
      <Grid item>
        {/* SOCIAL SHARE BUTTONS */}
        <TwitterShareButton
          url={sharedUrl}
          title={title}
          hashtags={["healthequity"]}
          related={["@SatcherHealth", "@MSMEDU"]}
          aria-label={"Share to Twitter"}
        >
          <TwitterIcon {...shareIconAttributes} />
        </TwitterShareButton>

        <FacebookShareButton
          url={sharedUrl}
          hashtag={"#healthequity"}
          quote={title}
          aria-label={"Share to Facebook"}
        >
          <FacebookIcon {...shareIconAttributes} />
        </FacebookShareButton>

        <LinkedinShareButton
          title={title}
          source={"Health Equity Tracker"}
          url={sharedUrl}
          aria-label={"Share to LinkedIn"}
        >
          <LinkedinIcon {...shareIconAttributes} />
        </LinkedinShareButton>

        <EmailShareButton
          aria-label={"Share by email"}
          subject={`Sharing from healthequitytracker.org`}
          body={`${title}

`} // KEEP THIS WEIRD SPACING FOR EMAIL LINE BREAKS!
          url={sharedUrl}
        >
          <EmailIcon {...shareIconAttributes} />
        </EmailShareButton>
      </Grid>
    </Grid>
  );
}

export default ShareButtons;
