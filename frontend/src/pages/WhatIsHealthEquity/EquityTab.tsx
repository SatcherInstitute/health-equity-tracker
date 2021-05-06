import React, { useState } from "react";
import styles from "./WhatIsHealthEquityPage.module.scss";
import Button from "@material-ui/core/Button";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import FacebookIcon from "@material-ui/icons/Facebook";
import TwitterIcon from "@material-ui/icons/Twitter";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import {
  LinkWithStickyParams,
  TAB_PARAM,
  ABOUT_US_PAGE_LINK,
} from "../../utils/urlutils";
import { ABOUT_US_CONTACT_TAB_INDEX } from "../AboutUs/AboutUsPage";
import { CopyToClipboard } from "react-copy-to-clipboard";
import FaqSection from "../ui/FaqSection";

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
        <Typography className={styles.JoinTheEffortStepHeaderText} variant="h3">
          {props.textTitle}
        </Typography>
        {props.content}
      </Grid>
    </Grid>
  );
}

function EquityTab() {
  const [textCopied, setTextCopied] = useState(false);

  return (
    <>
      <title>What is Health Equity? - About Us - Health Equity Tracker</title>
      <h1 className={styles.ScreenreaderTitleHeader}>What is Health Equity?</h1>
      <div className={styles.WhatIsHealthEquityPage}>
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
                  alt="A woman in a wheelchair relaxing with a cup of tea"
                />
              </Grid>
            </Hidden>
            <Grid item xs={12} sm={12} md={8} className={styles.HeaderTextItem}>
              <Typography
                id="main"
                tabIndex={-1}
                className={styles.HeaderText}
                variant="h2"
              >
                What is Health Equity?
              </Typography>
              <br />
              <Typography className={styles.HeaderSubtext} variant="body1">
                <p>
                  <b>Health Equity</b> exists when all people, regardless of
                  race, gender, socio-economic status, geographic location, or
                  other societal constructs have the same access, opportunity,
                  and resources to achieve their highest potential for health
                   (Health Equity Leadership & Exchange Network)
                </p>
                <p>
                  Unfortunately, political and social determinants of health
                  negatively affect many marginalized communities, their people,
                  and their ability to lead healthy lives.
                </p>
                <br />
              </Typography>
              <Grid
                container
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
                  <Typography className={styles.DefinitionHeader} variant="h3">
                    Political determinants of health
                  </Typography>
                  <p className={styles.DefinitionPronunciation}>
                    /pəˈlidək(ə)l dəˈtərmənənts əv helTH/
                  </p>
                  <p className={styles.DefinitionText}>
                    The creators of structural conditions and the social drivers
                    – including poor environmental conditions, inadequate
                    transportation, unsafe neighborhoods, and lack of healthy
                    food options – that affect all other dynamics of health.
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
                  <Typography className={styles.DefinitionHeader} variant="h3">
                    Social determinant of health
                  </Typography>
                  <p className={styles.DefinitionPronunciation}>
                    /ˈsōSHəl dəˈtərmənənt əv helTH/
                  </p>
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
            justify="center"
          >
            <Grid container className={styles.ResourcesRow} justify="center">
              <Grid item>
                <Typography className={styles.ResourcesHeaderText} variant="h2">
                  Health equity resources
                </Typography>
              </Grid>
              <Grid
                container
                className={styles.ResourcesContainer}
                direction="row"
                justify="space-around"
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
                  <h3 className={styles.MainResourceTitleText}>
                    Learn about the Political Determinants of Health through the{" "}
                    <b>Allegory of the Orchard</b>
                  </h3>
                  <p className={styles.MainResourceSubtitleText}>
                    Girding all health determinants is one that rarely gets
                    addressed but which has power over all aspects of health:
                    political determinants of health
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
                      <h3 className={styles.ResourceTitleText}>
                        Jessica's Story
                      </h3>
                      <p className={styles.ResourceSubtitleText}>
                        How political determinants of health operate and the
                        impact they have on BIPOC communities
                      </p>
                    </Grid>
                    <Grid item className={styles.ResourceItem}>
                      <a href="https://ncrn.msm.edu/">
                        <img
                          className={styles.ResourceImg}
                          src="img/maxresdefault (1) 1.png"
                          alt="Header for Morehouse School of Medicine
                             National COVID-19 Resiliency Network"
                        />
                        <h3 className={styles.ResourceTitleText}>
                          Morehouse School of Medicine National COVID-19
                          Resiliency Network (NCRN)
                        </h3>
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
              justify="center"
            >
              <Grid item>
                <Typography
                  className={styles.NewsAndStoriesHeaderText}
                  variant="h2"
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
                    alt="Asian woman assisting a young black child with his
                       mask"
                  />
                  <h3 className={styles.NewsAndStoriesTitleText}>
                    COVID-19: Black Folks Have Been Trying To Tell You That Data
                    Is Political
                  </h3>
                  <p className={styles.NewsAndStoriesSubtitleText}>
                    COVID-19 does not discriminate, but our current economic and
                    social policies do. Let’s talk about “a crisis within a
                    crisis” that too few policy makers and leaders have been
                    raising.{" "}
                    <a href="https://www.essence.com/feature/covid-19-black-americans-data/">
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
                    src="img/pexels-cottonbro-7000149 1.png"
                    alt="Asian woman sitting while wearing a mask"
                  />
                  <h3 className={styles.NewsAndStoriesTitleText}>
                    Back to ‘normal’ isn’t good enough
                  </h3>
                  <p className={styles.NewsAndStoriesSubtitleText}>
                    With the anticipation of increasing distribution of Covid-19
                    vaccines, Americans are looking forward to a “return to
                    normal.” But the reality is that “normal” is a privilege,
                    one that is out of reach for millions.{" "}
                    <a href="https://www.statnews.com/2021/02/10/back-to-normal-isnt-good-enough/">
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
                    alt="Documents lying on a table"
                  />
                  <h3 className={styles.NewsAndStoriesTitleText}>
                    Data and Technology Can Help Us Make Progress on COVID
                    Inequities
                  </h3>
                  <p className={styles.NewsAndStoriesSubtitleText}>
                    <a href="https://www.scientificamerican.com/article/data-and-technology-can-help-us-make-progress-on-covid-inequities/">
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
                    alt="Asian woman laughing with two children"
                  />
                  <h3 className={styles.NewsAndStoriesTitleText}>
                    How complete are the CDC's COVID-19 Case Surveillance
                    datasets for race/ethnicity at the state and county levels?
                  </h3>
                  <p className={styles.NewsAndStoriesSubtitleText}>
                    <a href="https://satcherinstitute.github.io/analysis/cdc_case_data">
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
                    alt="Laptop sitting on desk and opened to the Health
                       Equity Tracker Homepage"
                  />
                  <h3 className={styles.NewsAndStoriesTitleText}>
                    How To Include The Social Determinants That Impact
                    Behavioral Health In A Health Equity Tracker
                  </h3>
                  <p className={styles.NewsAndStoriesSubtitleText}>
                    <a href="https://satcherinstitute.org/post-4840/">
                      Learn more
                    </a>
                  </p>
                </Grid>
              </Grid>
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
              container
              item
              xs={12}
              className={styles.FaqRow}
              alignItems="center"
              justify="center"
            >
              <Grid sm={12} md={10}>
                <FaqSection />
              </Grid>
            </Grid>
            <Grid item className={styles.JoinTheEffortHeaderRow}>
              <Typography
                className={styles.JoinTheEffortHeaderText}
                variant="h2"
              >
                How do I join the effort?
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
              imageUrl="img/HET_Dots_1_v3_1000px.gif"
              imageBackground="#275141"
              imageAlt="Decorative dots"
              textTitle="Sign up for our newsletter"
              content={
                <>
                  <p className={styles.JoinTheEffortStepText}>
                    Want updates on the latest news in health equity? Sign up
                    for our Satcher Health Leadership Institute newsletter.
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
                      placeholder="Enter email address"
                    />
                    <Button
                      type="submit"
                      color="primary"
                      variant="contained"
                      className={styles.EmailAddressFormSubmit}
                    >
                      Sign up
                    </Button>
                  </form>
                </>
              }
            />
            <JoinTheEffortContainer
              imageUrl="img/HET_Fields_1_v2_1000px.gif"
              imageBackground="#EDB2A6"
              imageAlt="Decorative thick lines"
              textTitle="Share information with your community"
              content={
                <>
                  <p className={styles.JoinTheEffortStepText}>
                    Movements begin with awareness, and gain momentum with
                    excitement. We need your help in creating both for the
                    movement to advance health equity!
                    <br />
                    <br />
                    Share this tool with your network
                  </p>
                  <div className={styles.SocialsDiv}>
                    <IconButton
                      target="_blank"
                      href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fhealthequitytracker.org%2F&amp;src=sdkpreparse"
                    >
                      <FacebookIcon className={styles.SocialsIcon} />
                    </IconButton>
                    <IconButton
                      target="_blank"
                      href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fhealthequitytracker.org"
                    >
                      <LinkedInIcon className={styles.SocialsIcon} />
                    </IconButton>
                    <IconButton
                      target="_blank"
                      href="https://twitter.com/share?url=https%3A%2F%2Fwww.healthequitytracker.org"
                    >
                      <TwitterIcon className={styles.SocialsIcon} />
                    </IconButton>
                  </div>
                  <TextField
                    InputProps={{
                      readOnly: true,
                    }}
                    id="www.healthequitytracker.org" // Accessibility label
                    variant="outlined"
                    defaultValue="www.healthequitytracker.org"
                    className={styles.TextField}
                  />
                  <div className={styles.SocialsDiv}>
                    <CopyToClipboard
                      text="www.healthequitytracker.org"
                      onCopy={() => {
                        setTextCopied(true);
                        setTimeout(() => setTextCopied(false), 1500);
                      }}
                    >
                      <Button
                        className={styles.CopyIcon}
                        startIcon={<FileCopyIcon />}
                      >
                        Copy link to clipboard
                      </Button>
                    </CopyToClipboard>
                    {textCopied && <span>Text copied!</span>}
                  </div>
                </>
              }
            />
            <JoinTheEffortContainer
              imageUrl="img/HET_Overlapping_Lines_v4_1000px.gif"
              imageBackground="#A5CDC0"
              imageAlt="Decorative thin lines"
              textTitle="Share your story"
              content={
                <>
                  <p className={styles.JoinTheEffortStepText}>
                    We would love to hear about and feature your work in health
                    equity, or if you’ve used the Health Equity Tracker to take
                    action, implement a program, advocate for change, or more.
                  </p>
                  <LinkWithStickyParams
                    class={styles.ContactUsLink}
                    to={`${ABOUT_US_PAGE_LINK}?${TAB_PARAM}=${ABOUT_US_CONTACT_TAB_INDEX}`}
                  >
                    Contact Us
                  </LinkWithStickyParams>
                </>
              }
            />
          </Grid>
        </Grid>
      </div>
    </>
  );
}

export default EquityTab;
