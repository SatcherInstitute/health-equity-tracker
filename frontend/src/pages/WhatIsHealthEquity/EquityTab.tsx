import React from "react";
import styles from "./WhatIsHealthEquityPage.module.scss";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import FaqSection from "../ui/FaqSection";
import {
  DYNAMIC_COPY_KEY,
  fetchCopyData,
  REACT_QUERY_OPTIONS,
} from "../../utils/urlutils";
import {
  NEWS_TAB_LINK,
  WIHE_JOIN_THE_EFFORT_SECTION_ID,
} from "../../utils/internalRoutes";
import { Box } from "@material-ui/core";
import { usePrefersReducedMotion } from "../../utils/hooks/usePrefersReducedMotion";
import { Helmet } from "react-helmet-async";
import LazyLoad from "react-lazyload";
import { useQuery } from "react-query";
import sass from "../../styles/variables.module.scss";
import { urlMap } from "../../utils/externalUrls";
import { Link } from "react-router-dom";

interface WIHEWordpressCopy {
  section2_headingLevel2: string;
  section4_headingLevel2: string;
  section4_heading2_text: string;
  section4_a_headingLevel3: string;
  section4_a_heading3_text: string;
  section4_a_heading3_link: {
    title: string;
    url: string;
    target: string;
  };
  section4_b_headingLevel3: string;
  section4_b_heading3_text: string;
  section4_b_heading3_link: {
    title: string;
    url: string;
    target: string;
  };
  section4_c_headingLevel3: string;
  section4_c_heading3_text: string;
}

/* 
Some of the copy for this tab page is loaded from https://hetblog.dreamhosters.com/wp-json/wp/v2/pages/37
The object below provides fallback if that fetch fails
*/

export const WIHEFallbackCopy: WIHEWordpressCopy = {
  section2_headingLevel2: "Health equity learning",
  section4_headingLevel2: "How do I join the movement?",
  section4_heading2_text:
    "To advance health equity, we need smart, talented, passionate folks like you on board.",
  section4_a_headingLevel3: "Learn to create actionable solutions",
  section4_a_heading3_text:
    "Apply to our Political Determinants of Health Learning Laboratory Fellowship. We seek to partner and support diverse groups in building equitable and sustainable pathways for healthy communities.",
  section4_a_heading3_link: {
    title: "Learn More",
    url: "https://satcherinstitute.org/programs/political-determinants-of-health-learning-laboratory-program/",
    target: "_blank",
  },
  section4_b_headingLevel3: "Give back to your community",
  section4_b_heading3_text:
    "Are you a community leader interested in expanding transportation access to vaccine sites within your community? Complete our inquiry form to receive information on our vaccine rideshare efforts and opportunities.",
  section4_b_heading3_link: {
    title: "Sign Up*",
    url: "https://satcherinstitute.org/uberrideshare/",
    target: "_blank",
  },
  section4_c_headingLevel3: "Sign up for our newsletter",
  section4_c_heading3_text:
    "Want updates on the latest news in health equity? Sign up for our Satcher Health Leadership Institute newsletter.",
};

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
      justifyContent="space-around"
      className={styles.JoinTheEffortItemContainer}
    >
      <Grid
        item
        md={5}
        lg={5}
        className={styles.JoinTheEffortImgContainer}
        style={{ backgroundColor: props.imageBackground }}
      >
        <LazyLoad offset={300} height={500} once>
          <img
            src={props.imageUrl}
            alt={props.imageAlt}
            className={styles.JoinTheEffortImg}
          />
        </LazyLoad>
      </Grid>
      <Grid item sm={12} md={6} className={styles.JoinTheEffortTextContainer}>
        <Typography
          className={styles.JoinTheEffortStepHeaderText}
          variant="h2"
          component="h4"
        >
          {props.textTitle}
        </Typography>
        {props.content}
      </Grid>
    </Grid>
  );
}

function EquityTab() {
  const prefersReducedMotion = usePrefersReducedMotion();

  let wordpressCopy: WIHEWordpressCopy = WIHEFallbackCopy;
  const { data }: any = useQuery(
    DYNAMIC_COPY_KEY,
    () => fetchCopyData(),
    REACT_QUERY_OPTIONS
  );
  if (data) wordpressCopy = data.data?.acf;

  return (
    <>
      <div>
        <Helmet>
          <title>What is Health Equity - Health Equity Tracker</title>
        </Helmet>
        <Grid container className={styles.Grid}>
          <Grid
            container
            className={styles.HeaderRow}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Grid
              container
              item
              xs={12}
              sm={12}
              md={4}
              className={styles.HeaderImgItem}
            >
              <LazyLoad offset={300} height={760} once>
                <img
                  width="397"
                  height="760"
                  src="/img/stock/woman-in-wheelchair-with-tea.png"
                  className={styles.HeaderImg}
                  alt=""
                />
              </LazyLoad>
            </Grid>
            <Grid item xs={12} sm={12} md={8} className={styles.HeaderTextItem}>
              <Box mb={5}>
                <Typography
                  id="main"
                  className={styles.HeaderText}
                  variant="h2"
                  component="h2"
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
              <Typography className={styles.HeaderSubtext} variant="body1">
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
                justifyContent="space-between"
                alignItems="flex-start"
                className={styles.DefinitionsContainer}
              >
                {/* PDOH */}
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={6}
                  className={styles.DefinitionsItem}
                >
                  <Typography
                    className={styles.DefinitionHeader}
                    variant="h2"
                    component="h3"
                  >
                    Political determinants of health
                  </Typography>
                  <p className={styles.DefinitionText}>
                    The Political determinants of health involve the systematic
                    process of structuring relationships, distributing
                    resources, and administering power, operating simultaneously
                    in ways that mutually reinforce or influence one another to
                    shape opportunities that either advance health equity or
                    exacerbate health inequities.
                  </p>
                  <span className={styles.DefinitionSourceSpan}>
                    Daniel Dawes, 2020
                  </span>
                </Grid>

                {/* SDOH */}
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={6}
                  className={styles.DefinitionsItem}
                >
                  <Typography
                    className={styles.DefinitionHeader}
                    variant="h2"
                    component="h3"
                  >
                    Social determinants of health
                  </Typography>
                  <p className={styles.DefinitionText}>
                    The conditions in the environments in which people are born,
                    live, learn, work, play, worship, and age that affect a wide
                    range of health, functioning, and quality-of-life outcomes
                    and risks.
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
            justifyContent="center"
          >
            <Grid
              container
              className={styles.ResourcesRow}
              justifyContent="center"
            >
              <Grid item>
                <Typography className={styles.ResourcesHeaderText} variant="h3">
                  {wordpressCopy?.section2_headingLevel2}
                </Typography>
              </Grid>
              <Grid
                container
                className={styles.ResourcesContainer}
                direction="row"
                justifyContent="space-around"
                item
                xs={12}
              >
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={9}
                  className={styles.ResourceItem}
                >
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
                  <h4 className={styles.MainResourceTitleText}>
                    Learn about the Political Determinants of Health through the{" "}
                    <b>Allegory of the Orchard</b>
                  </h4>
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
                    justifyContent="space-evenly"
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
                      <h4 className={styles.ResourceTitleText}>
                        Jessica's Story
                      </h4>
                      <p className={styles.ResourceSubtitleText}>
                        How political determinants of health operate and the
                        impact they have on BIPOC communities.
                      </p>
                    </Grid>
                    <Grid item className={styles.ResourceItem}>
                      <a href={urlMap.ncrn}>
                        <LazyLoad offset={300} height={200} once>
                          <img
                            className={styles.ResourceImg}
                            src="/img/graphics/NCRN.png"
                            alt="Header for Morehouse School of Medicine National COVID-19 Resiliency Network"
                          />
                        </LazyLoad>
                        <h4 className={styles.ResourceTitleText}>
                          Morehouse School of Medicine National COVID-19
                          Resiliency Network (NCRN)
                        </h4>
                        <p className={styles.ResourceSubtitleText}>
                          We provide awareness and linkage to critical health
                          information and services, helping families recover
                          from difficulties that may have been caused or
                          worsened by the Coronavirus (COVID-19) pandemic.
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
              justifyContent="center"
            >
              <Grid item>
                <Typography
                  className={styles.NewsAndStoriesHeaderText}
                  variant="h3"
                >
                  News and stories
                </Typography>

                <Box mt={5}>
                  <Typography
                    className={styles.PrioritizeHealthEquityHeaderSubtext}
                    variant="body1"
                    paragraph={true}
                  ></Typography>
                </Box>

                <span className={styles.NewsAndStoriesSubheaderText}>
                  Read the{" "}
                  <Link to={NEWS_TAB_LINK}>
                    latest news, posts, and stories
                  </Link>{" "}
                  related to health equity, or learn more from the articles
                  below.
                </span>
              </Grid>
              <LazyLoad offset={300} height={700} once>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={6}
                    className={styles.NewsAndStoriesItem}
                    component="article"
                  >
                    <a
                      href="https://satcherinstitute.org/hetblog2/"
                      aria-label="Satcher Blog Post on Why Data Matters"
                    >
                      <img
                        className={styles.NewsAndStoriesBigImg}
                        src="/img/stock/kid-gets-a-mask.png"
                        alt=""
                      />
                      <h4 className={styles.NewsAndStoriesTitleText}>
                        Why it matters that information on race, ethnicity,
                        gender and disability are measured accurately and
                        completely
                      </h4>
                    </a>
                    <p className={styles.NewsAndStoriesSubtitleText}>
                      Why ongoing data on health and well-being metrics could be
                      used in targeting federal resources and programs to
                      address inequities due to social and economic factors.{" "}
                      <a
                        href="https://satcherinstitute.org/hetblog2/"
                        aria-label="Satcher Blog Post on Why Data Matters"
                      >
                        Read article at SatcherInstitute.org
                      </a>
                    </p>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={6}
                    className={styles.NewsAndStoriesItem}
                    component="article"
                  >
                    <a
                      href="https://satcherinstitute.org/hetblog3/"
                      aria-label="Satcher Blog Post on Health Equity Data"
                    >
                      <img
                        className={styles.NewsAndStoriesBigImg}
                        src="/img/stock/girls-studying.jpg"
                        alt=""
                      />
                      <h4 className={styles.NewsAndStoriesTitleText}>
                        How can we use data to inform practices to advance
                        health equity?
                      </h4>
                    </a>
                    <p className={styles.NewsAndStoriesSubtitleText}>
                      In public health, much of our work depends on having
                      accurate data, so we know what’s happening both on the
                      ground and at a population level.{" "}
                      <a
                        href="https://satcherinstitute.org/hetblog3/"
                        aria-label="Satcher Blog Post on Health Equity Data"
                      >
                        Read article at SatcherInstitute.org
                      </a>
                    </p>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    className={styles.NewsAndStoriesItem}
                    component="article"
                  >
                    <a
                      href="https://www.scientificamerican.com/article/data-and-technology-can-help-us-make-progress-on-covid-inequities/"
                      aria-label="Read Scientific American Article"
                    >
                      <img
                        className={styles.NewsAndStoriesSmallImg}
                        src="/img/stock/filling-in-forms.png"
                        alt=""
                      />
                      <h4 className={styles.NewsAndStoriesTitleText}>
                        Data and technology can help us make progress on COVID
                        inequities
                      </h4>
                    </a>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    className={styles.NewsAndStoriesItem}
                    component="article"
                  >
                    <a
                      href="https://satcherinstitute.github.io/analysis/cdc_case_data"
                      aria-label="Satcher Post on COVID Data Completeness"
                    >
                      <img
                        className={styles.NewsAndStoriesSmallImg}
                        src="/img/stock/kids-ukulele.png"
                        alt=""
                      />
                      <h4 className={styles.NewsAndStoriesTitleText}>
                        How complete are the CDC's COVID-19 case surveillance
                        datasets for race/ethnicity at Tte state and county
                        levels?
                      </h4>
                    </a>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    className={styles.NewsAndStoriesItem}
                    component="article"
                  >
                    <a
                      href="https://www.kennedysatcher.org/blog/the-mental-fitness-of-our-children"
                      aria-label="Kennedy Satcher Article: The Mental Fitness of Our Children"
                    >
                      <img
                        className={styles.NewsAndStoriesSmallImg}
                        src="/img/graphics/laptop-HET.png"
                        alt=""
                      />
                      <h4 className={styles.NewsAndStoriesTitleText}>
                        The mental fitness of our children
                      </h4>
                    </a>
                  </Grid>
                </Grid>
              </LazyLoad>
            </Grid>
          </Grid>
          <Grid
            container
            className={styles.FaqRow}
            alignItems="center"
            justifyContent="center"
          >
            <Grid item sm={12} md={10}>
              <FaqSection />
            </Grid>
          </Grid>
        </Grid>
        <Grid
          container
          className={styles.JoinTheEffortRow}
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <Grid
            item
            className={styles.JoinTheEffortHeaderRow}
            id={WIHE_JOIN_THE_EFFORT_SECTION_ID}
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <Typography
              className={styles.JoinTheEffortHeaderText}
              variant="h2"
              component="h3"
            >
              {wordpressCopy?.section4_headingLevel2}
            </Typography>
            <span className={styles.JoinTheEffortSubheaderText}>
              {wordpressCopy?.section4_heading2_text}
            </span>
          </Grid>

          <JoinTheEffortContainer
            imageUrl={
              prefersReducedMotion
                ? "img/HET-lines-no-motion.gif"
                : "img/animations/HET-lines.gif"
            }
            imageBackground={sass.joinEffortBg1}
            imageAlt=""
            textTitle={wordpressCopy?.section4_a_headingLevel3}
            content={
              <>
                <p className={styles.JoinTheEffortStepText}>
                  {wordpressCopy?.section4_a_heading3_text}
                </p>
                <p>
                  <Button
                    className={styles.ContactUsLink}
                    href={wordpressCopy?.section4_a_heading3_link?.url}
                    target={wordpressCopy?.section4_a_heading3_link?.target}
                  >
                    {wordpressCopy?.section4_a_heading3_link?.title}
                  </Button>
                </p>
              </>
            }
          />

          <JoinTheEffortContainer
            imageUrl={
              prefersReducedMotion
                ? "img/HET-fields-no-motion.gif"
                : "img/animations/HET-fields.gif"
            }
            imageBackground={sass.joinEffortBg2}
            imageAlt=""
            textTitle={wordpressCopy?.section4_b_headingLevel3}
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
                : "img/animations/HET-dots.gif"
            }
            imageBackground={sass.joinEffortBg3}
            imageAlt=""
            textTitle={wordpressCopy?.section4_c_headingLevel3}
            content={
              <>
                <p className={styles.JoinTheEffortStepText}>
                  {wordpressCopy?.section4_c_heading3_text}
                </p>
                <form
                  action={urlMap.newsletterSignup}
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
      </div>
    </>
  );
}
export default EquityTab;
