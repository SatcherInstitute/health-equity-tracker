import React from "react";
import styles from "./LandingPage.module.scss";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import { linkToMadLib, LinkWithStickyParams } from "../../utils/urlutils";

/* TODO - Align with mocks, Clean up CSS */
function LandingPage() {
  return (
    <div className={styles.LandingPage}>
      <Grid container justify="space-around" className={styles.Grid}>
        <Grid item xs={12}>
          <Typography
            variant="h6"
            align="left"
            style={{ fontSize: "56px", textAlign: "center" }}
          >
            Health Equity Tracker
          </Typography>
          <p>
            Our tracker shows health data for the United States and its
            Territories using <a href="/">key data sources</a>
            {/* TODO - Add link value */}
          </p>
          <div
            style={{
              textAlign: "center",
              backgroundImage: "url('img/LandingUSAWide.png')",
              width: "665px",
              marginBottom: "80px",
            }}
          >
            <LinkWithStickyParams
              to={linkToMadLib("disparity", { 1: "covid", 3: "00" })}
            >
              <Button
                style={{
                  background: "white",
                  marginTop: "210px",
                  marginBottom: "210px",
                }}
              >
                Explore the data
              </Button>
            </LinkWithStickyParams>
          </div>
        </Grid>

        <Grid item xs={4} className={styles.ThreeSquares}>
          <img width="100%" alt="Data map" src="img/LandingSatcher.png" />
          <Typography variant="h6" align="left">
            Our Initiative
          </Typography>
          <p>
            We bring together health equity leaders, organizations, and
            institutions from across the country to share best practices,
            identify common goals, and advance health equity.
          </p>
        </Grid>
        <Grid item xs={4} className={styles.ThreeSquares}>
          <img width="100%" alt="Data map" src="img/LandingOurProject.png" />
          <Typography variant="h6" align="left">
            Our Project
          </Typography>
          <p>
            Our team aggregates and displays data on how social vulnerabilities
            and other inequities affect the health outcomes of people with major
            conditions like COVID-19, asthma, and heart disease.
          </p>
        </Grid>
        <Grid item xs={4} className={styles.ThreeSquares}>
          <img width="100%" alt="Data map" src="img/LandingOurImpact.png" />
          <Typography variant="h6" align="left">
            Our Impact
          </Typography>
          <p>
            Our project combats the under-reporting, misreporting, or lack of
            health data on racial/ethnic minorities by actively collecting this
            data, which in turn will help provide science-backed evidence to
            support policies addressing health inequities.{" "}
          </p>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" align="left">
            Latest Insights
          </Typography>
          <p>Explore the latest data insights from the Health Equity Tracker</p>
        </Grid>
        <Grid item xs={12}>
          <Paper className={styles.Paper}>
            <Typography variant="button" color="primary">
              Featured
            </Typography>
            <span className={styles.PaperTitle}>
              COVID-19 Deaths among the Black Population
            </span>
            <Grid container spacing={5}>
              <Grid item xs={7}>
                <img
                  src="img/LandingCircleMap.png"
                  alt="Data map"
                  width="100%"
                />
              </Grid>
              <Grid item xs={4}>
                <p>
                  Explore racial breakdowns of COVID-19 data in the United
                  States for Black populations
                </p>
                <LinkWithStickyParams
                  to={linkToMadLib("disparity", { 1: "covid", 3: "00" })}
                >
                  <Button color="primary" variant="contained">
                    Explore the data
                  </Button>
                </LinkWithStickyParams>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={styles.Paper}>
            <Typography variant="button" color="primary">
              Featured
            </Typography>
            <span className={styles.PaperTitle}>COVID-19 in Pennsylvania</span>
            <p>
              <img src="img/LandingPA.png" alt="Data map" />
            </p>
            <p>
              Look where the highest rates of COVID-19 are in the state of
              Pennsylvania, and among which racial groups{" "}
            </p>
            <LinkWithStickyParams
              to={linkToMadLib("disparity", { 1: "covid", 3: "42" })}
            >
              <Button color="primary" variant="contained">
                Explore the data
              </Button>
            </LinkWithStickyParams>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={styles.Paper}>
            <Typography variant="button" color="primary">
              Featured
            </Typography>
            <span className={styles.PaperTitle}>
              Diabetes in the United States
            </span>
            <p>
              <img src="img/LandingGhostyUs.png" alt="Data map" />
            </p>
            <p>
              Explore racial breakdowns of Diabetes data in the United States.
            </p>
            <LinkWithStickyParams
              to={linkToMadLib("disparity", { 1: "diabetes", 3: "00" })}
            >
              <Button color="primary" variant="contained">
                Explore the data
              </Button>
            </LinkWithStickyParams>
          </Paper>
        </Grid>
      </Grid>
      <Grid
        item
        xs={12}
        style={{ background: "rgba(167,208,195,0.2)", marginTop: "150px" }}
      >
        <Grid container style={{ width: "600px", margin: "auto" }}>
          <Grid item xs={6}>
            <img
              src="img/pdoh_book.png"
              alt="The Political Determinants of Health"
            />
          </Grid>
          <Grid item xs={6}>
            <h3>The Political Determinants of Health</h3>
            <p>
              Daniel Dawes argues that political determinants of health create
              the social drivers that affect all other dynamics of health. By
              understanding these determinants, their origins, and their impact
              on the equitable distribution of opportunities and resources, we
              will be better equipped to implement actionable solutions to close
              the health gap
            </p>
            <Button color="primary">Order now</Button>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default LandingPage;
