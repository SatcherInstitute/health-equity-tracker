import React from "react";
import styles from "./LandingPage.module.scss";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import {
  LinkWithStickyParams,
  EXPLORE_DATA_PAGE_LINK,
} from "../../utils/urlutils";
import FaqSection from "../ui/FaqSection";

function TakeALookAroundItem(props: {
  src: string;
  alt: string;
  text: string;
}) {
  return (
    <Grid item xs={12} sm={4} md={4} className={styles.TakeALookAroundItem}>
      <Grid container direction="column" alignItems="center" justify="center">
        <Hidden xsDown>
          <Grid item>
            <img
              className={styles.TakeALookAroundImg}
              src={props.src}
              alt={props.alt}
            />
          </Grid>
        </Hidden>
        <Grid item>
          <Typography className={styles.TakeALookAroundText} variant="h3">
            <p>{props.text}</p>
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}

function LandingPage() {
  return (
    <>
      <title>Home - Health Equity Tracker</title>
      <h1 className={styles.ScreenreaderTitleHeader}>Home Page</h1>
      <div className={styles.LandingPage}>
        <Grid container className={styles.Grid}>
          <Grid
            container
            className={styles.HeaderRow}
            direction="row"
            justify="center"
            alignItems="center"
          >
            <Grid item className={styles.HeaderTextItem} xs={12} sm={12} md={6}>
              <Hidden xsDown>
                <Typography
                  id="main"
                  tabIndex={-1}
                  className={styles.HeaderText}
                  variant="h2"
                >
                  Advancing Health Equity
                </Typography>
                <br />
              </Hidden>
              <Hidden smUp>
                <Typography className={styles.HeaderTextMobile}>
                  Advancing Health Equity
                </Typography>
              </Hidden>
              <Typography className={styles.HeaderSubtext} variant="body1">
                <p>
                  We know that the data we collect can be flawed and at times even 
                  worsen health inequities many people face if not reported or 
                  analyzed correctly.
                </p>
                <p>
                  We work to change that narrative by identifying, understanding, and 
                  responding to health inequities in our communities in a way that will
                  allow every person to live well and long from generation to generation.
                </p>
                <p>
                  Join us in powering transformational action!
                </p>
                <br />
              </Typography>
              <LinkWithStickyParams
                to={EXPLORE_DATA_PAGE_LINK}
                class={styles.NoUnderline}
              >
                <Button
                  variant="contained"
                  color="primary"
                  className={styles.PrimaryButton}
                >
                  Explore the Health Equity Tracker
                </Button>
              </LinkWithStickyParams>
            </Grid>
            <Grid item xs={12} sm={12} md={6} className={styles.HeaderImgItem}>
              <img
                src="img/shutterstock_1414416191 2 (1).png"
                className={styles.HeaderImg}
                alt="A man and woman laying with their two children"
              />
            </Grid>
          </Grid>

          <Grid
            container
            className={styles.TakeALookAroundRow}
            justify="flex-start"
            align-items="center"
          >
            <Grid item xs={12}>
              <Typography
                className={styles.TakeALookAroundHeaderText}
                variant="h2"
              >
                Take a look around
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography
                className={styles.TakeALookAroundHeaderSubtext}
                variant="subtitle1"
              >
                We’re working toward health equity, but can’t do it alone.
                Please join our effort to move the needle forward.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Grid
                container
                className={styles.TakeALookAroundItemRow}
                direction="row"
                justify="space-around"
              >
                <TakeALookAroundItem
                  src="img/HET_Fields_1_v2_1000px.gif"
                  alt="Decorative dots"
                  text="(1) Learn about health equity"
                />
                <TakeALookAroundItem
                  src="img/HET_Dots_1_v3_1000px.gif"
                  alt="Decorative thick lines"
                  text="(2) Investigate the data"
                />
                <TakeALookAroundItem
                  src="img/HET_Spiral_v4_1000px.gif"
                  alt="Decorative circular pattern"
                  text="(3) Share our site and join our movement"
                />
              </Grid>
            </Grid>

            <Grid container direction="row" justify="center">
              <Grid item xs={12} sm={12} md={2}>
                <LinkWithStickyParams
                  to="/whatishealthequity"
                  class={styles.NoUnderline}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    className={styles.PrimaryButton}
                  >
                    Learn more
                  </Button>
                </LinkWithStickyParams>
              </Grid>
            </Grid>
          </Grid>

          <Grid
            container
            className={styles.PrioritizeHealthEquityRow}
            direction="row"
            justify="center"
            alignItems="center"
          >
            <Hidden smDown>
              <Grid
                item
                xs={12}
                sm={12}
                md={5}
                className={styles.DecorativeHImgItem}
              >
                <div className={styles.DecorativeHImgContainer}>
                  <img
                    src="img/Asset 10@3x 1.png"
                    className={styles.DecorativeHImg}
                    alt="A decorative letter H centered on an orange background"
                  />
                </div>
              </Grid>
            </Hidden>
            <Grid
              item
              xs={12}
              sm={12}
              md={7}
              className={styles.PrioritizeHealthEquityTextItem}
            >
              <Typography
                className={styles.PrioritizeHealthEquityHeader}
                variant="h2"
              >
                It's time to prioritize health equity
              </Typography>
              <br />
              <Typography
                className={styles.PrioritizeHealthEquityHeaderSubtext}
                variant="body1"
              >
                <p>
                  We’re living through a historical moment. COVID-19 has taken a
                  toll on everyone. But the pandemic is hitting the most
                  marginalized, vulnerable communities the hardest.
                </p>
                <p>
                  <b>People need help, and they need it now.</b>
                </p>
                <br />
                <a className={styles.MinorLink} href="/whatishealthequity">
                  Learn more about health equity
                </a>
              </Typography>
            </Grid>
          </Grid>

          <Grid container className={styles.HowToRow}>
            <Grid item xs={12}>
              <Typography className={styles.HowToHeaderText} variant="h2">
                How do I use the Data Tracker?
              </Typography>
            </Grid>

            <Grid
              container
              direction="column"
              justify="center"
              alignItems="center"
              xs={12}
            >
              <Grid
                container
                className={styles.HowToStepContainer}
                direction="row"
                justify="space-around"
                alignItems="center"
              >
                <Grid item xs={12} sm={12} md={8}>
                  <img
                    className={styles.HowToStepImg}
                    src="img/het-screen-1.png"
                    alt="Screenshot of Data Tracker - selecting mad libs"
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                  <div>
                    <h3 className={styles.HowToStepTextHeader}>
                      Search by completing the sentence
                    </h3>
                    <p className={styles.HowToStepTextSubheader}>
                      Select variables you’re interested in to complete the
                      sentence and explore the data
                    </p>
                  </div>
                </Grid>
              </Grid>

              <Grid
                container
                className={styles.HowToStepContainer}
                direction="row"
                justify="space-around"
                alignItems="center"
              >
                <Grid item xs={12} sm={12} md={8}>
                  <img
                    className={styles.HowToStepImg}
                    src="img/het-screen-2.png"
                    alt="Screenshot of Data Tracker - using filters"
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                  <div>
                    <h3 className={styles.HowToStepTextHeader}>
                      Use filters to go deeper
                    </h3>
                    <p className={styles.HowToStepTextSubheader}>
                      Where available, the tracker offers breakdowns by race and
                      ethnicity, sex, and age. This is currently limited to the
                      national and state level, with county-level data coming
                      soon.
                    </p>
                  </div>
                </Grid>
              </Grid>

              <Grid
                container
                className={styles.HowToStepContainer}
                direction="row"
                justify="space-around"
                alignItems="center"
              >
                <Grid item xs={12} sm={12} md={8}>
                  <img
                    className={styles.HowToStepImg}
                    src="img/het-screen-3.png"
                    alt="Screenshot of Data Tracker - map of the US"
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                  <div>
                    <h3 className={styles.HowToStepTextHeader}>
                      Explore maps and graphs
                    </h3>
                    <p className={styles.HowToStepTextSubheader}>
                      The interactive maps and graphs are a great way to
                      investigate the data more closely. If a state or county is
                      gray, that means there’s no data currently available.
                    </p>
                  </div>
                </Grid>
              </Grid>
              <Grid item>
                <br />
                <br />
                <LinkWithStickyParams
                  to={EXPLORE_DATA_PAGE_LINK}
                  class={styles.NoUnderline}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    className={styles.PrimaryButton}
                  >
                    Explore the Tracker
                  </Button>
                </LinkWithStickyParams>
              </Grid>
            </Grid>
          </Grid>

          <div className={styles.FaqRow}>
            <FaqSection />
          </div>

          <Grid container className={styles.NewsletterSignUpRow}>
            <Grid
              container
              item
              xs={12}
              sm={12}
              md={12}
              direction="column"
              justify="center"
              alignItems="center"
              className={styles.EmailAddressBackgroundImgContainer}
            >
              <div className={styles.EmailAddressContentDiv}>
                <Grid item>
                  <Hidden mdUp>
                    <Typography
                      className={styles.NewsletterRowHeaderSmall}
                      variant="h2"
                    >
                      Engage in
                      <br />
                      Health Equity
                    </Typography>
                  </Hidden>
                  <Hidden smDown>
                    <Typography
                      className={styles.NewsletterRowHeader}
                      variant="h2"
                    >
                      Engage in
                      <br />
                      Health Equity
                    </Typography>
                  </Hidden>
                </Grid>
                <Grid item>
                  <form
                    action="https://satcherinstitute.us11.list-manage.com/subscribe?u=6a52e908d61b03e0bbbd4e790&id=3ec1ba23cd&"
                    method="post"
                    target="_blank"
                    className={styles.NewsletterForm}
                  >
                    <TextField
                      id="Enter email address to sign up" // Accessibility label
                      name="MERGE0"
                      variant="outlined"
                      type="email"
                      placeholder="Enter email address"
                    />
                    <Button
                      type="submit"
                      color="primary"
                      variant="contained"
                      className={styles.NewsletterEmailSubmitInput}
                    >
                      Sign up
                    </Button>
                  </form>
                </Grid>
              </div>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </>
  );
}

export default LandingPage;
