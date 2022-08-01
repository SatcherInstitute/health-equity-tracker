import React from "react";
import Grid from "@material-ui/core/Grid";
// import styles from "./DataCatalogPage.module.scss";
import styles from "../WhatIsHealthEquity/WhatIsHealthEquityPage.module.scss";
import { LinkWithStickyParams } from "../../utils/urlutils";
import {
  CONTACT_TAB_LINK,
  EXPLORE_DATA_PAGE_WHAT_DATA_ARE_MISSING_LINK,
  HET_URL,
  DATA_TAB_LINK,
} from "../../utils/internalRoutes";
import { Helmet } from "react-helmet-async";
import { getHtml } from "../../utils/urlutils";
import { selectFaqs } from "../WhatIsHealthEquity/FaqTab";
import { METRIC_CONFIG } from "../../data/config/MetricConfig";
import { Link } from "react-router-dom";
import { Card, Typography } from "@material-ui/core";
import { urlMap } from "../../utils/externalUrls";
import DefinitionsList from "../../reports/ui/DefinitionsList";
import { currentYear } from "../../Footer";
import {
  ALASKA_PRIVATE_JAIL_CAVEAT,
  CombinedIncarcerationStateMessage,
} from "../../data/variables/IncarcerationProvider";
import FeedbackBox from "../ui/FeedbackBox";

export const CITATION_APA = `Health Equity Tracker. (${currentYear()}). Satcher Health Leadership Institute. Morehouse School of Medicine. ${HET_URL}.`;

function MethodologyTab() {
  return (
    <>
      <Helmet>
        <title>Methodology - Health Equity Tracker</title>
      </Helmet>
      <h2 className={styles.ScreenreaderTitleHeader}>Methodology</h2>
      <Grid container className={styles.Grid}>
        <Grid container className={styles.FaqSection}>
          <Grid item xs={12} sm={12} md={3}>
            <Typography
              id="main"
              tabIndex={-1}
              className={styles.FaqHeaderText}
              variant="h2"
            >
              Condition Variables
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={9}>
            <Grid container>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>Chronic Disease</h3>
                <ul>
                  <li>
                    <b>Diabetes:</b> Diabetes is a chronic disease that occurs
                    either when the pancreas does not produce enough insulin or
                    when the body cannot effectively use the insulin it
                    produces. Insulin is a hormone that regulates blood sugar.
                    Hyperglycemia, or raised blood sugar, is a common effect of
                    uncontrolled diabetes and over time leads to serious damage
                    to many of the body's systems, especially the nerves and
                    blood vessels.
                  </li>
                  <li>
                    <b>COPD:</b> Chronic obstructive pulmonary disease (COPD) is
                    a chronic inflammatory lung disease that causes obstructed
                    airflow from the lungs. Symptoms include breathing
                    difficulty, cough, mucus (sputum) production and wheezing.
                    It's typically caused by long-term exposure to irritating
                    gasses or particulate matter, most often from cigarette
                    smoke. People with COPD are at increased risk of developing
                    heart disease, lung cancer and a variety of other
                    conditions.
                  </li>
                  <li>
                    <b>Asthma:</b> Asthma is a condition in which your airways
                    narrow and swell and may produce extra mucus. This can make
                    breathing difficult and trigger coughing, a whistling sound
                    (wheezing) when you breathe out and shortness of breath. For
                    some people, asthma is a minor nuisance.
                  </li>
                  <li>
                    <b>Cases of Cardiovascular Diseases:</b> Cardiovascular
                    diseases (CVDs) are the leading cause of death globally,
                    taking an estimated 17.9 million lives each year. CVDs are a
                    group of disorders of the heart and blood vessels and
                    include coronary heart disease, cerebrovascular disease,
                    rheumatic heart disease and other conditions.
                  </li>
                  <li>
                    <b>Chronic Kidney Disease:</b> Chronic kidney disease (CKD)
                    means your kidneys are damaged and can't filter blood the
                    way they should. The main risk factors for developing kidney
                    disease are diabetes, high blood pressure, heart disease,
                    and a family history of kidney failure.
                  </li>
                  <li>
                    <b>Opioid use disorder (OUD):</b> OUD can involve misuse of
                    prescribed opioid medications, use of diverted opioid
                    medications, or use of illicitly obtained heroin. OUD is
                    typically a chronic, relapsing illness, associated with
                    significantly increased rates of morbidity and mortality.
                  </li>
                  <li>
                    <b>A mental disorder:</b> This is characterized by a
                    clinically significant disturbance in an individual’s
                    cognition, emotional regulation, or behavior. It is usually
                    associated with distress or impairment in important areas of
                    functioning. There are many different types of mental
                    disorders.
                  </li>
                </ul>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>Behavioral Health</h3>
                <div className={styles.FaqAnswer}>
                  <ul>
                    <li>
                      <b>Suicides:</b> Deaths due to intentional self-harm.
                    </li>
                    <li>
                      <b>Depression Cases:</b> Adults who reported being told by
                      a health professional that they have a depressive disorder
                      including depression, major depression, minor depression
                      or dysthymia.
                    </li>
                    <li>
                      <b>Excessive Drinking Cases:</b> Adults who reported binge
                      drinking (four or more [females] or five or more [males]
                      drinks on one occasion in the past 30 days) or heavy
                      drinking (eight or more [females] or 15 or more [males]
                      drinks per week).
                    </li>
                    <li>
                      <b>Non-medical Drug Use:</b> Adults who reported using
                      prescription drugs non-medically (including pain
                      relievers, stimulants, sedatives) or illicit drugs
                      (excluding cannabis) in the last 12 months. Note: This
                      data type includes both of the other opioid-related data
                      types: “Non-medical Use of Prescription Opioids” and “Use
                      of Illicit Opioids”.
                    </li>
                    <li>
                      <b>Non-medical Prescription Opioid Use:</b> Adults who
                      reported using illicit opioids. Note: This is a subset of
                      the “Non-medical Drug Use” data type.
                    </li>
                  </ul>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  Social Determinants of Health
                </h3>
                <div className={styles.FaqAnswer}>
                  <ul>
                    <li>
                      <b>Uninsured Individuals:</b> The American Community
                      Survey (ACS) and similar Census Bureau surveys define
                      health insurance coverage as plans and programs that
                      provide comprehensive health coverage.
                    </li>
                    <li>
                      <b>Individuals Below the Poverty Line:</b> Following the
                      Office of Management and Budget's (OMB) Statistical Policy
                      Directive 14, the Census Bureau uses a set of income
                      thresholds that vary by family size and composition to
                      determine poverty status. If a family's total income is
                      less than the family's threshold, then that family and
                      every individual in it is considered in poverty. The
                      official poverty thresholds do not vary geographically,
                      but they are updated for inflation using the Consumer
                      Price Index (CPI-U). The official poverty definition uses
                      income before taxes and does not include capital g
                    </li>
                    <li>
                      <b>Preventable Hospitalizations:</b> Preventable
                      hospitalizations are admissions to a hospital for certain
                      acute illnesses (e.g., dehydration) or worsening chronic
                      conditions (e.g., diabetes) that might not have required
                      hospitalization had these conditions been managed
                      successfully by primary care providers in outpatient
                      settings.
                    </li>
                    <li>
                      <b>Care Avoidance Due to Cost:</b> Adults who reported a
                      time in the past 12 months when they needed to see a
                      doctor but could not because of cost.
                    </li>
                  </ul>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  Political Determinants of Health
                </h3>
                <div className={styles.FaqAnswer}>
                  <ul>
                    <li>
                      <b>Voter Participation:</b> U.S. citizens ages 18 and
                      older who voted in either the last presidential election,
                      the last midterm national election, or the average of both
                      where that data is available.
                    </li>
                    <li>
                      <b>Women in US Congress:</b> Individuals identifying as
                      women who are currently serving in the Congress of the
                      United States, including members of the U.S. Senate and
                      members, territorial delegates, and resident commissioners
                      of the U.S. House of Representatives. Women who
                      self-identify as more than one race/ethnicity are included
                      in the rates for each group with which they identify.
                    </li>
                    <li>
                      <b>Women in State Legislatures:</b> Individuals
                      identifying as women currently serving in their state or
                      territory’s legislature. Women who self-identify as more
                      than one race/ethnicity are included in the rates for each
                      group with which they identify.
                    </li>
                    <li>
                      <b>Individuals in Prison:</b> Individuals of any age,
                      including children, under the jurisdiction of an adult
                      prison facility. ‘Age’ reports at the national level
                      include only the subset of this jurisdictional population
                      who have been sentenced to one year or more, which
                      accounted for 97% of the total U.S. prison population in
                      2020. For all national reports, this rate includes both
                      state and federal prisons. For state and territory level
                      reports, only the prisoners under the jurisdiction of that
                      geography are included. For county level reports, Vera
                      reports the number of people incarcerated under the
                      jurisdiction of a state prison system on charges arising
                      from a criminal case in that specific county, which are
                      not available in every state. The county of court
                      commitment is generally where a person was convicted; it
                      is not necessarily the person’s county of residence and
                      may not even be the county where the crime was committed,
                      but nevertheless is likely to be both. AK, CT, DE, HI, RI,
                      and VT each operate an integrated system that combines
                      prisons and jails; in accordance with the data sources, we
                      include those facilities as adult prisons but not as local
                      jails. Prisons are longer-term facilities run by the state
                      or the federal government that typically hold felons and
                      persons with sentences of more than one year. Definitions
                      may vary by state.
                    </li>
                    <li>
                      <b>Individuals in Jail:</b> Individuals of any age,
                      including children, confined in a local, adult jail
                      facility. AK, CT, DE, HI, RI, and VT each operate an
                      integrated system that combines prisons and jails; in
                      accordance with the data sources, we include those
                      facilities as adult prisons but not as local jails. Jails
                      are locally operated short-term facilities that hold
                      inmates awaiting trial or sentencing or both, and inmates
                      sentenced to a term of less than one year, typically
                      misdemeanants. Definitions may vary by state.
                    </li>
                    <li>
                      <b>Justice-Involved Persons:</b> Persons who have had
                      contact with the criminal justice system in 1 or more of
                      the following capacities: arrest, booking, charging,
                      sentencing, incarceration in jail or prison, probation, or
                      parole.
                    </li>
                    <li>
                      <b>Jail:</b> Jail includes all individuals currently
                      confined by a local, adult jail facility, but does not
                      include individuals who are supervised outside of jail or
                      who report only on weekends. In general, jail facilities
                      incarcerate individuals who are awaiting trial or
                      sentencing, or who are sentenced to less than 1 year.
                    </li>
                    <li>
                      <b>County Reports:</b> Vera data, which we use for our
                      county level reports, restricts both the measured jail
                      population and the relevant total population to
                      individuals aged 15-64.
                    </li>
                  </ul>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={styles.FaqSection}>
          <Grid item xs={12} sm={12} md={3}>
            <Typography className={styles.FaqHeaderText} variant="h2">
              Limitations of the tracker
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={9}>
            <Grid container>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>COVID-19</h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    For a description of some of the gaps in COVID-19 data,
                    please see the{" "}
                    <Link to={EXPLORE_DATA_PAGE_WHAT_DATA_ARE_MISSING_LINK}>
                      What Data Are Missing
                    </Link>{" "}
                    section. Here, we provide further details:
                  </p>
                  <ul>
                    <li>
                      National statistics are aggregations of state-wide data.
                      If state data is not available, these aggregations may be
                      incomplete and potentially skewed.National statistics are
                      aggregations of state-wide data. If state data is not
                      available, these aggregations may be incomplete and
                      potentially skewed.
                    </li>
                    <li>
                      When calculating the national-level of COVID-19 cases,
                      deaths, and hospitalizations per100k, we only include the
                      population of the states that do not have a suppressed
                      hospitalization or death count, as part of the total
                      population for each respective measure.
                    </li>
                    <li>
                      Decisions to suppress COVID-19 data for particular states
                      in the tracker are evaluated by comparing the aggregate
                      case, death, and hospitalization counts in the CDC
                      surveillance dataset vs other sources.
                    </li>
                    <li>
                      Data for a state are suppressed if the aggregate counts
                      for that state are less than 5% of the source being used
                      for comparison. These analyses are available for{" "}
                      <a href={urlMap.shliGitHubSuppressCovidCases}>cases</a>{" "}
                      and{" "}
                      <a href={urlMap.shliGitHubSuppressCovidDeaths}>deaths</a>.
                    </li>
                    <li>
                      The underlying data is reported at the case-level;
                      therefore, we cannot determine whether a state/county
                      lacking cases for a particular demographic group, truly
                      has zero cases for that group or whether that locale fails
                      to report demographics correctly.
                    </li>
                  </ul>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>COVID-19 Vaccinations</h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    There is currently no national vaccine demographic dataset,
                    we combine the best datasets we could find for each
                    geographic level.
                  </p>
                  <ul>
                    <li>
                      As it relates to the national level numbers, we use the{" "}
                      <a href={urlMap.cdcVaxTrends}>
                        CDC vaccine demographic dataset,
                      </a>{" "}
                      which provides data on the race/ethnicity, sex, and age
                      range of vaccine recipients, as well whether they have
                      taken one or two shots.{" "}
                    </li>
                    <li>
                      As it relates to the state level, we use{" "}
                      <a href={urlMap.kffCovid}>
                        the Kaiser Family Foundation COVID-19 Indicators
                        dataset,
                      </a>{" "}
                      which is a hand-curated dataset based on analysis from
                      state health department websites. It is the only state
                      level demographic vaccine dataset that publishes this data
                      in a usable format. The dataset only provides data on the
                      race and ethnicity of vaccine recipients, and for the
                      majority of states counts individuals who have received at
                      least one shot as vaccinated. It does not include any data
                      for U.S. territories.
                    </li>
                    <li>
                      As it relates to the county level, we could not identify a
                      dataset that provides vaccine demographics. In the absence
                      of this data, we opted to use the{" "}
                      <a href={urlMap.cdcVaxCounty}>
                        COVID-19 Vaccinations in the United States, County
                        dataset
                      </a>{" "}
                      which provides the total number of vaccinations per
                      county.
                    </li>
                  </ul>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  Vaccination Population Sources
                </h3>
                <div className={styles.FaqAnswer}>
                  <ul>
                    <li>
                      As it relates to national numbers, we use the population
                      numbers provided by the CDC, as they include population
                      estimates from <b>Palau</b>, <b>Micronesia</b>, and{" "}
                      <b>the U.S. Marshall Islands</b>.
                    </li>
                    <li>
                      As it relates to the state level, we use the ACS 2019
                      estimates of each state’s population to calculate the
                      total number of vaccinations. Population counts for each
                      demographic group at the state level are provided by the
                      Kaiser Family Foundation. They provide population
                      estimates for <b>Asian</b>, <b>Black</b>, <b>White</b>,
                      and <b>Hispanic</b>. Consequently, we decided to use the
                      ACS 2019 estimation for{" "}
                      <b>American Indian and Alaska Native</b>, and{" "}
                      <b>Native Hawaiian</b> and <b>Pacific Islander</b>. These
                      alternate population comparisons metrics are displayed
                      with a different color on the disparities bar chart. We
                      are unable to show a population comparison metric for
                      “Unrepresented Race” because we are unsure of the
                      definition in each state.
                    </li>
                    <li>
                      As it relates to the county level, we use the ACS 2019
                      population estimations.
                    </li>
                  </ul>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>Vaccination Data</h3>
                <div className={styles.FaqAnswer}>
                  <ul>
                    <li>
                      There is no standardized definition for “vaccinated”.
                      Consequently, we display vaccination data as “at least one
                      dose” which is used by most states. However, some states
                      like Texas do not report demographic-specific dose number
                      information to CDC. <b>Arkansas</b>, <b>Illinois</b>,{" "}
                      <b>Maine</b>, <b>New Jersey</b>, and <b>Tennessee</b>{" "}
                      report “Total vaccine doses administered”, in which case
                      those numbers are reported. Therefore, data for Texas are
                      not represented in the figures and calculations on the
                      national vaccine demographic page.
                    </li>
                    <li>
                      <b>Idaho</b> provides vaccine data only for vaccine
                      recipients who are 18 years and older in line with state
                      laws. COVID vaccination administration data is unavailable
                      for the Vaccinations in the US, and Vaccinations by County
                      pages for the population aged less than 18 years. This
                      only affects the national numbers.
                    </li>
                    <li>
                      Some states report race and ethnicity separately, in which
                      case they report unknown percentages separately. In this
                      case, we show the higher of the two metrics on the
                      national map of unknown cases, and display both numbers on
                      the state page.
                    </li>
                    <li>
                      The Kaiser Family Foundation only collects population data
                      for <b>Asian</b>, <b>Black</b>, <b>White</b>, and{" "}
                      <b>Hispanic</b> demographics, limiting their per 100k
                      metrics and what demographic breakdowns we are able to
                      show at the state level.
                    </li>
                  </ul>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>Incarceration Data</h3>
                <div className={styles.FaqAnswer}>
                  <ul>
                    <li>
                      Incarceration is influenced by a b lend of political
                      forces, laws, and public opinion. Laws that govern
                      sentencing policies and disenfranchisement of convicted
                      felons are some of the political forces that affect voter
                      participation in the <b>justice-involved population</b>.
                    </li>
                    <li>
                      The ability to vote has been described as{" "}
                      <a href={urlMap.repJohnLewisTweet}>
                        the singular most powerful, non-violent tool in American
                        democracy
                      </a>
                      . As of 2020, an estimated 5.17 million people were
                      disenfranchised because of a prior felony conviction with
                      minority populations of voting age being
                      disproportionately represented.{" "}
                      <a href={urlMap.deniedVoting}>(Sentencing Project)</a>
                    </li>
                    <li>
                      <a href={urlMap.aafp}>Studies have also shown</a> that
                      incarceration increases the prevalence of chronic health
                      conditions, infectious diseases such as HIV/ AIDS, mental
                      illnesses and substance use disorders. Incarceration has
                      also been{" "}
                      <a href={urlMap.rwjf}>
                        shown to cause a reduction in life expectancy
                      </a>
                      , with each year spent in prison corresponding to 2 years
                      of reduced life expectancy.
                    </li>
                    <li>
                      The impact of incarceration on the health of the justice
                      involved lingers long after the period of incarceration is
                      over. Upon reentry into society, the lack of adequate
                      access to healthcare and the resources that engender
                      health such as health insurance coverage, housing,
                      employment, the lack of opportunities for upward
                      advancement etc. further exacerbates the health inequities
                      experienced by this group.
                    </li>
                  </ul>
                </div>
                <p>
                  <b>Incarceration Data Sources</b>
                </p>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  What are social determinants of health?
                </h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    Social determinants of health are conditions in the
                    environments in which people are born, live, learn, work,
                    play, worship, and age that affect a wide range of health,
                    functioning, and quality-of-life outcomes and risks.
                    (Healthy People 2020, CDC)
                  </p>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={styles.FaqSection}>
          <Grid item xs={12} sm={12} md={3}>
            <Typography className={styles.FaqHeaderText} variant="h2">
              Take Action
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={9}>
            <Grid container>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>How can I get involved?</h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    To advance health equity, we need smart, talented,
                    passionate folks like you on board.
                  </p>
                  <ul>
                    <li>
                      Sign up for our newsletter to stay up to date with the
                      latest news
                    </li>
                    <li>
                      Share our site and graphs with your community on social
                      media
                    </li>
                    <li>
                      Share your health equity story.{" "}
                      <a href={`${CONTACT_TAB_LINK}`}>
                        Click here to contact us
                      </a>
                    </li>
                  </ul>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  How do I share or save the visualizations (graphs, charts,
                  maps)?
                </h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    Next to each visualization, there is a circle-shaped button
                    with three dots in it. Click on this button and save as PNG
                    or SVG (SVG provides a higher-quality, scalable image). Due
                    to technical limitations, territories are not currently
                    exported on the national map.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion} id="citation">
                  What is the recommended citation (APA) for the Health Equity
                  Tracker?
                </h3>
                <div className={styles.FaqAnswer}>
                  <p>{CITATION_APA}</p>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <FeedbackBox />
    </>
  );
}

export default MethodologyTab;
