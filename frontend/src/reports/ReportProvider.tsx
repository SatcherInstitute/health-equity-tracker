import React, { useState, useRef } from "react";
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
  ABOUT_US_PAGE_LINK,
  DATA_CATALOG_PAGE_LINK,
  TAB_PARAM,
} from "../utils/urlutils";
import { ABOUT_US_CONTACT_TAB_INDEX } from "../pages/AboutUs/AboutUsPage";
import Button from "@material-ui/core/Button";
import ArrowForward from "@material-ui/icons/ArrowForward";
import ShareIcon from "@material-ui/icons/Share";
import styles from "./Report.module.scss";
import ShareDialog from "./ui/ShareDialog";
import DisclaimerAlert from "./ui/DisclaimerAlert";

function getPhraseValue(madLib: MadLib, segmentIndex: number): string {
  const segment = madLib.phrase[segmentIndex];
  return typeof segment === "string"
    ? segment
    : madLib.activeSelections[segmentIndex];
}

function ReportProvider(props: { madLib: MadLib; setMadLib: Function }) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const fieldRef = useRef<HTMLInputElement>(null);

  function getReport() {
    // Each report has a unique key based on its props so it will create a
    // new instance and reset its state when the provided props change.
    switch (props.madLib.id as MadLibId) {
      case "disparity":
        const dropdownOption = getPhraseValue(props.madLib, 1);
        return (
          <VariableDisparityReport
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
        <DisclaimerAlert
          jumpToData={() => {
            if (fieldRef.current) {
              fieldRef.current.scrollIntoView();
            }
          }}
        />
        {getReport()}
      </div>
      <div
        id="missingDataInfo"
        className={styles.MissingDataInfo}
        ref={fieldRef}
      >
        <h1>What Data Are Missing?</h1>
        <p>Unfortunately there are crucial data missing in our sources.</p>
        <h3>Missing and Misidentified People</h3>
        <p>
          Currently, there are no required or standardized race and ethnicity
          categories for data collection across state and local jurisdictions.
          The most notable gaps exist for race and ethnic groups, physical and
          mental health status, and gender categories. Many states do not record
          data for American Indian, Alaska Native, Native Hawaiian and Pacific
          Islander racial categories, lumping these people into other groups.
          Individuals who identify as Hispanic/Latino may not be recorded in
          their respective race category. Neither disability nor mental health
          status is collected with the COVID-19 case data. Additionally, gender
          is recorded only as female, male, or other.
        </p>
        <h3>Missing Cases</h3>
        <p>
          For COVID-19 related reports, this tracker uses disaggregated,
          individual{" "}
          <a href="https://www.cdc.gov/coronavirus/2019-ncov/cases-updates/about-us-cases-deaths.html">
            case level data reported by states, territories, and other
            jurisdictions to the CDC
          </a>
          . We cannot report accurate metrics for states that do not provide
          disaggregated data to the CDC, so these states appear as grey on the
          maps reporting COVID-19 cases, hospitalizations and deaths: 
          <b>
            Louisiana, Mississippi, Missouri, New Hampshire, North Dakota,{" "}
            Texas, and Wyoming
          </b>
          . The following states' data are included, but their data should be
          interpreted with caution since the cases reported may not be
          representative of the population at large: 
          <b>
            Connecticut, Florida, Kentucky, Maryland, Michigan, Nebraska, New
            Mexico, Ohio, Rhode Island, West Virginia.
          </b>
        </p>
        <h3>Missing Outcomes</h3>
        <p>
          Furthermore, many COVID-19 case records are incomplete, with an
          unknown hospitalization and/or death status. This means that some
          states that report disaggregated COVID-19 case data still do not
          provide a complete picture of its overall impact. Due to the nature of
          surveillance data, we expect this picture to become more complete over
          time and will use the Health Equity Tracker to record the progress.
          Until then, the following states appear as grey when viewing COVID-19
          maps featuring hospitalizations and deaths:{" "}
          <b>Hawaii, Maryland, Nebraska, New Mexico, Rhode Island, </b>and{" "}
          <b>South Dakota</b>. <b>Delaware </b>and <b>West Virginia</b> are
          included when viewing hospitalizations but appear as grey when viewing
          reports on deaths.
        </p>
        <div className={styles.MissingDataContactUs}>
          <p>
            Do you have information on health outcomes at the state and local
            level that belong in the Health Equity Tracker?
            <br />
            <LinkWithStickyParams
              to={`${ABOUT_US_PAGE_LINK}?${TAB_PARAM}=${ABOUT_US_CONTACT_TAB_INDEX}`}
            >
              We would love to hear from you!
            </LinkWithStickyParams>
          </p>
        </div>
        <a href={DATA_CATALOG_PAGE_LINK}>
          <Button color="primary" endIcon={<ArrowForward />}>
            See Our Data Sources
          </Button>
        </a>
      </div>
    </>
  );
}

export default ReportProvider;
