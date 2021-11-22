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

export const shareIconAttributes = {
  iconFillColor: sass.altGreen,
  bgStyle: { fill: "none" },
  size: 32,
};

export interface ShareButtonProps {
  madLib: MadLib;
}

function ShareButtons(props: ShareButtonProps) {
  let title: string = `Health Equity Tracker${
    props.madLib ? ": " + getMadLibPhraseText(props.madLib) : ""
  }`;
  let text = window.location.href;
  if (process.env.NODE_ENV === "development")
    text = text.replace(
      "http://localhost:3000",
      "https://healthequitytracker.org"
    );

  return (
    <Grid container justify={"flex-end"} alignItems={"center"}>
      <Grid item>
        <p className={styles.ShareLabel}>Share:</p>
      </Grid>
      <Grid item>
        {/* SOCIAL SHARE BUTTONS */}
        <TwitterShareButton
          url={text}
          title={title}
          hashtags={["healthequity"]}
          related={["@SatcherHealth", "@MSMEDU"]}
          aria-label={"Share to Twitter"}
        >
          <TwitterIcon {...shareIconAttributes} />
        </TwitterShareButton>

        <FacebookShareButton
          url={text}
          hashtag={"#healthequity"}
          quote={title}
          aria-label={"Share to Facebook"}
        >
          <FacebookIcon {...shareIconAttributes} />
        </FacebookShareButton>

        <LinkedinShareButton
          title={title}
          source={"Health Equity Tracker"}
          url={text}
          aria-label={"Share to LinkedIn"}
        >
          <LinkedinIcon {...shareIconAttributes} />
        </LinkedinShareButton>

        <EmailShareButton
          aria-label={"Share by email"}
          subject={`Sharing from healthequitytracker.org`}
          body={`${title}
            
        
    `} // KEEP THIS WEIRD SPACING FOR EMAIL LINE BREAKS!
          url={text}
        >
          <EmailIcon {...shareIconAttributes} />
        </EmailShareButton>
      </Grid>
    </Grid>
  );
}

export default ShareButtons;
