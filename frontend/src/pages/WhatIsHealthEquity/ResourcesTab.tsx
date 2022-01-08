import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./WhatIsHealthEquityPage.module.scss";
import { Typography } from "@material-ui/core";
import { Helmet } from "react-helmet-async";

export interface Resource {
  name: string;
  url: string;
}

export const RESOURCES: Resource[] = [
  {
    name: "Health Equity Guide",
    url: "https://healthequityguide.org/",
  },
  {
    name: "Health Equity - APHA",
    url: "https://www.apha.org/topics-and-issues/health-equity",
  },
  {
    name: "Minority Health",
    url: "https://www.cdc.gov/minorityhealth/",
  },
  {
    name: "Teaching the Difference Between Equality, Equity, and Justice",
    url:
      "https://www.paperpinecone.com/blog/teaching-difference-between-equality-equity-and-justice-preschool",
  },
  {
    name: "Equity vs. Equality: What's the Difference?",
    url: "https://onlinepublichealth.gwu.edu/resources/equity-vs-equality/",
  },
  {
    name: "Social determinants of health -WHO",
    url:
      "https://www.who.int/health-topics/social-determinants-of-health#tab=tab_1",
  },
  {
    name: "Equity- WHO",
    url: "https://www.who.int/healthsystems/topics/equity/en/",
  },
  {
    name: "Intro to Health Equity and Social Determinants of Health",
    url:
      "https://www.ncbi.nlm.nih.gov/books/NBK540766/#:~:text=Health%20equity%2C%20as%20defined%20by,of%20health%20for%20all%20people.",
  },
  {
    name: "Health Disparities and Health Equity: The Issue Is Justice",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3222512/",
  },
  {
    name: "Health Equity CDC",
    url: "https://www.cdc.gov/chronicdisease/healthequity/index.htm",
  },
  {
    name: "Health Equity Resources",
    url: "https://www.policylink.org/health-equity-resources",
  },
  {
    name: "Health Equity: Why It Matters, and How To Take Action - RWJF",
    url:
      "https://www.rwjf.org/en/library/features/achieving-health-equity.html",
  },
  {
    name: "Health Equity and Prevention Primer",
    url:
      "https://www.preventioninstitute.org/tools/tools-general/health-equity-toolkit#:~:text=The%20Health%20Equity%20and%20Prevention%20Primer%20(HEPP)%20is%20a%20web,%2C%20and%20multi%2Dsector%20engagement.",
  },
  {
    name:
      "AAMC: Advancing Health Equity: A Guide to Language, Narrative and Concepts",
    url: "https://www.aamchealthjustice.org/narrative-guide",
  },
  {
    name: "APIAHF: Health Equity",
    url: "https://www.apiahf.org/",
  },
  {
    name: "UCLA HEALTH: COVID-19 exposes how Native Hawaiians and Pacific...",
    url:
      "https://www.uclahealth.org/covid19-exposes-how-native-hawaiians-and-pacific-islanders-face-stark-health-care-disparities",
  },
  {
    name: "Health Equity Matters for Asian Americans, Native Hawaiians...",
    url: "https://jamanetwork.com/channels/health-forum/fullarticle/2760153",
  },
  {
    name: "American Indian Health Equity/Disparities",
    url: "https://in.nau.edu/cair/ai-health-equity-and-disparities/",
  },
  {
    name: "Indigenous Health Equity- UIHI",
    url: "https://www.uihi.org/resources/indigenous-health-equity/",
  },
  {
    name: "Racialization as a Barrier to Achieving Health Equity for Native...",
    url:
      "https://journalofethics.ama-assn.org/article/racialization-barrier-achieving-health-equity-native-americans/2020-10",
  },
  {
    name: "The Impact of Historical Trauma on American Indian Health Equity",
    url:
      "https://www.medicalnewstoday.com/articles/the-impact-of-historical-trauma-on-american-indian-health-equity",
  },
  {
    name: "National COVID-19 Resiliency Network (NCRN)",
    url: "https://ncrn.msm.edu",
  },
  {
    name: "COVID-19 and Equity*- APHA",
    url:
      "https://www.apha.org/topics-and-issues/communicable-disease/coronavirus/equity",
  },
  {
    name: "COVID-19 and Health Equity: A Policy Platform and Voices",
    url:
      "https://www.apha.org/events-and-meetings/apha-calendar/webinar-events/2020/covid-19-and-health-equity",
  },
  {
    name: "Investing in Latino Leadership for Health Equity and Justice...",
    url:
      "https://www.gih.org/publication/investing-in-latino-leadership-for-health-equity-and-justice/",
  },
  {
    name: "Tackling Health disparities among latinos in the US",
    url:
      "https://nimhd.blogs.govdelivery.com/2018/10/11/tackling-health-disparities-among-latinos-in-the-united-states/",
  },
  {
    name: "Hispanic/Latino- Minority Health",
    url: "https://minorityhealth.hhs.gov/omh/browse.aspx?lvl=3&lvlid=64",
  },
  {
    name: "PDOH - JHU PRESS",
    url: "https://www.press.jhu.edu/news/blog/political-determinants-health",
  },
  {
    name: "The Economic Case for Health Equity - ASTHO",
    url:
      "https://www.astho.org/Programs/Health-Equity/Economic-Case-Issue-Brief/",
  },
  {
    name:
      "Estimating the economic burden of racial health inequalities in the United States",
    url: "https://pubmed.ncbi.nlm.nih.gov/21563622/",
  },
  {
    name: "Roots of Health Inequity free, web-based course",
    url: "http://www.rootsofhealthinequity.org/",
  },
  {
    name:
      "Health equity and social justice 101 series: Part I The Politics of Health Inequity",
    url: "https://www.youtube.com/watch?v=2k5XPbEB4H0",
  },
  {
    name: "NACCHO Health Equity and Social Justice Resources and Trainings",
    url:
      "https://www.naccho.org/programs/public-health-infrastructure/health-equity",
  },
  {
    name:
      "How to use data to inform community health assessment and planning: NACCHO's Mobilizing for Action through Planning and Partnerships (MAPP) framework",
    url:
      "https://www.naccho.org/programs/public-health-infrastructure/performance-improvement/community-health-assessment/mapp",
  },
  {
    name: "UIHI Best Practices",
    url:
      "https://www.uihi.org/resources/best-practices-for-american-indian-and-alaska-native-data-collection/",
  },
  {
    name: "Racial Equity Index",
    url: "https://nationalequityatlas.org/research/racial_equity_index/index#/",
  },
  {
    name: "Mapping Inequality",
    url: "https://dsl.richmond.edu/panorama/redlining/#loc=5/39.1/-94.58",
  },
  {
    name: "Social Vulnerability Index",
    url: "https://www.atsdr.cdc.gov/placeandhealth/svi/index.html",
  },
  {
    name: "Neighborhood Atlas - Area Deprivation Index",
    url: "https://www.neighborhoodatlas.medicine.wisc.edu/#about-anchor",
  },
  {
    name: "CDC MMWR",
    url: "https://www.cdc.gov/mmwr/volumes/70/wr/mm7005e1.htm",
  },
  {
    name: "Kaiser Family Foundation: COVID-19 Disparities",
    url: "https://www.kff.org/state-category/covid-19/covid-19-disparities/",
  },
  {
    name: "Bloomberg: COVID-19 Global Vaccine Tracker",
    url:
      "https://www.bloomberg.com/graphics/covid-vaccine-tracker-global-distribution/us-vaccine-demographics.html",
  },
  {
    name: "APM Research: COVID-19 Vaccine Progress",
    url: "https://www.apmresearchlab.org/covid/vaccine-progress",
  },
  {
    name: "APM Research: COVID-19 Vaccines by Race",
    url: "https://www.apmresearchlab.org/covid/vaccines-by-race",
  },
  {
    name: "New York Times: Real-Time, Interactive COVID-19 Tracker",
    url:
      "https://www.nytimes.com/interactive/2020/us/coronavirus-us-cases.html",
  },
  {
    name: "California COVID-19 Health Equity Site",
    url: "https://covid19.ca.gov/equity/",
  },
  {
    name: "APM Research: Death & Vaccination Statistics",
    url: "https://www.apmresearchlab.org/",
  },
  {
    name:
      "Building Trust and Access to the COVID-19 Vaccine in Communities of Color and Tribal Nations",
    url:
      "https://www.tfah.org/report-details/trust-and-access-to-covid-19-vaccine-within-communities-of-color/",
  },
  {
    name:
      "Advancing Health Equity: What we learned from Community-based Health Equity Initiatives",
    url: "https://www.tfah.org/initiatives/health-equity/",
  },
  {
    name: "TFAH Health Equity Webinar Series",
    url:
      "https://www.tfah.org/article/tfah-webinar-series-on-achieving-health-equity-through-collaborations-innovative-funding-and-leadership/",
  },
  {
    name:
      "CDC - Johnson & Johnson’s Janssen COVID-19 Vaccine Overview and Safety",
    url:
      "https://www.cdc.gov/coronavirus/2019-ncov/vaccines/different-vaccines/janssen.html",
  },
  {
    name: "CDC - Pfizer-BioNTech COVID-19 Vaccine Overview and Safety",
    url:
      "https://www.cdc.gov/coronavirus/2019-ncov/vaccines/different-vaccines/Pfizer-BioNTech.html",
  },
  {
    name: "CDC - Moderna COVID-19 Vaccine Overview and Safety",
    url:
      "https://www.cdc.gov/coronavirus/2019-ncov/vaccines/different-vaccines/Moderna.html",
  },
  {
    name: "Medical Justice In Advocacy Fellowship",
    url:
      "https://www.ama-assn.org/delivering-care/health-equity/medical-justice-advocacy-fellowship",
  },
  {
    name: "THE ECONOMIC BURDEN OF HEALTH INEQUALITIES IN THE UNITED STATES",
    url:
      "https://hsrc.himmelfarb.gwu.edu/cgi/viewcontent.cgi?article=1224&context=sphhs_policy_facpubs",
  },
  {
    name: "Satcher Health Leadership Institute",
    url: "https://satcherinstitute.org/",
  },
];

function ResourcesTab() {
  return (
    <>
      <Helmet>
        <title>
          Health Equity Resources - What Is Health Equity? - Health Equity
          Tracker
        </title>
      </Helmet>
      <h1 className={styles.ScreenreaderTitleHeader}>
        Health Equity Resources
      </h1>
      <Grid container className={styles.Grid}>
        <Grid container className={styles.ResourcesTabSection}>
          <Grid item xs={12} sm={12} md={3}>
            <Typography
              id="main"
              tabIndex={-1}
              className={styles.ResourcesTabHeaderText}
              variant="h2"
            >
              Resources
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={9}>
            <Grid container>
              <Grid item>
                <ul className={styles.ResourcesTabList}>
                  {RESOURCES.map((resource) => (
                    <li
                      className={styles.ResourcesTabListItem}
                      key={resource.name}
                    >
                      <a href={resource.url}>{resource.name}</a>
                    </li>
                  ))}
                </ul>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default ResourcesTab;
