import React from "react";
import styles from "./LandingPage.module.scss";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { linkToMadLib } from "../utils/urlutils";
import ImageButton from "./ui/ImageButton";

function LandingPage() {
  return (
    <div className={styles.LandingPage}>
      <Grid container justify="space-around" className={styles.Grid}>
        <Grid item xs={12} sm={4} className={styles.GreySquare}>
          <img width="200px" alt="placeholder" src="img/landing1.png" />
          <Typography variant="h6" align="left">
            Our Initiative
          </Typography>
          <p>
            (Draft) We convene staff from all divisions who help streamline
            coordination and foster collaboration of health equity efforts
            within the agency.
          </p>
        </Grid>
        <Grid item xs={12} sm={4} className={styles.GreySquare}>
          <img width="200px" alt="placeholder" src="img/landing2.png" />
          <Typography variant="h6" align="left">
            Our Project
          </Typography>
          <p>
            (Draft) Social determinants of health are conditions which influence
            individual and population health. For a health equity analysis, one
            must describe the connection between SDOH and health using
            well-documented research.
          </p>
        </Grid>
        <Grid item xs={12} sm={4} className={styles.GreySquare}>
          <img width="200px" alt="placeholder" src="img/landing3.png" />
          <Typography variant="h6" align="left">
            Our Impact
          </Typography>
          <p>
            (Draft) We bring together health equity leaders, organizations and
            institutions from across the states, share best practices and
            identify common goals to advance health equity.
          </p>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" align="left">
            Latest Efforts
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} className={styles.BlueLandingSquare}>
          <Typography variant="h6" className={styles.HomeLogo}>
            COPD in the USA
          </Typography>
          <p>Florida has the highest cases of COPD in the united states.</p>
        </Grid>
        <Grid item xs={12} sm={6} className={styles.LandingSquare}>
          <ImageButton
            imageUrl="img/copd_usa.png"
            text="Explore the Data"
            link={linkToMadLib("disparity", {})}
          />
        </Grid>
        <Grid item xs={12} sm={6} className={styles.LandingSquare}>
          <ImageButton
            imageUrl="img/penn_unemp.png"
            text="Explore the Data"
            link={linkToMadLib("disparity", {})}
          />
        </Grid>
        <Grid item xs={12} sm={6} className={styles.GreenLandingSquare}>
          <Typography variant="h6" className={styles.HomeLogo}>
            COVID-19 in Pennsylvania
          </Typography>
          <p>
            Look at where the highest rates of COVID-19 are in the state of
            Pennsylvania
          </p>
        </Grid>
        <Grid item xs={12} sm={6} className={styles.BlueLandingSquare}>
          <Typography variant="h6" className={styles.HomeLogo}>
            Diabetes in American Indian/Alaska Native, non hispanic population
          </Typography>
          <p>Explore racial breakdowns of Diabetes data in the United States</p>
        </Grid>
        <Grid item xs={12} sm={6} className={styles.LandingSquare}>
          <ImageButton
            imageUrl="img/diabetes_amin.png"
            text="Explore the Data"
            link={linkToMadLib("disparity", {})}
          />
        </Grid>
        <Grid item xs={12} container className={styles.GreenLandingSquare}>
          <Grid item xs={12} sm={6}>
            <img
              height="300px"
              alt="placeholder"
              src="https://images-na.ssl-images-amazon.com/images/I/41dnPeFppOL._SX353_BO1,204,203,200_.jpg"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" className={styles.HomeLogo}>
              The Political Determints of Health
            </Typography>
            <p>
              Daniel Dawes argues that political determinants of health create
              the social drivers that affect all other dynamics of health. By
              understanding these determinants, we will be better equipped to
              implement actionable solutions to close the health gap.
              <Button variant="outlined">Explore Data</Button>
            </p>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default LandingPage;
