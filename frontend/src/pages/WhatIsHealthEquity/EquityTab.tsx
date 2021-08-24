import React from "react";
import styles from "./WhatIsHealthEquityPage.module.scss";
import Button from "@material-ui/core/Button";
import Hidden from "@material-ui/core/Hidden";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import FaqSection from "../ui/FaqSection";
import { WIHE_JOIN_THE_EFFORT_SECTION_ID } from "./WhatIsHealthEquityPage";
import { Box } from "@material-ui/core";
import { usePrefersReducedMotion } from "../../utils/usePrefersReducedMotion";
import { Helmet } from "react-helmet";

function JoinTheEffortContainer(props: {
  imageUrl: string;
  imageAlt: string;
  imageBackground: string;
  textTitle: string;
  content: JSX.Element;
}) {
  return (
    <Grid
      container
      justify="space-around"
      className={styles.JoinTheEffortItemContainer}
    >
      <Hidden smDown>
        <Grid
          item
          md={5}
          lg={5}
          className={styles.JoinTheEffortImgContainer}
          style={{ backgroundColor: props.imageBackground }}
        >
          <img
            src={props.imageUrl}
            alt={props.imageAlt}
            className={styles.JoinTheEffortImg}
          />
        </Grid>
      </Hidden>
      <Grid item sm={12} md={6} className={styles.JoinTheEffortTextContainer}>
        <Typography className={styles.JoinTheEffortStepHeaderText} variant="h2">
          {props.textTitle}
        </Typography>
        {props.content}
      </Grid>
    </Grid>
  );
}

function EquityTab() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className={styles.WhatIsHealthEquityPage}>
      <Helmet>
        <title>What is Health Equity - Health Equity Tracker</title>
      </Helmet>
      <Grid container className={styles.Grid}>
        <Grid
          container
          className={styles.HeaderRow}
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Hidden smDown>
            <Grid
              container
              item
              xs={12}
              sm={12}
              md={4}
              className={styles.HeaderImgItem}
            >
              <img
                src="img/pexels-marcus-aurelius-4063919 1.png"
                className={styles.HeaderImg}
                alt=""
              />
            </Grid>
          </Hidden>
          <Grid item xs={12} sm={12} md={8} className={styles.HeaderTextItem}>
            <Box mb={5}>
              <Typography
                id="main"
                tabIndex={-1}
                className={styles.HeaderText}
                variant="h1"
                paragraph={true}
              >
                What is Health Equity?
              </Typography>
            </Box>
            <Typography
              className={styles.HeaderSubtext}
              variant="body1"
              paragraph={true}
            >
              <b>Health Equity</b> exists when all people, regardless of race,
              sex, sexual orientation, disability, socio-economic status,
              geographic location, or other societal constructs have fair and
              just access, opportunity, and resources to achieve their highest
              potential for health.
            </Typography>
            <Typography
              className={styles.HeaderSubtext}
              variant="body1"
              paragraph={true}
            >
              Unfortunately, social and political determinants of health
              negatively affect many communities, their people, and their
              ability to lead healthy lives.
            </Typography>
            <Typography className={styles.HeaderSubtext} variant="body1">
              <span className={styles.DefinitionSourceSpan}>
                Health Equity Leadership & Exchange Network, 2020
              </span>
            </Typography>
            <Grid
              container
              item
              xs={12}
              direction="row"
              justify="space-between"
              alignItems="flex-start"
              className={styles.DefinitionsContainer}
            >
              <Grid
                item
                xs={12}
                sm={12}
                md={6}
                className={styles.DefinitionsItem}
              >
                <Typography className={styles.DefinitionHeader} variant="h2">
                  Political determinants of health
                </Typography>
                <p
                  className={styles.DefinitionPronunciation}
                  aria-hidden="true"
                >
                  /pəˈlidək(ə)l dəˈtərmənənts əv helTH/
                </p>
                <p className={styles.DefinitionText}>
                  The creators of structural conditions and the social drivers –
                  including poor environmental conditions, inadequate
                  transportation, unsafe neighborhoods, and lack of healthy food
                  options – that affect all other dynamics of health.
                </p>
                <span className={styles.DefinitionSourceSpan}>
                  Daniel Dawes, 2020
                </span>
              </Grid>
              <Grid
                item
                xs={12}
                sm={12}
                md={6}
                className={styles.DefinitionsItem}
              >
                <Typography className={styles.DefinitionHeader} variant="h2">
                  Social determinants of health
                </Typography>
                <p
                  className={styles.DefinitionPronunciation}
                  aria-hidden="true"
                >
                  /ˈsōSHəl dəˈtərmənənt əv helTH/
                </p>
                <p className={styles.DefinitionText}>
                  The conditions in the environments in which people are born,
                  live, learn, work, play, worship, and age that affect a wide
                  range of health, functioning, and quality-of-life outcomes and
                  risks.
                </p>
                <span className={styles.DefinitionSourceSpan}>
                  Healthy People 2020, CDC
                </span>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid
          container
          className={styles.ResourcesAndNewsRow}
          direction="column"
          justify="center"
        >
          <Grid container className={styles.ResourcesRow} justify="center">
            <Grid item>
              <Typography className={styles.ResourcesHeaderText} variant="h1">
                Health equity resources
              </Typography>
            </Grid>
            <Grid
              container
              className={styles.ResourcesContainer}
              direction="row"
              justify="space-around"
              item
              xs={12}
            >
              <Grid item xs={12} sm={12} md={9} className={styles.ResourceItem}>
                <iframe
                  className={styles.ResourceVideoEmbed}
                  width="100%"
                  height="633px"
                  src="https://www.youtube.com/embed/mux1c73fJ78"
                  title="YouTube video player -
                          The Allegory of the Orchard"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write;
                          encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <h2 className={styles.MainResourceTitleText}>
                  Learn about the Political Determinants of Health through the{" "}
                  <b>Allegory of the Orchard</b>
                </h2>
                <p className={styles.MainResourceSubtitleText}>
                  Girding all health determinants is one that rarely gets
                  addressed but which has power over all aspects of health:
                  political determinants of health.
                </p>
              </Grid>
              <Grid item xs={12} sm={12} md={3}>
                <Grid
                  container
                  direction="column"
                  alignItems="center"
                  justify="space-evenly"
                >
                  <Grid item className={styles.ResourceItem}>
                    <iframe
                      className={styles.ResourceVideoEmbed}
                      width="100%"
                      height="180px"
                      src="https://www.youtube.com/embed/cmMutvgQIcU"
                      title="YouTube video player -
                              Jessica's Story"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write;
                              encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                    <h2 className={styles.ResourceTitleText}>
                      Jessica's Story
                    </h2>
                    <p className={styles.ResourceSubtitleText}>
                      How political determinants of health operate and the
                      impact they have on BIPOC communities.
                    </p>
                  </Grid>
                  <Grid item className={styles.ResourceItem}>
                    <a href="https://ncrn.msm.edu/">
                      <img
                        className={styles.ResourceImg}
                        src="img/maxresdefault (1) 1.png"
                        alt="Header for Morehouse School of Medicine National COVID-19 Resiliency Network"
                      />
                      <h2 className={styles.ResourceTitleText}>
                        Morehouse School of Medicine National COVID-19
                        Resiliency Network (NCRN)
                      </h2>
                      <p className={styles.ResourceSubtitleText}>
                        We provide awareness and linkage to critical health
                        information and services, helping families recover from
                        difficulties that may have been caused or worsened by
                        the Coronavirus (COVID-19) pandemic.
                      </p>
                    </a>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

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
              <Grid
                item
                xs={12}
                sm={12}
                md={6}
                className={styles.NewsAndStoriesItem}
              >
                <img
                  className={styles.NewsAndStoriesBigImg}
                  src="img/pexels-august-de-richelieu-4261261 1.png"
                  alt=""
                />
                <h2 className={styles.NewsAndStoriesTitleText}>
                  Why It Matters That Information On Race, Ethnicity, Gender And
                  Disability Are Measured Accurately And Completely
                </h2>
                <p className={styles.NewsAndStoriesSubtitleText}>
                  Why ongoing data on health and wellbeing metrics could be used
                  in targeting federal resources and programs to address
                  inequities due to social and economic factors.{" "}
                  <a
                    href="https://satcherinstitute.org/hetblog2/"
                    aria-label="Satcher Blog Post on Why Data Matters"
                  >
                    Read more
                  </a>
                </p>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                md={6}
                className={styles.NewsAndStoriesItem}
              >
                <img
                  className={styles.NewsAndStoriesBigImg}
                  src="img/pexels-mary-taylor-5896662.jpg"
                  alt=""
                />
                <h2 className={styles.NewsAndStoriesTitleText}>
                  How can we use data to inform practices to advance health
                  equity?
                </h2>
                <p className={styles.NewsAndStoriesSubtitleText}>
                  In public health, much of our work depends on having accurate
                  data, so we know what’s happening both on the ground and at a
                  population level.{" "}
                  <a
                    href="https://satcherinstitute.org/hetblog3/"
                    aria-label="Satcher Blog Post on Health Equity Data"
                  >
                    Read more
                  </a>
                </p>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                className={styles.NewsAndStoriesItem}
              >
                <img
                  className={styles.NewsAndStoriesSmallImg}
                  src="img/pexels-alex-green-5699516 1.png"
                  alt=""
                />
                <h2 className={styles.NewsAndStoriesTitleText}>
                  Data And Technology Can Help Us Make Progress On COVID
                  Inequities
                </h2>
                <p className={styles.NewsAndStoriesSubtitleText}>
                  <a
                    href="https://www.scientificamerican.com/article/data-and-technology-can-help-us-make-progress-on-covid-inequities/"
                    aria-label="Read Scientific American Article"
                  >
                    Read more
                  </a>
                </p>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                className={styles.NewsAndStoriesItem}
              >
                <img
                  className={styles.NewsAndStoriesSmallImg}
                  src="img/pexels-ketut-subiyanto-4473409 2.png"
                  alt="Asian woman laughing with two children, Decorative"
                />
                <h2 className={styles.NewsAndStoriesTitleText}>
                  How Complete Are The CDC's COVID-19 Case Surveillance Datasets
                  For Race/Ethnicity At The State And County Levels?
                </h2>
                <p className={styles.NewsAndStoriesSubtitleText}>
                  <a
                    href="https://satcherinstitute.github.io/analysis/cdc_case_data"
                    aria-label="Satcher Post on COVID Data Completeness"
                  >
                    Learn more
                  </a>
                </p>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                className={styles.NewsAndStoriesItem}
              >
                <img
                  className={styles.NewsAndStoriesSmallImg}
                  src="img/Screen Shot 2021-03-01 at 5.25 1.png"
                  alt=""
                />
                <h2 className={styles.NewsAndStoriesTitleText}>
                  Saving the Lives of the Invisible
                </h2>
                <p className={styles.NewsAndStoriesSubtitleText}>
                  <a
                    href="https://www.kennedysatcher.org/media-old/saving-the-lives-of-the-invisible/"
                    aria-label="Kennedy Satcher Article: Saving the Lives of the Invisible"
                  >
                    Learn more
                  </a>
                </p>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          container
          item
          xs={12}
          className={styles.FaqRow}
          alignItems="center"
          justify="center"
        >
          <Grid item sm={12} md={10}>
            <FaqSection />
          </Grid>
        </Grid>
        <Grid
          container
          className={styles.JoinTheEffortRow}
          direction="column"
          justify="center"
          alignItems="center"
        >
          <Grid
            item
            className={styles.JoinTheEffortHeaderRow}
            id={WIHE_JOIN_THE_EFFORT_SECTION_ID}
          >
            <Typography className={styles.JoinTheEffortHeaderText} variant="h2">
              How do I join the movement?
            </Typography>
            <span className={styles.JoinTheEffortSubheaderText}>
              To advance health equity, we need smart, talented,
              <br />
              passionate folks like you on board.
            </span>
            <br />
            <br />
          </Grid>

          <JoinTheEffortContainer
            imageUrl={
              prefersReducedMotion
                ? "img/HET-lines-no-motion.gif"
                : "img/HET_Overlapping_Lines_v4_1000px.gif"
            }
            imageBackground="#A5CDC0"
            imageAlt=""
            textTitle="Learn to create actionable solutions"
            content={
              <>
                <p className={styles.JoinTheEffortStepText}>
                  Apply to our Political Determinants of Health Learning
                  Laboratory Fellowship. We seek to partner and support diverse
                  groups in building equitable and sustainable pathways for
                  healthy communities.
                </p>
                <p>
                  <Button
                    className={styles.ContactUsLink}
                    aria-label="Learn More: Satcher Institute Political Determinants of Health Learning Laboratory Program"
                    href="https://satcherinstitute.org/programs/political-determinants-of-health-learning-laboratory-program/"
                  >
                    Learn More
                  </Button>
                </p>
              </>
            }
          />

          <JoinTheEffortContainer
            imageUrl={
              prefersReducedMotion
                ? "img/HET-fields-no-motion.gif"
                : "img/HET_Fields_1_v2_1000px.gif"
            }
            imageBackground="#EDB2A6"
            imageAlt=""
            textTitle="Give back to your community"
            content={
              <>
                <p className={styles.JoinTheEffortStepText}>
                  Are you a community leader interested in expanding
                  transportation access to vaccine sites within your community?
                  Complete our inquiry form to receive information on our
                  vaccine rideshare efforts and opportunities.
                </p>
                <p>
                  <Button
                    className={styles.ContactUsLink}
                    aria-label="Sign Up - vaccine rideshare program"
                    href="https://satcherinstitute.org/uberrideshare/"
                  >
                    Sign Up
                  </Button>
                </p>
              </>
            }
          />

          <JoinTheEffortContainer
            imageUrl={
              prefersReducedMotion
                ? "img/HET-dots-no-motion.gif"
                : "img/HET_Dots_1_v3_1000px.gif"
            }
            imageBackground="#275141"
            imageAlt=""
            textTitle="Sign up for our newsletter"
            content={
              <>
                <p className={styles.JoinTheEffortStepText}>
                  Want updates on the latest news in health equity? Sign up for
                  our Satcher Health Leadership Institute newsletter.
                </p>
                <form
                  action="https://satcherinstitute.us11.list-manage.com/subscribe?u=6a52e908d61b03e0bbbd4e790&id=3ec1ba23cd&"
                  method="post"
                  target="_blank"
                >
                  <TextField
                    id="Enter email address to sign up" // Accessibility label
                    name="MERGE0"
                    variant="outlined"
                    className={styles.EmailTextField}
                    type="email"
                    aria-label="Enter Email Address for Newsletter signup"
                    placeholder="Enter email address"
                  />
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    className={styles.EmailAddressFormSubmit}
                    aria-label="Sign Up for Newsletter in a new window"
                  >
                    Sign up
                  </Button>
                </form>
              </>
            }
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default EquityTab;
