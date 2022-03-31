import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import styles from "./AboutUsPage.module.scss";
import { Helmet } from "react-helmet-async";
import LazyLoad from "react-lazyload";
import { urlMap } from "../../utils/externalUrls";

const LEADERSHIP_TEAM = [
  {
    name: "Daniel Dawes, JD",
    role: "Principal Investigator",
    imageUrl: "/img/team/Daniel-E 1.png",
  },
  {
    name: "Nelson Dunlap, JD",
    role: "Co-Principal Investigator",
    imageUrl: "/img/team/DunlapNelson.png",
  },
  {
    name: "Ebony Respress, MPH",
    role: "Project Director",
    imageUrl: "/img/team/RespressEbony.png",
  },
  {
    name: "Allyson Belton, MPH",
    role: "Coalition/Engagement",
    imageUrl: "/img/team/Belton_Allyson.png",
  },
  {
    name: "Mahia Valle, MBA",
    role: "Communications",
    imageUrl: "/img/team/ValleMahia.png",
  },
  {
    name: "Shaneeta M. Johnson MD, MBA, FACS, FASMBS, ABOM",
    role: "Senior Advisor",
    imageUrl: "/img/team/ShaneetaJohnson.png",
  },
  {
    name: "JC Gonzalez, MBA, PMP",
    role: "Product Manager",
    imageUrl: "/img/team/GonzalezJC.png",
  },
  {
    name: "Josh Zarrabi",
    role: "Senior Software Engineer",
    imageUrl: "/img/team/ZarrabiJosh.png",
  },
  {
    name: "Ben Hammond",
    role: "Software Engineer",
    imageUrl: "/img/team/HammondBen.jpg",
  },
  {
    name: "Maisha Standifer, PhD, MPH",
    role: "Health Policy Analyst",
    imageUrl: "/img/team/maisha-standifer.jpg",
  },
  {
    name: "Jammie Hopkins, DrPH, MS",
    role: "Coalition/Engagement",
    imageUrl: "/img/team/jammie-hopkins.jpg",
  },
  {
    name: "Megan Douglas, JD",
    role: "Health Policy Analyst",
    imageUrl: "/img/team/DouglasMegan.png",
  },
];

export const GOOGLE_FELLOWS = [
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
    link: "https://kenstatus.com",
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

export const PARTNERS = [
  {
    imageUrl: "/img/partners/PartnerSatcher.png",
    alt: "Morehouse School of Medicine Satcher Health Leadership Institute",
    url: urlMap.shli,
  },
  {
    imageUrl: "/img/partners/PartnerGilead.png",
    alt: "Gilead Sciences, Inc.",
    url: "https://www.gilead.com/",
  },
  {
    imageUrl: "/img/partners/PartnerCdc.png",
    alt: "United States Center for Disease Control and Prevention",
    url: "https://www.cdc.gov/",
  },
  {
    imageUrl: "/img/partners/PartnerGoogle.png",
    alt: "Google.org",
    url: "https://google.org",
  },
  {
    imageUrl: "/img/partners/PartnerAARP.png",
    alt: "American Association of Retired Persons",
    url: "https://www.aarp.org",
  },
  {
    imageUrl: "/img/partners/PartnerAECF.png",
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
      <h2 className={styles.ScreenreaderTitleHeader}>Our Team</h2>
      <Grid container className={styles.Grid}>
        <Grid container className={styles.GridRowHeaderText}>
          <Grid item xs={12} sm={8} md={6} lg={10} xl={8}>
            <Typography
              id="main"
              className={styles.OurTeamHeaderText}
              align="left"
              variant="h2"
              component="h3"
            >
              We're working towards a better tomorrow.
            </Typography>
            <Typography
              className={styles.HeaderSubtext}
              variant="subtitle1"
              component="p"
            >
              We strongly support breaking down systemic barriers in order to
              achieve a more healthy, equitable, and inclusive society.
            </Typography>
          </Grid>
        </Grid>

        <Grid container className={styles.GridRow} component={"section"}>
          <Grid item xs={12}>
            <Typography variant="h3" align="left" className={styles.TeamHeader}>
              Leadership Team
            </Typography>
          </Grid>
          <Grid item>
            <Grid
              container
              justifyContent="space-around"
              className={styles.GridSubRow}
              component="ul"
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
                    component="li"
                  >
                    <LazyLoad offset={300} once>
                      <img
                        src={leader.imageUrl}
                        alt=""
                        className={styles.ProfileImg}
                      />
                    </LazyLoad>

                    <div className={styles.MemberName}>{leader.name}</div>
                    <div className={styles.MemberRole}>{leader.role}</div>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={styles.GridRow} component={"section"}>
          <Grid item xs={12}>
            <Typography variant="h3" align="left" className={styles.TeamHeader}>
              Google.org Fellows
            </Typography>
          </Grid>
          <Grid item>
            <Grid
              container
              justifyContent="space-around"
              className={styles.GridSubRow}
              component="ul"
            >
              {GOOGLE_FELLOWS.map((fellow) => {
                return (
                  <Grid
                    item
                    className={styles.TextProfile}
                    key={fellow.name}
                    component="li"
                  >
                    {fellow.link && (
                      <a
                        className={styles.MemberName}
                        href={fellow.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {fellow.text}
                      </a>
                    )}

                    <div className={styles.MemberName}>{fellow.name}</div>

                    <div className={styles.MemberRole}>{fellow.role}</div>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={styles.GridRow} component={"section"}>
          <Grid item xs={12}>
            <Typography variant="h3" align="left" className={styles.TeamHeader}>
              Health Equity Task Force
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Grid
              container
              justifyContent="space-around"
              className={styles.GridSubRow}
              component="ul"
            >
              {HE_TASKFORCE.map((taskforceName) => (
                <Grid
                  item
                  className={styles.TextProfile}
                  key={taskforceName}
                  component="li"
                >
                  <span className={styles.MemberName}>{taskforceName}</span>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={styles.GridRow} component={"section"}>
          <Grid item xs={12}>
            <Typography variant="h3" align="left" className={styles.TeamHeader}>
              Partners
            </Typography>
          </Grid>
          <LazyLoad offset={300} once>
            <Grid
              item
              container
              xs={12}
              className={styles.GridSubRow}
              component="ul"
            >
              {PARTNERS.map((partner) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  xl={2}
                  container
                  justifyContent="space-around"
                  key={partner.url}
                  component="li"
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
