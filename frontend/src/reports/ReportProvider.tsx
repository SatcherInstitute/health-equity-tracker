import React, { useState, useRef, useEffect } from "react";
import { VariableDisparityReport } from "./VariableDisparityReport";
import TwoVariableReport from "./TwoVariableReport";
import {
  MadLib,
  getMadLibWithUpdatedValue,
  DropdownVarId,
  MadLibId,
} from "../utils/MadLibs";
import { Fips } from "../data/utils/Fips";
import {
  LinkWithStickyParams,
  DATA_CATALOG_PAGE_LINK,
  CONTACT_TAB_LINK,
  METHODOLOGY_TAB_LINK,
} from "../utils/urlutils";
import Button from "@material-ui/core/Button";
import ArrowForward from "@material-ui/icons/ArrowForward";
import ShareIcon from "@material-ui/icons/Share";
import styles from "./Report.module.scss";
import ShareDialog from "./ui/ShareDialog";
import DisclaimerAlert from "./ui/DisclaimerAlert";
import { METRIC_CONFIG } from "../data/config/MetricConfig";
import {
  UNREPRESENTED_RACE_DEF,
  VACCINATED_DEF,
} from "../pages/DataCatalog/MethodologyTab";
import { Link } from "react-router-dom";

function getPhraseValue(madLib: MadLib, segmentIndex: number): string {
  const segment = madLib.phrase[segmentIndex];
  return typeof segment === "string"
    ? segment
    : madLib.activeSelections[segmentIndex];
}

interface ReportProviderProps {
  madLib: MadLib;
  setMadLib: Function;
  doScrollToData?: boolean;
}

function ReportProvider(props: ReportProviderProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const fieldRef = useRef<HTMLInputElement>(null);
  const definitionsRef = useRef<HTMLInputElement>(null);

  // internal page links
  function jumpToDefinitions() {
    if (definitionsRef.current) {
      definitionsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }
  function jumpToData() {
    if (fieldRef.current) {
      fieldRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  // handle incoming #missingDataLink link request, only on page load
  useEffect(() => {
    if (props.doScrollToData) {
      jumpToData();
      // remove hash from URL
      // eslint-disable-next-line no-restricted-globals
      history.pushState(
        "",
        document.title,
        window.location.pathname + window.location.search
      );
    }
  }, [props.doScrollToData]);

  function getReport() {
    // Each report has a unique key based on its props so it will create a
    // new instance and reset its state when the provided props change.
    switch (props.madLib.id as MadLibId) {
      case "disparity":
        const dropdownOption = getPhraseValue(props.madLib, 1);
        return (
          <VariableDisparityReport
            jumpToDefinitions={jumpToDefinitions}
            jumpToData={jumpToData}
            key={dropdownOption}
            dropdownVarId={dropdownOption as DropdownVarId}
            fips={new Fips(getPhraseValue(props.madLib, 3))}
            updateFipsCallback={(fips: Fips) =>
              props.setMadLib(
                getMadLibWithUpdatedValue(props.madLib, 3, fips.code)
              )
            }
          />
        );
      case "comparegeos":
        const compareDisparityVariable = getPhraseValue(props.madLib, 1);
        const fipsCode1 = getPhraseValue(props.madLib, 3);
        const fipsCode2 = getPhraseValue(props.madLib, 5);
        return (
          <TwoVariableReport
            jumpToDefinitions={jumpToDefinitions}
            jumpToData={jumpToData}
            key={compareDisparityVariable + fipsCode1 + fipsCode2}
            dropdownVarId1={compareDisparityVariable as DropdownVarId}
            dropdownVarId2={compareDisparityVariable as DropdownVarId}
            fips1={new Fips(fipsCode1)}
            fips2={new Fips(fipsCode2)}
            updateFips1Callback={(fips: Fips) =>
              props.setMadLib(
                getMadLibWithUpdatedValue(props.madLib, 3, fips.code)
              )
            }
            updateFips2Callback={(fips: Fips) =>
              props.setMadLib(
                getMadLibWithUpdatedValue(props.madLib, 5, fips.code)
              )
            }
          />
        );
      case "comparevars":
        const compareDisparityVariable1 = getPhraseValue(props.madLib, 1);
        const compareDisparityVariable2 = getPhraseValue(props.madLib, 3);
        const fipsCode = getPhraseValue(props.madLib, 5);
        const updateFips = (fips: Fips) =>
          props.setMadLib(
            getMadLibWithUpdatedValue(props.madLib, 5, fips.code)
          );
        return (
          <TwoVariableReport
            jumpToDefinitions={jumpToDefinitions}
            jumpToData={jumpToData}
            key={
              compareDisparityVariable1 + compareDisparityVariable2 + fipsCode
            }
            dropdownVarId1={compareDisparityVariable1 as DropdownVarId}
            dropdownVarId2={compareDisparityVariable2 as DropdownVarId}
            fips1={new Fips(fipsCode)}
            fips2={new Fips(fipsCode)}
            updateFips1Callback={updateFips}
            updateFips2Callback={updateFips}
          />
        );
      default:
        return <p>Report not found</p>;
    }
  }

  return (
    <>
      <div className={styles.ReportWrapper}>
        <ShareDialog
          madLib={props.madLib}
          shareModalOpen={shareModalOpen}
          setShareModalOpen={setShareModalOpen}
        />
        <div className={styles.ReportToolbar}>
          <Button
            color="primary"
            startIcon={<ShareIcon />}
            onClick={() => setShareModalOpen(true)}
            data-tip="Share a Link to this Report"
          >
            Share
          </Button>
        </div>
        <DisclaimerAlert jumpToData={jumpToData} />
        {getReport()}
      </div>
      <aside
        id="missingDataInfo"
        ref={fieldRef}
        className={styles.MissingDataInfo}
      >
        <h3 className={styles.FootnoteLargeHeading}>What Data Are Missing?</h3>
        <p>Unfortunately there are crucial data missing in our sources.</p>
        <h4>Missing and Misidentified People</h4>
        <p>
          Currently, there are no required or standardized race and ethnicity
          categories for data collection across state and local jurisdictions.
          The most notable gaps exist for race and ethnic groups, physical and
          mental health status, and sex categories. Many states do not record
          data for <b>American Indian</b>, <b>Alaska Native</b>,{" "}
          <b>Native Hawaiian and Pacific Islander</b> racial categories, lumping
          these people into other groups. Individuals who identify as{" "}
          <b>Hispanic/Latino</b> may not be recorded in their respective race
          category. Neither disability nor mental health status is collected
          with the COVID-19 case data. Additionally, sex is recorded only as
          female, male, or other.
        </p>
        <h4>Missing Cases</h4>
        <p>
          For COVID-19 related reports, this tracker uses disaggregated,
          individual{" "}
          <a href="https://www.cdc.gov/coronavirus/2019-ncov/cases-updates/about-us-cases-deaths.html">
            case level data reported by states, territories, and other
            jurisdictions to the CDC
          </a>
          . The following states appear grey on the maps reporting COVID-19
          cases, hospitalizations and deaths because they have not provided
          sufficient disaggregated data to the CDC: <b>Louisiana</b>,{" "}
          <b>Mississippi</b>, <b>Missouri</b>, <b>North Dakota</b>, <b>Texas</b>
          , and <b>West Virginia</b>. The following states' data for COVID-19
          are included, but their data should be interpreted with caution since
          the cases reported may not be representative of the population at
          large: 
          <b>Connecticut</b>, <b>Florida</b>, <b>Kentucky</b>, <b>Michigan</b>,{" "}
          <b>Nebraska</b>, and <b>Ohio</b>.
        </p>
        <h4>Missing Outcomes</h4>
        <p>
          Many COVID-19 case records are incomplete, with an unknown
          hospitalization and/or death status. This means that some states which
          report disaggregated COVID-19 case data still do not provide a
          complete picture of its overall impact. Due to the nature of
          surveillance data, we expect this picture to become more complete over
          time and will use the Health Equity Tracker to record the progress.
          Until then, in accordance with our{" "}
          <Link to={METHODOLOGY_TAB_LINK}>methodology</Link>, the following
          states appear grey when viewing COVID-19 maps featuring
          hospitalizations and deaths: <b>Hawaii</b>, <b>Nebraska</b>,{" "}
          <b>South Dakota</b>, and <b>Wyoming</b>. <b>Delaware</b> is included
          when viewing hospitalizations, but not deaths, and <b>Rhode Island</b>{" "}
          is included when viewing deaths, but not hospitalizations.
        </p>
        <h4>Missing Vaccination Data</h4>
        <p>
          There is no county level vaccine demographic dataset, so we show
          county totals according to the CDC to provide context. Furthermore,{" "}
          <b>Texas</b> does not provide vaccine demographic information to the
          CDC, so all national vaccine numbers exclude Texas, and Texas’
          population isn’t counted in the national per 100k population metrics.
        </p>
        <h4>Missing Population Data</h4>
        <p>
          The census bureau does not release population data for the{" "}
          <b>Northern Mariana Islands</b>, <b>Guam</b>, or the{" "}
          <b>U.S. Virgin Islands</b> in their ACS five year estimates. The last
          reliable population numbers we could find for these territories is
          from the 2010 census, so we use those numbers when calculating the per
          100k COVID-19 rates nationally and for all territory level rates.
        </p>
        <p>
          Because state reported population categories do not always coincide
          with the categories reported by the census, we rely on the Kaiser
          Family Foundation population tabulations for state reported population
          categories, which only include population numbers for <b>Black,</b>{" "}
          <b>White</b>, <b>Asian</b>, and <b>Hispanic</b>. Percent of vaccinated
          metrics for <b>Native Hawaiian and Pacific Islander</b>, and{" "}
          <b>American Indian and Alaska Native</b> are shown with a population
          comparison metric from the American Community Survey 5-year estimates,
          while <b>Some Other Race</b> is shown without any population
          comparison metric.
        </p>
        <div className={styles.MissingDataContactUs}>
          <p>
            Do you have information on health outcomes at the state and local
            level that belong in the Health Equity Tracker?
            <br />
            <LinkWithStickyParams to={`${CONTACT_TAB_LINK}`}>
              We would love to hear from you!
            </LinkWithStickyParams>
          </p>
        </div>
        <a href={DATA_CATALOG_PAGE_LINK}>
          <Button color="primary" endIcon={<ArrowForward />}>
            See Our Data Sources
          </Button>
        </a>

        {/* DEFINITIONS */}
        <h3 ref={definitionsRef} className={styles.FootnoteLargeHeading}>
          Definitions
        </h3>
        <p>
          Across data sets and reporting agencies the definitions of specific
          terminology can vary widely. Below we have defined some of the terms
          used on this site. For more detailed information, please read through
          our{" "}
          <LinkWithStickyParams
            className={styles.MethodologyContactUsLink}
            to={METHODOLOGY_TAB_LINK}
          >
            methodology page
          </LinkWithStickyParams>
          .
        </p>
        <ul>
          <li>
            <b>{METRIC_CONFIG["vaccinations"][0].variableFullDisplayName}</b>
            {": "}
            {VACCINATED_DEF}
          </li>
          {/* TODO unwrap FALSE from <li> once we introduce our new term */}
          {false && (
            <li>
              <span className={styles.DefinedTerm}>Unrepresented Race</span>
              {": "}
              {UNREPRESENTED_RACE_DEF}
            </li>
          )}
        </ul>
      </aside>
    </>
  );
}

export default ReportProvider;
