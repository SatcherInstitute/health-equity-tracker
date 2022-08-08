import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "../ui/FaqSection.module.scss";
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
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  Typography,
} from "@material-ui/core";
import { urlMap } from "../../utils/externalUrls";
import DefinitionsList from "../../reports/ui/DefinitionsList";
import { currentYear } from "../../Footer";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  ALASKA_PRIVATE_JAIL_CAVEAT,
  CombinedIncarcerationStateMessage,
} from "../../data/variables/IncarcerationProvider";

export const CITATION_APA = `Health Equity Tracker. (${currentYear()}). Satcher Health Leadership Institute. Morehouse School of Medicine. ${HET_URL}.`;

const MethodologyHeader = () => {
  return (
    <Grid
      item
      className={styles.MethodologyQuestionAndAnswer}
      component="article"
    >
      <h3 id="main" className={styles.MethodologyQuestion}>
        Recommended Citation (APA) for the Health Equity Tracker:
      </h3>

      <div className={styles.MethodologyAnswer}>
        <Card elevation={3}>
          <p className={styles.CitationAPA}>{CITATION_APA}</p>
        </Card>
      </div>
    </Grid>
  );
};

const MethodologyFooter = () => {
  return (
    <Grid
      item
      className={styles.MethodologyQuestionAndAnswer}
      component="article"
    >
      <h3 className={styles.MethodologyQuestion}>What data is missing?</h3>
      <div className={styles.MethodologyAnswer}>
        <p>
          Our tracker will expand to include additional health variables, social
          and political determinants of health.
        </p>
      </div>
      <div className={styles.MethodologyInfoBar}>
        <p>
          Do you have information on health outcomes at the state and local
          level that belong in the Health Equity Tracker?
          <br />
          <LinkWithStickyParams to={CONTACT_TAB_LINK}>
            We would love to hear from you!
          </LinkWithStickyParams>
        </p>
      </div>
    </Grid>
  );
};

function MethodologyTab() {
  return (
    <>
      <Helmet>
        <title>Methodology - Health Equity Tracker</title>
      </Helmet>
      <h2 className={styles.ScreenreaderTitleHeader}>Methodology</h2>
      <Grid container component="article">
        <Grid item>
          <Typography className={styles.FaqHeader} variant="h1" component="h3">
            Frequently asked questions
          </Typography>
        </Grid>
        <Grid item xs={12} className={styles.TestingFaqQAItem} component="ul">
          <Accordion component="li" className={styles.FaqListItem}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={""}
              id={""}
            >
              <Typography
                className={styles.FaqQuestion}
                variant="h2"
                component="h4"
              >
                How did you acquire and standardize the data?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div className={styles.FaqAnswer}>
                <ul>
                  <li>
                    In an effort to be fully transparent, all data is retrieved
                    from publicly sourced APIs and manual downloads
                  </li>
                  <li>
                    Once acquired, this data is converted to tables in Google
                    BigQuery
                  </li>
                  <li>
                    During this process, values are standardized and normalized
                    to facilitate reporting, comparison and visualization
                  </li>
                  <li>
                    All of our map and graph visualizations present crude
                    (non-age-adjusted) percentages and per 100k rates. When
                    possible, we additionally calculate and present age-adjusted
                    ratios in a separate table in an effort to reveal
                    disproportionate impact to certain race/ethnicity groups, as
                    compared to the white (non-Hispanic) population. To learn
                    more, please view our age-adjustment methodology
                  </li>
                  <li>
                    Sources are refreshed when update notifications are received
                  </li>
                  <li>
                    The entire Health Equity Tracker codebase is publicly
                    available and open-source; contributions are welcome via
                    GitHub.
                  </li>
                </ul>
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion component="li" className={styles.FaqListItem}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={""}
              id={""}
            >
              <Typography
                className={styles.FaqQuestion}
                variant="h2"
                component="h4"
              >
                What are the limitations of the tracker, and why were these
                health equity topics chosen?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div className={styles.FaqAnswer}>
                <div className={styles.TestingDiv}>
                  <h3 className={styles.FaqListItem}>COVID-19</h3>
                  <p>
                    For a description of some of the gaps in COVID-19 data,
                    please see the What Data Are Missing section. Here, we
                    provide further details:
                  </p>
                  <ul>
                    <li>
                      National statistics are aggregations of state-wide data.
                      If state data is not available, these aggregations may be
                      incomplete and potentially skewed.
                    </li>
                    <li>
                      When calculating national-level per100k COVID-19 rates for
                      cases, deaths, and hospitalizations, we only include the
                      population of states that do not have a suppressed case,
                      hospitalization, or death count as part of the total
                      population for each respective measure. See the 'What data
                      are missing' section for further details.
                    </li>
                    <li>
                      To protect the privacy of affected individuals, COVID-19
                      data may be hidden in counties with low numbers of
                      COVID-19 cases, hospitalizations and deaths.
                    </li>
                    <li>
                      Decisions to suppress COVID-19 data for particular states
                      in the tracker are evaluated by comparing the aggregate
                      case, death, and hospitalization counts in the CDC
                      surveillance dataset vs other sources, such as the New
                      York Times. Data for a state are suppressed if the
                      aggregate counts for that state are less than 5% of the
                      source being used for comparison. These analyses are
                      available for cases and deaths.
                    </li>
                    <li>
                      The underlying data is reported at the case-level, so we
                      cannot determine whether a state/county lacking cases for
                      a particular demographic group truly has zero cases for
                      that group or whether that that locale fails to report
                      demographics correctly.
                    </li>
                  </ul>
                </div>
                <div className={styles.TestingDiv}>
                  <h3 className={styles.FaqListItem}>COVID-19 Vaccinations</h3>
                  <p>
                    Because there is currently no national vaccine demographic
                    dataset, we combine the best datasets we could find for each
                    geographic level.
                  </p>
                  <ul>
                    <li>
                      For the national level numbers, we use the CDC vaccine
                      demographic dataset, which provides data on the
                      race/ethnicity, sex, and age range of vaccine recipients,
                      as well whether they have taken one or two shots.
                    </li>
                    <li>
                      For the state level we use the Kaiser Family Foundation
                      COVID-19 Indicators dataset, which is a hand-curated
                      dataset based on analysis from state health department
                      websites. It is the only state level demographic vaccine
                      dataset that publishes this data in a usable format. The
                      dataset only provides data on the race and ethnicity of
                      vaccine recipients, and for the majority of states counts
                      individuals who have received at least one shot as
                      vaccinated. It does not include any data for US
                      territories.
                    </li>
                    <li>
                      For the county level, we could not identify a dataset that
                      provides vaccine demographics, so to show some context we
                      use the COVID-19 Vaccinations in the United States, County
                      dataset which provides the total number of vaccinations
                      per county.
                    </li>
                  </ul>
                </div>
                <div className={styles.TestingDiv}>
                  <h3 className={styles.FaqListItem}>
                    Vaccination Population Sources
                  </h3>
                  <ul>
                    <li>
                      For the national numbers we use the population numbers
                      provided by the CDC, we chose to do this because they
                      include population estimates from Palau, Micronesia, and
                      the U.S. Marshall Islands, which are difficult to find
                      estimations for. Furthermore the CDC has estimations for
                      age ranges that the ACS numbers do not readily provide, as
                      they use a per year population estimate from the ACS that
                      we do not use anywhere else and have not added to our
                      system.
                    </li>
                    <li>
                      For the state level, to calculate the total number of
                      vaccinations we use the ACS 2019 estimates of each state’s
                      population. The population counts for each demographic
                      group at the state level are provided by the Kaiser Family
                      Foundation, who researched exactly what the definition of
                      each demographic group in every state is. They provide
                      population estimates for Asian, Black, White, and
                      Hispanic, so we fill in the ACS 2019 estimation for
                      American Indian and Alaska Native, and Native Hawaiian and
                      Pacific Islander. These alternate population comparisons
                      metrics shown with a different color on the disparities
                      bar chart. We are unable to show a population comparison
                      metric for “Unrepresented Race” because we are unsure of
                      the definition in each state.
                    </li>
                    <li>
                      For the county level we use the ACS 2019 population
                      estimations.
                    </li>
                  </ul>
                </div>
                <div className={styles.TestingDiv}>
                  <h3 className={styles.FaqListItem}>
                    Vaccination Data Limitations
                  </h3>
                  <ul>
                    <li>
                      Texas does not report demographic-specific dose number
                      information to CDC, so data for Texas are not represented
                      in the figures and calculations on the national vaccine
                      demographic page.
                    </li>
                    <li>
                      Idaho provides vaccine data only for vaccine recipients
                      who are 18 years and older in line with state laws. COVID
                      vaccination administration data is unavailable for the
                      Vaccinations in the US, and Vaccinations by County pages
                      for the population aged less than 18 years. This only
                      affects the national numbers.
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
                      for Asian, Black, White, and Hispanic demographics,
                      limiting their per 100k metrics and what demographic
                      breakdowns we are able to show at the state level.
                    </li>
                    <li>
                      As there is no standardized definition for “vaccinated”,
                      we display vaccination data as “at least one dose” which
                      is used by most states. However, some states including
                      Arkansas, Illinois, Maine, New Jersey, and Tennessee
                      report “Total vaccine doses administered”, in which case
                      those numbers are reported.
                    </li>
                  </ul>
                </div>
                <div className={styles.TestingDiv}>
                  <h3 className={styles.FaqListItem}>
                    America's Health Rankings
                  </h3>
                  <p>
                    Multiple chronic disease, behavioral health, and social
                    determinants of health in the tracker are sourced from
                    America's Health Rankings, who in turn source the majority
                    of their data from the Behavioral Risk Factor Surveillance
                    System (BRFSS), a survey run by the CDC, along with
                    supplemental data from CDC WONDER and the US Census.
                  </p>
                  <ul>
                    <li>
                      Because BRFSS is a survey, there are not always enough
                      respondents to provide a statistically meaningful estimate
                      of disease prevalence, especially for smaller and
                      typically marginalized racial groups. Please see the
                      methodology page of America's Health Rankings for details
                      on data suppression.
                    </li>
                    <li>
                      BRFSS data broken down by race and ethnicity is not
                      available at the county level, so the tracker does not
                      display these conditions at the county level either.
                    </li>
                  </ul>
                </div>
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion component="li" className={styles.FaqListItem}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={""}
              id={""}
            >
              <Typography
                className={styles.FaqQuestion}
                variant="h2"
                component="h4"
              >
                What do the metrics on the tracker mean?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div className={styles.FaqAnswer}>
                <p>
                  In the definitions below, we use COVID-19 Cases as the
                  variable, and Race and Ethnicity as the demographic breakdown
                  for simplicity; the definitions apply to all variables and
                  demographic breakdowns.
                </p>
                <ul>
                  <li>
                    Total COVID-19 cases per 100k people: The total rate of
                    occurrence of COVID-19 cases expressed per 100,000 people
                    (i.e. 10,000 per 100k implies a 10% occurrence rate). This
                    metric normalizes for population size, allowing for
                    comparisons across demographic groups. This metric is
                    rounded to the nearest integer in the tracker.
                  </li>
                  <li>
                    Share of total COVID-19 cases with unknown race and
                    ethnicity: Within a locale, the percentage of COVID-19 cases
                    that reported unknown race/ethnicity. For example, a value
                    of 20% for Georgia means that 20% of Georgia's reported
                    cases had unknown race/ethnicity. This metric is rounded to
                    one decimal place. In instances where this would round to
                    0%, two decimal places are used.
                  </li>
                  <li>
                    Share of total COVID-19 cases: The percentage of all
                    COVID-19 cases that reported a particular race/ethnicity,
                    excluding cases with unknown race/ethnicity. This metric is
                    rounded to one decimal place. In instances where this would
                    round to 0%, two decimal places are used.
                  </li>
                  <li>
                    Population share: The percentage of the total population
                    that identified as a particular race/ethnicity in the ACS
                    survey. This metric is rounded to one decimal place. In
                    instances where this would round to 0%, two decimal places
                    are used.
                  </li>
                </ul>
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion component="li" className={styles.FaqListItem}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={""}
              id={""}
            >
              <Typography
                className={styles.FaqQuestion}
                variant="h2"
                component="h4"
              >
                What do the condition variables on the tracker mean?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div className={styles.FaqAnswer}>
                <div className={styles.TestingDiv}>
                  <h3 className={styles.FaqListItem}>COVID-19</h3>
                  <ul>
                    <li>
                      COVID-19 Cases: A COVID-19 case is an individual who has
                      been determined to have COVID-19 using a set of criteria
                      known as a case definition. Cases can be classified as
                      suspect, probable, or confirmed. CDC counts include
                      probable and confirmed cases and deaths. Suspect cases and
                      deaths are excluded.
                    </li>
                    <li>
                      COVID-19 Deaths: The number of people who died due to
                      COVID-19.
                    </li>
                    <li>
                      COVID-19 Hospitalizations: The number of people
                      hospitalized at any point while ill with COVID-19.
                    </li>
                    <li>
                      COVID-19 Vaccinations: For the national level and most
                      states this indicates people who have received at least
                      one dose of a COVID-19 vaccine.
                    </li>
                  </ul>
                </div>
                <div className={styles.TestingDiv}>
                  <h3 className={styles.FaqListItem}>Behavioral Health</h3>
                  <ul>
                    <li>Suicides: Deaths due to intentional self-harm.</li>
                    <li>
                      Depression Cases: Adults who reported being told by a
                      health professional that they have a depressive disorder
                      including depression, major depression, minor depression
                      or dysthymia.
                    </li>
                    <li>
                      Excessive Drinking Cases: Adults who reported binge
                      drinking (four or more [females] or five or more [males]
                      drinks on one occasion in the past 30 days) or heavy
                      drinking (eight or more [females] or 15 or more [males]
                      drinks per week).
                    </li>
                    <li>
                      Non-medical Drug Use: Adults who reported using
                      prescription drugs non-medically (including pain
                      relievers, stimulants, sedatives) or illicit drugs
                      (excluding cannabis) in the last 12 months. Note: This
                      data type includes both of the other opioid-related data
                      types: “Non-medical Use of Prescription Opioids” and “Use
                      of Illicit Opioids”.{" "}
                    </li>
                    <li>
                      Non-medical Prescription Opioid Use: Adults who reported
                      using illicit opioids. Note: This is a subset of the
                      “Non-medical Drug Use” data type.
                    </li>
                    <li>
                      Illicit Opioid Use: Adults who reported using prescription
                      opioids non-medically. Note: This is a subset of the
                      “Non-medical Drug Use” data type.
                    </li>
                    <li>
                      Frequent Mental Distress Cases: Adults who reported their
                      mental health was not good 14 or more days in the past 30
                      days.
                    </li>
                  </ul>
                </div>
                <div className={styles.TestingDiv}>
                  <h3 className={styles.FaqListItem}>Chronic Disease</h3>
                  <ul>
                    <li>
                      Diabetes: Adults who reported being told by a health
                      professional that they have diabetes (excluding
                      prediabetes and gestational diabetes).
                    </li>
                    <li>
                      COPD: Adults who reported being told by a health
                      professional that they have chronic obstructive pulmonary
                      disease, emphysema or chronic bronchitis.
                    </li>
                    <li>
                      Asthma Cases: Adults who reported being told by a health
                      professional that they currently have asthma.
                    </li>
                    <li>
                      Cases of Cardiovascular Diseases: Adults who reported
                      being told by a health professional that they had angina
                      or coronary heart disease; a heart attack or myocardial
                      infarction; or a stroke.
                    </li>
                    <li>
                      Cases of Chronic Kidney Disease: Adults who reported being
                      told by a health professional that they have kidney
                      disease not including kidney stones, bladder infection or
                      incontinence.
                    </li>
                  </ul>
                </div>
                <div className={styles.TestingDiv}>
                  <h3 className={styles.FaqListItem}>
                    Social Determinants of Health
                  </h3>
                  <ul>
                    <li>
                      Uninsured Individuals: Health insurance coverage in the
                      ACS and other Census Bureau surveys define coverage to
                      include plans and programs that provide comprehensive
                      health coverage. Plans that provide insurance only for
                      specific conditions or situations such as cancer and
                      long-term care policies are not considered comprehensive
                      health coverage. Likewise, other types of insurance like
                      dental, vision, life, and disability insurance are not
                      considered comprehensive health insurance coverage.
                    </li>
                    <li>
                      Individuals Below The Poverty Line: Following the Office
                      of Management and Budget's (OMB) Statistical Policy
                      Directive 14, the Census Bureau uses a set of money income
                      thresholds that vary by family size and composition to
                      determine who is in poverty. If a family's total income is
                      less than the family's threshold, then that family and
                      every individual in it is considered in poverty. The
                      official poverty thresholds do not vary geographically,
                      but they are updated for inflation using the Consumer
                      Price Index (CPI-U). The official poverty definition uses
                      money income before taxes and does not include capital
                      gains or noncash benefits (such as public housing,
                      Medicaid, and food stamps).
                    </li>
                    <li>
                      Preventable Hospitalizations: Discharges following
                      hospitalization for diabetes with short- or long-term
                      complications, uncontrolled diabetes without
                      complications, diabetes with lower-extremity amputation,
                      chronic obstructive pulmonary disease, angina without a
                      procedure, asthma, hypertension, heart failure,
                      dehydration, bacterial pneumonia or urinary tract
                      infection per 100,000 Medicare beneficiaries ages 18 and
                      older continuously enrolled in Medicare fee-for-service
                      Part A.
                    </li>
                    <li>
                      The Kaiser Family Foundation only collects population data
                      for Asian, Black, White, and Hispanic demographics,
                      limiting their per 100k metrics and what demographic
                      breakdowns we are able to show at the state level.
                    </li>
                    <li>
                      Care Avoidance Due to Cost: Adults who reported a time in
                      the past 12 months when they needed to see a doctor but
                      could not because of cost.
                    </li>
                  </ul>
                </div>
                <div className={styles.TestingDiv}>
                  <h3 className={styles.FaqListItem}>
                    Political Determinants of Health
                  </h3>
                  <ul>
                    <li>
                      Voter Participation: U.S. citizens ages 18 and older who
                      voted in either the last presidential election, the last
                      midterm national election, or the average of both where
                      that data is available.
                    </li>
                    <li>
                      Women in US Congress: Individuals identifying as women who
                      are currently serving in the Congress of the United
                      States, including members of the U.S. Senate and members,
                      territorial delegates, and resident commissioners of the
                      U.S. House of Representatives. Women who self-identify as
                      more than one race/ethnicity are included in the rates for
                      each group with which they identify.
                    </li>
                    <li>
                      Women in State Legislatures: Individuals identifying as
                      women currently serving in their state or territory’s
                      legislature. Women who self-identify as more than one
                      race/ethnicity are included in the rates for each group
                      with which they identify.
                    </li>
                    <li>
                      Individuals in Prison: Individuals of any age, including
                      children, under the jurisdiction of an adult prison
                      facility. ‘Age’ reports at the national level include only
                      the subset of this jurisdictional population who have been
                      sentenced to one year or more, which accounted for 97% of
                      the total U.S. prison population in 2020. For all national
                      reports, this rate includes both state and federal
                      prisons. For state and territory level reports, only the
                      prisoners under the jurisdiction of that geography are
                      included. For county level reports, Vera reports the
                      number of people incarcerated under the jurisdiction of a
                      state prison system on charges arising from a criminal
                      case in that specific county, which are not available in
                      every state. The county of court commitment is generally
                      where a person was convicted; it is not necessarily the
                      person’s county of residence, and may not even be the
                      county where the crime was committed, but nevertheless is
                      likely to be both. AK, CT, DE, HI, RI, and VT each operate
                      an integrated system that combines prisons and jails; in
                      accordance with the data sources we include those
                      facilities as adult prisons but not as local jails.
                      Prisons are longer-term facilities run by the state or the
                      federal government that typically holds felons and persons
                      with sentences of more than one year. Definitions may vary
                      by state.
                    </li>
                    <li>
                      Individuals in Jail: Individuals of any age, including
                      children, confined in a local, adult jail facility. AK,
                      CT, DE, HI, RI, and VT each operate an integrated system
                      that combines prisons and jails; in accordance with the
                      data sources we include those facilities as adult prisons
                      but not as local jails. Jails are locally operated
                      short-term facilities that hold inmates awaiting trial or
                      sentencing or both, and inmates sentenced to a term of
                      less than one year, typically misdemeanants. Definitions
                      may vary by state.
                    </li>
                  </ul>
                </div>
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion component="li" className={styles.FaqListItem}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={""}
              id={""}
            >
              <Typography
                className={styles.FaqQuestion}
                variant="h2"
                component="h4"
              >
                What do the race/ethnicity groups mean?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div className={styles.FaqAnswer}>
                <p>
                  The combined race/ethnicity groups shown on the tracker can be
                  hard to understand, partially due to non-standard
                  race/ethnicity breakdowns across data sources. Generally, all
                  race/ethnicities on the tracker include Hispanic/Latino unless
                  otherwise specified.
                </p>
                We include a few example groups and definitions below. Note that
                the complete definition of a race/ethnicity can only be
                understood in the context of a particular dataset and how it
                classifies race/ethnicity (e.g. the presence of "Other" within a
                dataset changes who might be classified as "Asian" vs "Other").
                <ul>
                  <li>
                    All: Any race or ethnicity, including unknown
                    race/ethnicity.
                  </li>
                  <li>
                    Asian (Non-Hispanic): A single race (Asian), not
                    Hispanic/Latino.
                  </li>
                  <li>Hispanic/Latino: Any race(s), Hispanic/Latino.</li>
                  <li>
                    Black or African American: A single race (African American),
                    including those who identify as African American and
                    Hispanic/Latino.
                  </li>
                  <li>
                    Unrepresented race (Non-Hispanic): A single race not
                    tabulated by the CDC, not of Hispanic/Latino ethnicity.
                    Individuals not identifying as one of the distinct races
                    listed in the source data, or multiracial individuals, are
                    grouped together as “Some other race”. This is a problem as
                    it obscures racial identity for many individuals. In our
                    effort to take transformative action towards achieving
                    health equity the Satcher Health Leadership Institute has
                    decided to rename this category to highlight it as a health
                    equity issue.
                  </li>
                  <li>
                    Two or more races (Non-Hispanic): Multiple races, not
                    Hispanic/Latino.
                  </li>
                  <li>
                    Two or more races & Unrepresented race (Non-Hispanic):
                    People who are either multiple races or a single race not
                    represented by the data source's categorization, and who are
                    not Hispanic/Latino.
                  </li>
                </ul>
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion component="li" className={styles.FaqListItem}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={""}
              id={""}
            >
              <Typography
                className={styles.FaqQuestion}
                variant="h2"
                component="h4"
              >
                What data is missing?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div className={styles.FaqAnswer}>testing</div>
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item></Grid>
      </Grid>
    </>
  );
}

export default MethodologyTab;
