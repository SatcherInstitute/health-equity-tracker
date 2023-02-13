import { urlMap } from "../../../utils/externalUrls";
import { Link } from "react-router-dom";
import { METHODOLOGY_TAB_LINK } from "../../../utils/internalRoutes";

export function MissingCovidData() {
  return (
    <>
      <h4>Missing and suppressed COVID data</h4>
      <p>
        For COVID-19 related reports, this tracker uses disaggregated,
        individual{" "}
        <a href={urlMap.cdcCovidRestricted}>
          case level data reported by states, territories, and other
          jurisdictions to the CDC
        </a>
        . Many of these case records are insufficiently disaggregated, report an
        unknown hospitalization and/or death status, otherwise fail to provide a
        complete picture of COVID-19 and its overall impact. Due to the nature
        of surveillance data, we expect this data to become more complete over
        time and will use the Health Equity Tracker to record that progress.
      </p>
      <p>
        In accordance with our{" "}
        <Link to={METHODOLOGY_TAB_LINK}>methodology</Link>, we suppress this
        incomplete data and render some states grey for certain COVID-19 data
        types, as outlined below:
      </p>
      <ul>
        <li>
          Cases, hospitalizations and deaths: <b>Northern Mariana Islands</b>,{" "}
          <b>Mississippi</b>, <b>West Virginia</b>
        </li>
        <li>
          Hospitalizations and deaths: <b>Hawaii</b>, <b>Nebraska</b>,{" "}
          <b>South Dakota</b>
        </li>
        <li>
          Hospitalizations: <b>Rhode Island</b>
        </li>
        <li>
          Deaths: <b>Delaware</b>
        </li>
      </ul>
      <p>
        Note: The following states' case data for COVID-19 <i>are</i> included,
        but should be interpreted with caution since the cases reported may not
        be representative of the population at large.
      </p>
      <ul>
        <li>
          Deaths (interpret with caution): <b>Mississippi</b> and <b>Georgia</b>
          .
        </li>
      </ul>
    </>
  );
}

export function MissingCovidVaccinationData() {
  return (
    <>
      <h4>Missing COVID-19 vaccination data</h4>
      <ul>
        <li>
          <b>Population data:</b> Because state-reported population categories
          do not always coincide with the categories reported by the census, we
          rely on the Kaiser Family Foundation population tabulations for
          state-reported population categories, which only include population
          numbers for <b>Black,</b> <b>White</b>, <b>Asian</b>, and{" "}
          <b>Hispanic</b>. ‘Percent of vaccinated’ metrics for{" "}
          <b>Native Hawaiian and Pacific Islander</b>, and{" "}
          <b>American Indian and Alaska Native</b> are shown with a population
          comparison metric from the ACS 5-year estimates, while{" "}
          <b>Unrepresented race</b> is shown without any population comparison
          metric.
        </li>
        <li>
          <b>Demographic data:</b> The CDC's county-level vaccine dataset only
          provides vaccination figures for the <b>All</b> group, but does not
          include any demographic disaggregation.
        </li>
      </ul>
    </>
  );
}

export function MissingCAWPData() {
  return (
    <>
      <h4>Missing data for women in legislative office</h4>
      <ul>
        <li>
          The Center for American Women in Politics (CAWP) dataset uses unique
          race/ethnicity groupings that do not correspond directly with the
          categories used by the U.S. Census. For this reason,{" "}
          <b>Middle Eastern & North African (Women)</b>,{" "}
          <b>Asian American & Pacific Islander (Women)</b>, and{" "}
          <b>Native American, Alaska Native, & Native Hawaiian (Women)</b> are
          presented without corresponding population comparison metrics.
        </li>
        <li>
          We are currently unable to locate reliable data on state legislature
          totals, by state, by year prior to 1983. For that reason, we cannot
          calculate rates of representation historically before that year.
        </li>
      </ul>
    </>
  );
}

export function MissingHIVData() {
  return (
    <>
      <h4>Missing data for HIV diagnoses</h4>
      <ul>
        <li>
          The CDC's AtlasPlus contains data at the national, state, regional,
          and county level. Data at the state or county level,for both cases and
          rates, may be suppressed to protect against a situation in which a
          person could potentially be identified.
        </li>
        <li>
          To protect personal privacy, prevent revealing information that might
          identify specific individuals, and ensure the reliability of
          statistical estimates, small data values may not be available in some
          circumstances. Data are suppressed if the denominator population is
          less than 100, or the total case count is 1–4.
        </li>
      </ul>
    </>
  );
}
