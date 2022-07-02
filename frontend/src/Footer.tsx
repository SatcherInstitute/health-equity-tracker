import React from "react";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import styles from "./Footer.module.scss";
import TwitterIcon from "@material-ui/icons/Twitter";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import YouTubeIcon from "@material-ui/icons/YouTube";
import ArrowUpwardRoundedIcon from "@material-ui/icons/ArrowUpwardRounded";
import { Button } from "@material-ui/core";
import { ReactRouterLinkButton } from "./utils/urlutils";
import {
  EXPLORE_DATA_PAGE_LINK,
  DATA_CATALOG_PAGE_LINK,
  TERMS_OF_USE_PAGE_LINK,
  FAQ_TAB_LINK,
  CONTACT_TAB_LINK,
} from "./utils/internalRoutes";
import AppbarLogo from "./assets/AppbarLogo.png";
import PartnerSatcher from "./assets/PartnerSatcher.png";
import { urlMap } from "./utils/externalUrls";

export function currentYear(): number {
  return new Date().getFullYear();
}

function Footer() {
  return (
    <div className={styles.Footer}>
      <Grid container justifyContent="space-around" alignItems="center">
        <Grid item xs={12} sm={12} lg={6} xl={4} className={styles.FooterGrid}>
          <Logos />
        </Grid>

        <Grid
          item
          xs={12}
          sm={12}
          md={10}
          lg={6}
          xl={4}
          className={styles.LinksContainer}
        >
          <Grid
            className={styles.Links}
            justifyContent="space-between"
            alignItems="center"
            spacing={0}
            container
          >
            {[
              ["Explore Data", EXPLORE_DATA_PAGE_LINK],
              ["Downloads and Methods", DATA_CATALOG_PAGE_LINK],
              ["FAQs", `${FAQ_TAB_LINK}`, "Frequently Asked Questions"],
              ["Contact Us", `${CONTACT_TAB_LINK}`],
              ["Terms of Use", `${TERMS_OF_USE_PAGE_LINK}`],
            ].map(([label, link, ariaLabel]) => (
              <LinkGridItem
                key={link}
                text={label}
                link={link}
                ariaLabel={ariaLabel}
              />
            ))}
          </Grid>
          {/* DESKTOP */}
          <Hidden xsDown>
            <Grid item container justifyContent="flex-end">
              <span className={styles.CopyrightSpan}>
                &copy;{currentYear()}
              </span>
            </Grid>
          </Hidden>
          {/* MOBILE */}
          <Hidden smUp>
            <Grid item container justifyContent="center">
              <span className={styles.CopyrightSpan}>
                &copy;{currentYear()}
              </span>
            </Grid>
          </Hidden>
        </Grid>

        <Grid
          container
          item
          direction="column"
          xs={12}
          md={1}
          lg={12}
          xl={1}
          alignItems="center"
          justifyContent="center"
        >
          <Grid item container justifyContent="center">
            <ReturnToTop />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

function Logos() {
  return (
    <Grid item container spacing={2} justifyContent="center">
      <Grid
        container
        item
        xs={10}
        sm={5}
        alignItems="center"
        justifyContent="center"
        wrap="nowrap"
      >
        <Grid item>
          <ReactRouterLinkButton url="/">
            <img
              src={AppbarLogo}
              className={styles.FooterLogo}
              alt="Health Equity Tracker logo"
            />
          </ReactRouterLinkButton>
        </Grid>
        <Grid item>
          <Grid container justifyContent="flex-start" alignItems="flex-start">
            <Grid item xs={12}>
              <span className={styles.FooterTitleSpan} aria-hidden="true">
                Health Equity Tracker
              </span>
              <Grid container justifyContent="center">
                <Grid item className={styles.SocialsIcon}>
                  <a
                    href={urlMap.shliLinkedIn}
                    aria-label="Satcher Health on LinkedIn"
                  >
                    <LinkedInIcon />
                  </a>
                </Grid>
                <Grid item className={styles.SocialsIcon}>
                  <a
                    href={urlMap.shliTwitter}
                    aria-label="Satcher Health on Twitter"
                  >
                    <TwitterIcon />
                  </a>
                </Grid>
                <Grid item className={styles.SocialsIcon}>
                  <a
                    href={urlMap.shliYoutube}
                    aria-label="Satcher Health on YouTube"
                  >
                    <YouTubeIcon />
                  </a>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid
        item
        xs={10}
        sm={5}
        container
        justifyContent="center"
        alignItems="center"
      >
        <ReactRouterLinkButton url={urlMap.shli}>
          <img
            src={PartnerSatcher}
            alt="Satcher Health Leadership Institute Logo"
            height={60}
            width={216}
          />
        </ReactRouterLinkButton>
      </Grid>
    </Grid>
  );
}

function LinkGridItem(props: {
  text: string;
  link: string;
  ariaLabel: string;
}) {
  return (
    <>
      <Hidden xsDown>
        <Grid item>
          <ReactRouterLinkButton
            url={props.link}
            className={styles.FooterLink}
            displayName={props.text}
            ariaLabel={props.ariaLabel}
          />
        </Grid>
      </Hidden>
      <Hidden smUp>
        <Grid item xs={12}>
          <ReactRouterLinkButton
            url={props.link}
            className={styles.FooterLink}
            displayName={props.text}
          />
        </Grid>
      </Hidden>
    </>
  );
}

function ReturnToTop() {
  return (
    <Button
      aria-label="Scroll to Top"
      onClick={() => window.scrollTo(0, 0)}
      className={styles.ScrollToTopButton}
    >
      <ArrowUpwardRoundedIcon />
    </Button>
  );
}

export default Footer;
