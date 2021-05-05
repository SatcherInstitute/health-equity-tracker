import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import styles from "./AboutUsPage.module.scss";

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
  {
    name: "Allyson Belton, MPH",
    role: "Coalition/Engagement",
    imageUrl: "img/BeltonAllyson.png",
  },
  {
    name: "Mahia Valle, BSBA",
    role: "Communications",
    imageUrl: "img/ValleMahia.png",
  },
  {
    name: "Megan Douglas, JD",
    role: "Health Policy Analyst",
    imageUrl: "img/DouglasMegan.png",
  },
  {
    name: "Fengxia Yan, MD, MS",
    role: "Biostatician",
    imageUrl: "img/YanFengxia.png",
  },
  {
    name: "Peter Baltrus, PhD",
    role: "Data Analyst",
    imageUrl: "img/BaltrusPeter.png",
  },
];

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
];

const HE_TASKFORCE = [
  "Ngozi Afulezi",
  "Dr. Philip Alberti",
  "Dr. Zinzi Bailey",
  "Mr. Luis Belen",
  "Dr. Coleen Boyle",
  "Roberta Carlin",
  "Rita Carreón",
  "Brian Castrucci",
  "Richard Calvin Chang",
  "Kathy Ko Chin, M.S.",
  "Congresswoman Donna M. Christensen, MD",
  "Dr. Helene Clayton-Jeter",
  "Alyssa Cobb",
  "Robin W. Coleman",
  "Andrea Collier",
  "Scott Bryant Comstock, M.S.",
  "Mary Ann Cooney",
  "Francys Crevier, JD",
  "Joia Crear-Perry, MD",
  "Fernando DeMaio",
  "Abigail Echo-Hawk",
  "Lori Tremmel Freeman",
  "Eduardo J. Gomez, Ph.D, M.A.",
  "Tawara D. Goode, MA",
  "J. Nadine Gracia",
  "Corinne Graffunder",
  "Dawn Hunter",
  "Dr. Marjorie Innocent",
  "David Introcaso, PhD",
  "Jenné Johns, MPH",
  "Leandris Liburd",
  "Dr. Pierluigi Mancini",
  "Aletha Maybank, MD, MPH",
  "Dr. Judith Monroe",
  "Mr. Todd Moore",
  "Elena Ong, PHN, MS",
  "Mr. Duanne Pearson",
  "Dr. Magda Peck",
  "Marcos Pesquera, R.Ph., MPH",
  "Elena Rios, MD, MSPH, FACP",
  "Geoffrey M. Roche, MPA",
  "Dr. Raynald Samoa",
  "Janisse Rosario Schoepp, M.P.H., Ph.D.",
  "Brian Smedley, PhD",
  "Lauren Smith",
  "Dr. Erica Taylor",
  "Dr. Michael Toedt",
  "T'Pring Westbrook, PhD",
  "Dr. Kimberlydawn Wisdom",
  "Ruqaiijah A. Yearby, J.D., M.P.H.",
];

const PARTNERS = [
  {
    imageUrl: "img/PartnerSatcher.png",
    alt: "Morehouse School of Medicine Satcher Health Leadership Institute",
  },
  {
    imageUrl: "img/PartnerGilead.png",
    alt: "Gilead Sciences, Inc.",
  },
  {
    imageUrl: "img/PartnerCdc.png",
    alt: "United States Center for Disease Control and Prevention",
  },
  {
    imageUrl: "img/PartnerGoogle.png",
    alt: "Google",
  },
];

function OurTeamTab() {
  return (
    <>
      <title>Our Team - About Us - Health Equity Tracker</title>
      <h1 className={styles.ScreenreaderTitleHeader}>Our Team</h1>
      <Grid container className={styles.Grid}>
        <Grid container className={styles.GridRowHeaderText}>
          <Grid item xs={12} sm={12} md={7}>
            <Typography
              id="main"
              tabIndex={-1}
              className={styles.OurTeamHeaderText}
              variant="h2"
            >
              We're working towards a better tomorrow.
            </Typography>
            <Typography className={styles.HeaderSubtext} variant="subtitle1">
              We strongly support breaking down systemic barriers in order to
              achieve a more healthy, equitable, and inclusive society.
            </Typography>
          </Grid>
        </Grid>

        <Grid container className={styles.GridRow}>
          <Grid item xs={12}>
            <Typography variant="h3" align="left" className={styles.TeamHeader}>
              Leadership Team
            </Typography>
          </Grid>
          <Grid item>
            <Grid
              container
              justify="space-around"
              className={styles.GridSubRow}
            >
              {LEADERSHIP_TEAM.map((leader) => {
                return (
                  <Grid item className={styles.TextProfile}>
                    <img
                      src={leader.imageUrl}
                      alt={leader.name}
                      className={styles.ProfileImg}
                    />
                    <br />
                    <h4 className={styles.LeaderNameHeading}>{leader.name}</h4>
                    <span className={styles.LeaderRoleSpan}>{leader.role}</span>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={styles.GridRow}>
          <Grid item xs={12}>
            <Typography variant="h3" align="left" className={styles.TeamHeader}>
              Google.org Fellows
            </Typography>
          </Grid>
          <Grid item>
            <Grid container className={styles.GridSubRow}>
              {GOOGLE_FELLOWS.map((fellow) => {
                return (
                  <Grid item className={styles.TextProfile}>
                    <span style={{ fontSize: "16px", fontWeight: 500 }}>
                      {fellow.name}
                    </span>
                    <br />
                    <span style={{ fontSize: "14px", fontWeight: 400 }}>
                      {fellow.role}
                    </span>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={styles.GridRow}>
          <Grid item xs={12}>
            <Typography variant="h3" align="left" className={styles.TeamHeader}>
              Health Equity Task Force
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Grid container className={styles.GridSubRow}>
              {HE_TASKFORCE.map((name) => (
                <Grid item className={styles.TextProfile}>
                  <span style={{ fontSize: "16px", fontWeight: 500 }}>
                    {name}
                  </span>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={styles.GridRow}>
          <Grid item xs={12}>
            <Typography variant="h3" align="left" className={styles.TeamHeader}>
              Partners
            </Typography>
          </Grid>

          <Grid item xs={12}>
            {PARTNERS.map((partner) => (
              <img
                src={partner.imageUrl}
                alt={partner.alt}
                className={styles.PartnerImg}
              />
            ))}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
export default OurTeamTab;
