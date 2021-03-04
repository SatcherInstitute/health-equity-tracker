import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import styles from "./AboutUsPage.module.scss";

const PARTNERS = [
  {
    imageUrl: "img/PartnerSatcher.png",
    alt: "alt",
  },
  {
    imageUrl: "img/PartnerGilead.png",
    alt: "alt",
  },
  {
    imageUrl: "img/PartnerCdc.png",
    alt: "alt",
  },
  {
    imageUrl: "img/PartnerGoogle.png",
    alt: "alt",
  },
]

const LEADERSHIP_TEAM = [
  {
    name: "Daniel Dawes, JD",
    role: "Co-Principal Investigator",
    imageUrl: "img/Daniel-E 1.png",
  },
  {
    name: "Nelson Dunlap, JD",
    role: "Co-Principal Investigator",
    imageUrl: "img/DunlapNelson.png",
  },
  {
    name: "Ebony Respress, MPH",
    role: "Project Director",
    imageUrl: "img/RespressEbony.png",
  },
  {
    name: "Maisha Standifer, PhD, MPH",
    role: "Health Policy Analyst",
    imageUrl: "img/maisha-standifer.jpg",
  },
  {
    name: "Jammie Hopkins, DrPH, MS",
    role: "Coalition/Engagement",
    imageUrl: "img/jammie-hopkins.jpg",
  },
]

const GOOGLE_FELLOWS = [
  {
    name: "Chelsea Seabron",
    role: "Google.org Manager",
  },
  {
    name: "Rasmi Elasmar",
    role: "Google.org Manager",
  },
  {
    name: "Jen Carter",
    role: "Google.org Manager",
  },
  {
    name: "Colin Jackson",
    role: "Product Manager",
  },
  {
    name: "Larry Adams",
    role: "Product Manager",
  },
  {
    name: "Dawn Shaikh",
    role: "UX Researcher",
  },
  {
    name: "Ken Moore",
    role: "UX Designer",
  },
  {
    name: "Chi Pham",
    role: "UX Designer",
  },
  {
    name: "Katrina Sostek",
    role: "Engineer",
  },
  {
    name: "Vansh Kumar",
    role: "Engineer",
  },
  {
    name: "Lorenzo Boyice",
    role: "Engineer",
  },
  {
    name: "Jennie Brown",
    role: "Engineer",
  },
  {
    name: "Krista Katzenmeyer",
    role: "Engineer",
  },
  {
    name: "Aaron Nelson",
    role: "Engineer",
  },
  {
    name: "Maya Spivak",
    role: "Engineer",
  },
  {
    name: "Brian Suk",
    role: "Engineer",
  },
  {
    name: "Elizabeth Fregoso",
    role: "Engineer",
  },
  {
    name: "Seth Van Grinsven",
    role: "Engineer",
  },
  {
    name: "Alexis Artis",
    role: "Marketing",
  },
  {
    name: "Tarah Moore",
    role: "Program Manager",
  },
  {
    name: "Akoua Smith",
    role: "Brand Designer",
  },
  {
    name: "Sohee Kim",
    role: "Brand Designer",
  },
  {
    name: "Emily Rothschild",
    role: "Content Strategist",
  },
]

function OurTeamTab() {
  return (
    <Grid container className={styles.Grid}>

      <Grid container className={styles.GridSectionHeaderText}>
        <Grid item xs={7}>
          <Typography className={styles.HeaderText}>
            We're working towards a better tomorrow.
          </Typography>
          <Typography className={styles.HeaderSubtext}>
            We strongly support breaking down systemic barriers in order to achieve
            a more healthy, equitable, and inclusive society.
          </Typography>

        </Grid>
      </Grid>

      <Grid container className={styles.GridSection}>
        <Grid item xs={12}>
          <Typography
              variant="h6"
              align="left"
              style={{ fontSize: "28px", textAlign: "left", fontFamily: "Taviraj" }}
              className={styles.UnderlinedHeader}
          >
            Leadership Team
          </Typography>
        </Grid>
        <Grid item>
          <Grid container className={styles.GridSubSection}>
            {LEADERSHIP_TEAM.map((leader) => {
              return (
                  <Grid item xs={3} className={styles.TextProfile}>
                    <img src={leader.imageUrl} alt={leader.name} />
                    <br/>
                    <span style={{ fontSize: "16px", fontWeight: 500 }}>
                      { leader.name }
                    </span>
                    <br/>
                    <span style={{ fontSize: "14px", fontWeight: 400 }}>
                      { leader.role }
                    </span>
                  </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>

      <Grid container className={styles.GridSection}>
        <Grid item xs={12}>
          <Typography
                variant="h6"
                align="left"
                style={{ fontSize: "28px", textAlign: "left", fontFamily: "Taviraj" }}
                className={styles.UnderlinedHeader}
            >
              Google.org Fellows
          </Typography>
        </Grid>
        <Grid item>
          <Grid container className={styles.GridSubSection}>
            {GOOGLE_FELLOWS.map((fellow) => {
              return (
                  <Grid item xs={3} className={styles.TextProfile}>
                    <span style={{ fontSize: "16px", fontWeight: 500 }}>
                      { fellow.name }
                    </span>
                    <br/>
                    <span style={{ fontSize: "14px", fontWeight: 400 }}>
                      { fellow.role }
                    </span>
                  </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>

      <Grid container className={styles.GridSection}>
        <Grid item xs={12}>
          <Typography
              variant="h6"
              align="left"
              style={{ fontSize: "28px", textAlign: "left", fontFamily: "Taviraj" }}
              className={styles.UnderlinedHeader}
          >
            Health Equity Task Force
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Grid container className={styles.GridSubSection}>
            {Array.from(Array(20)).map((i) => (
                <Grid item xs={3} className={styles.TextProfile}>
                  <span style={{ fontSize: "16px", fontWeight: 500 }}>
                    Person {i}
                  </span>
                  <br/>
                  <span style={{ fontSize: "14px", fontWeight: 400 }}>
                      Name of role
                  </span>
                </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <Grid container className={styles.GridSection}>
        <Grid item xs={12}>
          <Typography
              variant="h6"
              align="left"
              style={{ fontSize: "28px", textAlign: "left", fontFamily: "Taviraj" }}
              className={styles.UnderlinedHeader}
          >
            Partners
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Grid container className={styles.GridSubSection}>
            {PARTNERS.map((partner) => (
                <Grid item xs={3} className={styles.TextProfile}>
                  <img src={partner.imageUrl} alt={partner.alt} />
                </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

    </Grid>
  );
}
export default OurTeamTab;
