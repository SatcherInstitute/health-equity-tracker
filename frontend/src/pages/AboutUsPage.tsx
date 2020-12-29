import React from "react";
import styles from "./LandingPage.module.scss";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

function AboutUsPage() {
  return (
    <div className={styles.LandingPage}>
      <Grid container justify="space-around" className={styles.Grid}>
        <Grid item xs={12} className={styles.GreenLandingSquare}>
          <Typography variant="h6" className={styles.HomeLogo}>
            Contact Info
          </Typography>
          <ul>
            <li>Full address of SHLI</li>
            <li>Operational hours of SHLI</li>
            <li>503c identification (need to confirm)</li>
          </ul>
        </Grid>
        <Grid item xs={12} sm={10} md={12}>
          <Grid item xs={12} className={styles.BlueLandingSquare}>
            <Typography variant="h6" className={styles.HomeLogo}>
              FAQ
            </Typography>
          </Grid>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>Question 1</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Suspendisse malesuada lacus ex, sit amet blandit leo lobortis
                eget.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>Question 2</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Suspendisse malesuada lacus ex, sit amet blandit leo lobortis
                eget.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>Question 3</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Suspendisse malesuada lacus ex, sit amet blandit leo lobortis
                eget.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </div>
  );
}

export default AboutUsPage;
