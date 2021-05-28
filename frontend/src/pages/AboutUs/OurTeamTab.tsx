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
    name: "Mahia Valle, MBA",
    role: "Communications",
    imageUrl: "img/ValleMahia.png",
  },
  {
    name: "Megan Douglas, JD",
    role: "Health Policy Analyst",
    imageUrl: "img/DouglasMegan.png",
  },
  {
    name: "JC Gonzalez, MBA, PMP",
    role: "Product Manager",
    imageUrl: "img/GonzalezJC.png",
  },
  {
    name: "Josh Zarrabi",
    role: "Software Engineer",
    imageUrl: "img/ZarrabiJosh.png",
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
  "Abigail Echo-Hawk, MA",
  "Aletha Maybank, MD, MPH",
  "Alyssa Cobb",
  "Andrea Collier",
  "B. Todd Moore, M.D.",
  "Brian C. Castrucci, DrPH, MA",
  "Brian Smedley, PhD",
  "Coleen A. Boyle, PhD, MS hyg",
  "Corinne M. Graffunder, DrPH",
  "Darrell LaRoche",
  "David Introcaso, PhD",
  "Dawn M. Hunter, JD, MPH",
  "Douglas M. Brooks",
  "Dr. Joseph Sakran, MD, MPA, MPH",
  "Dr. Raynald Samoa, MD",
  "Duanne Pearson",
  "Eduardo J. Gomez, PhD, MA",
  "Elena Ong, PHN, MS",
  "Elena Rios, MD, MSPH, FACP",
  "Erica Taylor, PhD, MPH, MA",
  "Fernando De Maio, PhD",
  "Francys Crevier, JD",
  "Geoffrey M. Roche, MPA",
  "Helene Clayton-Jeter, OD",
  "J. Nadine Gracia, MD, MSCE",
  "Janisse Rosario Schoepp, M.P.H., Ph.D.",
  "Jenné Johns, MPH",
  "Joia Crear-Perry, MD, FACOG",
  "Judy Monroe, MD",
  "Kathy Ko Chin, M.S.",
  "Kimberlydawn Wisdom, MD, MS",
  "Lauren Smith, MD, MPH",
  "Leandris Liburd, PhD, MPH",
  "Lori Tremmel Freeman, MBA",
  "Luis Belén",
  "Magda G Peck ScD",
  "Marcos Pesquera, R.Ph., MPH",
  "Marjorie A. Innocent, PhD",
  "Mary Ann Cooney, MPH, MSN",
  "Melicia Witt-Glover",
  "Ngozi Afulezi, MHA",
  "Philip Alberti PhD",
  "Pierluigi Mancini, PhD",
  "RADM Michael Toedt, M.D., F.A.A.F.P.",
  "Richard Calvin Chang, JD",
  "Rita Carreón",
  "Roberta Carlin, MS, JD",
  "Robin W. Coleman",
  "Ruqaiijah A. Yearby, JD, MPH",
  "Scott Bryant Comstock, M.S.",
  "Shavon Arline-Bradley",
  "T'Pring Westbrook, PhD",
  "Tawara D. Goode, MA",
  "The Honorable Donna M. Christensen, MD",
  "Zinzi Bailey, Scd, MSPH",
];

const PARTNERS = [
  {
    imageUrl: "img/PartnerSatcher.png",
    alt: "Morehouse School of Medicine Satcher Health Leadership Institute",
    url: "https://satcherinstitute.org/",
  },
  {
    imageUrl: "img/PartnerGilead.png",
    alt: "Gilead Sciences, Inc.",
    url: "https://www.gilead.com/",
  },
  {
    imageUrl: "img/PartnerCdc.png",
    alt: "United States Center for Disease Control and Prevention",
    url: "https://www.cdc.gov/",
  },
  {
    imageUrl: "img/PartnerGoogle.png",
    alt: "Google",
    url: "https://google.org",
  },
  {
    imageUrl: "img/PartnerAARP.png",
    alt: "American Association of Retired Persons",
    url: "https://aarp.org",
  },
  {
    imageUrl: "img/PartnerAECF.png",
    alt: "Annie E. Casey Foundation",
    url: "https://www.aecf.org/",
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
              <a href={partner.url}>
                <img
                  src={partner.imageUrl}
                  alt={partner.alt}
                  className={styles.PartnerImg}
                />
              </a>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
export default OurTeamTab;
