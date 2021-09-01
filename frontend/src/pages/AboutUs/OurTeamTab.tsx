import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import styles from "./AboutUsPage.module.scss";
import { Helmet } from "react-helmet";
import LazyLoad from "react-lazyload";

const LEADERSHIP_TEAM = [
  {
    name: "Daniel Dawes, JD",
    role: "Co-Principal Investigator",
    imageUrl: "img/team/Daniel-E 1.png",
  },
  {
    name: "Nelson Dunlap, JD",
    role: "Co-Principal Investigator",
    imageUrl: "img/team/DunlapNelson.png",
  },
  {
    name: "Ebony Respress, MPH",
    role: "Project Director",
    imageUrl: "img/team/RespressEbony.png",
  },
  {
    name: "Allyson Belton, MPH",
    role: "Coalition/Engagement",
    imageUrl: "img/team/Belton_Allyson.png",
  },
  {
    name: "Mahia Valle, MBA",
    role: "Communications",
    imageUrl: "img/team/ValleMahia.png",
  },
  {
    name: "Shaneeta M. Johnson MD, MBA, FACS, FASMBS, ABOM",
    role: "Senior Advisor",
    imageUrl: "img/team/ShaneetaJohnson.png",
  },
  {
    name: "JC Gonzalez, MBA, PMP",
    role: "Product Manager",
    imageUrl: "img/team/GonzalezJC.png",
  },
  {
    name: "Josh Zarrabi",
    role: "Senior Software Engineer",
    imageUrl: "img/team/ZarrabiJosh.png",
  },
  {
    name: "Ben Hammond",
    role: "Software Engineer",
    imageUrl: "img/team/HammondBen.jpg",
  },
  {
    name: "Maisha Standifer, PhD, MPH",
    role: "Health Policy Analyst",
    imageUrl: "img/team/maisha-standifer.jpg",
  },
  {
    name: "Jammie Hopkins, DrPH, MS",
    role: "Coalition/Engagement",
    imageUrl: "img/team/jammie-hopkins.jpg",
  },
  {
    name: "Megan Douglas, JD",
    role: "Health Policy Analyst",
    imageUrl: "img/team/DouglasMegan.png",
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
    link: "http://kenstatus.com",
    text: "In memoriam,",
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
  "Douglas M. Brooks",
  "Duanne Pearson",
  "David Introcaso, PhD",
  "Zinzi Bailey, ScD, MSPH",
  "Abigail Echo-Hawk, MA",
  "Luis Belén",
  "Joia Crear-Perry, MD, FACOG",
  "Jenné Johns, MPH",
  "Erica Taylor, PhD, MPH, MA",
  "Brian Smedley, PhD",
  "Leandris Liburd, PhD, MPH",
  "Rita Carreón",
  "Dr. Raynald Samoa, MD",
  "Janisse Rosario Schoepp, MPH, PhD",
  "Elena Ong, PHN, MS",
  "J. Nadine Gracia, MD, MSCE",
  "Todd Moore, MPS",
  "Francys Crevier, JD",
  "Elena Rios, MD, MSPH, FACP",
  "Coleen A. Boyle, PhD, MS hyg",
  "Pierluigi Mancini, PhD",
  "Judy Monroe, MD",
  "Kathy Ko Chin, MS",
  "Marcos Pesquera, RPh, MPH",
  "Tawara D. Goode, MA",
  "Brian C. Castrucci, DrPH, MA",
  "The Honorable Donna M. Christensen, MD",
  "Dawn M. Hunter, JD, MPH",
  "Eduardo J. Gomez, PhD, MA",
  "Marjorie A. Innocent, PhD",
  "Geoffrey M. Roche, MPA",
  "Lori Tremmel Freeman, MBA",
  "Roberta Carlin, MS, JD",
  "Scott Bryant Comstock, MS",
  "Ruqaiijah A. Yearby, JD, MPH",
  "Magda G Peck, ScD",
  "Aletha Maybank, MD, MPH",
  "RADM Michael Toedt, MD, FAAFP",
  "Andrea Collier",
  "Kimberlydawn Wisdom, MD, MS",
  "Philip Alberti PhD",
  "Robin W. Coleman",
  "Corinne M. Graffunder, DrPH",
  "T'Pring Westbrook, PhD",
  "Fernando De Maio, PhD",
  "Mary Ann Cooney, MPH, MSN",
  "Ngozi Afulezi, MHA",
  "Alyssa Cobb",
  "Lauren Smith, MD, MPH",
  "Helene Clayton-Jeter, OD",
  "Richard Calvin Chang, JD",
  "Dr. Joseph Sakran, MD, MPA, MPH",
  "Darrell LaRoche",
  "Shavon Arline-Bradley, MPH, MDiv",
  "Melicia Whitt-Glover, PhD, FACSM",
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
    alt: "Google.org",
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
      <Helmet>
        <title>Our Team - About Us - Health Equity Tracker</title>
      </Helmet>
      <h1 className={styles.ScreenreaderTitleHeader}>Our Team</h1>
      <Grid container className={styles.Grid}>
        <Grid container className={styles.GridRowHeaderText}>
          <Grid item xs={12} sm={8} md={6} lg={10} xl={8}>
            <Typography
              id="main"
              tabIndex={-1}
              className={styles.OurTeamHeaderText}
              align="left"
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
                  <Grid
                    key={leader.name}
                    item
                    xs={12}
                    sm={6}
                    md={3}
                    className={styles.TextProfile}
                  >
                    <LazyLoad offset={300} height={181} once>
                      <img
                        src={leader.imageUrl}
                        alt={leader.name}
                        className={styles.ProfileImg}
                      />
                    </LazyLoad>
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
            <Grid
              container
              justify="space-around"
              className={styles.GridSubRow}
            >
              {GOOGLE_FELLOWS.map((fellow) => {
                return fellow.link == null ? (
                  <Grid item className={styles.TextProfile} key={fellow.name}>
                    <span style={{ fontSize: "16px", fontWeight: 500 }}>
                      {fellow.name}
                    </span>
                    <br aria-hidden="true" />
                    <span style={{ fontSize: "14px", fontWeight: 400 }}>
                      {fellow.role}
                    </span>
                  </Grid>
                ) : (
                  <Grid item className={styles.TextProfile} key={fellow.name}>
                    <a
                      href={fellow.link}
                      style={{ fontSize: "16px", fontWeight: 500 }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {fellow.text}
                      <br aria-hidden="true" />
                      {fellow.name}
                    </a>
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
            <Grid
              container
              justify="space-around"
              className={styles.GridSubRow}
            >
              {HE_TASKFORCE.map((taskforceName) => (
                <Grid item className={styles.TextProfile} key={taskforceName}>
                  <span style={{ fontSize: "16px", fontWeight: 500 }}>
                    {taskforceName}
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
          <LazyLoad offset={300} height={200} once>
            <Grid item container xs={12} className={styles.GridSubRow}>
              {PARTNERS.map((partner) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  xl={2}
                  container
                  justify="space-around"
                  key={partner.url}
                >
                  <a href={partner.url}>
                    <img
                      src={partner.imageUrl}
                      alt={partner.alt}
                      className={styles.PartnerImg}
                    />
                  </a>
                </Grid>
              ))}
            </Grid>
          </LazyLoad>
        </Grid>
      </Grid>
    </>
  );
}
export default OurTeamTab;
