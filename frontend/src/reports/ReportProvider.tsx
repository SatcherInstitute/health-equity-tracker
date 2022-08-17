import React, { useRef, useState } from "react";
import { OneVariableReport } from "./OneVariableReport";
import TwoVariableReport from "./TwoVariableReport";
import {
  MadLib,
  getMadLibWithUpdatedValue,
  MadLibId,
  getMadLibPhraseText,
  getPhraseValue,
} from "../utils/MadLibs";
import { Fips } from "../data/utils/Fips";
import { LinkWithStickyParams } from "../utils/urlutils";
import {
  DATA_CATALOG_PAGE_LINK,
  CONTACT_TAB_LINK,
  METHODOLOGY_TAB_LINK,
} from "../utils/internalRoutes";
import Button from "@material-ui/core/Button";
import ArrowForward from "@material-ui/icons/ArrowForward";
import styles from "./Report.module.scss";
import DisclaimerAlert from "./ui/DisclaimerAlert";
import {
  DropdownVarId,
  METRIC_CONFIG,
  VariableConfig,
} from "../data/config/MetricConfig";
import { Link } from "react-router-dom";
import ShareButtons from "./ui/ShareButtons";
import { Helmet } from "react-helmet-async";
import { urlMap } from "../utils/externalUrls";
import { Box } from "@material-ui/core";
import DefinitionsList from "./ui/DefinitionsList";
import LifelineAlert from "./ui/LifelineAlert";
import LazyLoad from "react-lazyload";
import IncarceratedChildrenLongAlert from "./ui/IncarceratedChildrenLongAlert";
import { StepData } from "../utils/useStepObserver";

export const SINGLE_COLUMN_WIDTH = 12;

interface ReportProviderProps {
  isSingleColumn: boolean;
  madLib: MadLib;
  selectedConditions: VariableConfig[];
  showLifeLineAlert: boolean;
  setMadLib: Function;
  doScrollToData?: boolean;
  showIncarceratedChildrenAlert: boolean;
  isScrolledToTop: boolean;
}

function ReportProvider(props: ReportProviderProps) {
  const [reportSteps, setReportSteps] = useState<StepData[]>([]);

  // only show determinants that have definitions
  const definedConditions = props.selectedConditions.filter(
    (condition) => condition?.variableDefinition
  );

  // create a subset of MetricConfig (with top level string + datatype array)
  // that matches only the selected, defined conditions
  const metricConfigSubset = Object.entries(METRIC_CONFIG).filter(
    (dataTypeArray) =>
      dataTypeArray[1].some((dataType) => definedConditions.includes(dataType))
  );

  const fieldRef = useRef<HTMLInputElement>(null);
  const definitionsRef = useRef<HTMLInputElement>(null);

  const reportWrapper = props.isSingleColumn
    ? styles.OneColumnReportWrapper
    : styles.TwoColumnReportWrapper;

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

  function getReport() {
    // Each report has a unique key based on its props so it will create a
    // new instance and reset its state when the provided props change.
    switch (props.madLib.id as MadLibId) {
      case "disparity":
        const dropdownOption = getPhraseValue(props.madLib, 1);
        return (
          <OneVariableReport
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
            isScrolledToTop={props.isScrolledToTop}
            reportSteps={reportSteps}
            setReportSteps={setReportSteps}
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
            isScrolledToTop={props.isScrolledToTop}
            reportSteps={reportSteps}
            setReportSteps={setReportSteps}
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
            isScrolledToTop={props.isScrolledToTop}
            reportSteps={reportSteps}
            setReportSteps={setReportSteps}
          />
        );
      default:
        return <p>Report not found</p>;
    }
  }

  return (
    <>
      <Helmet>
        <title>
          {getMadLibPhraseText(props.madLib)} - Health Equity Tracker
        </title>
      </Helmet>
      <div className={reportWrapper}>
        <ShareButtons madLib={props.madLib} />
        {props.showLifeLineAlert && <LifelineAlert />}
        <DisclaimerAlert jumpToData={jumpToData} />
        {props.showIncarceratedChildrenAlert && false && (
          <IncarceratedChildrenLongAlert />
        )}

        {getReport()}
      </div>
      <div className={styles.MissingDataContainer}>
        <aside
          id="missingDataInfo"
          ref={fieldRef}
          className={styles.MissingDataInfo}
        >
          {/* Display condition definition(s) based on the tracker madlib settings */}
          <div ref={definitionsRef}>
            {definedConditions.length > 0 && (
              <Box mb={5}>
                <h3 id="def" className={styles.FootnoteLargeHeading}>
                  Definitions:
                </h3>
                <LazyLoad offset={300} height={181} once>
                  <DefinitionsList variablesToDefine={metricConfigSubset} />
                </LazyLoad>
              </Box>
            )}
          </div>

          <Box mt={10}>
            <h3 id="what" className={styles.FootnoteLargeHeading}>
              What Data Are Missing?
            </h3>
          </Box>

          <p>Unfortunately there are crucial data missing in our sources.</p>
          <h4>Missing and Misidentified People</h4>
          <p>
            Currently, there are no required or standardized race and ethnicity
            categories for data collection across state and local jurisdictions.
            The most notable gaps exist for race and ethnic groups, physical and
            mental health status, and sex categories. Many states do not record
            data for <b>American Indian</b>, <b>Alaska Native</b>,{" "}
            <b>Native Hawaiian and Pacific Islander</b> racial categories,
            lumping these people into other groups. Individuals who identify as{" "}
            <b>Hispanic/Latino</b> may not be recorded in their respective race
            category. Neither disability nor mental health status is collected
            with the COVID-19 case data. Additionally, sex is recorded only as
            female, male, or other.
          </p>

          <h4>Missing and Suppressed COVID Data</h4>
          <p>
            For COVID-19 related reports, this tracker uses disaggregated,
            individual{" "}
            <a href={urlMap.cdcCovidDataInfo}>
              case level data reported by states, territories, and other
              jurisdictions to the CDC
            </a>
            . Many of these case records are insufficiently disaggregated,
            report an unknown hospitalization and/or death status, otherwise
            fail to provide a complete picture of COVID-19 and its overall
            impact. Due to the nature of surveillance data, we expect this data
            to become more complete over time and will use the Health Equity
            Tracker to record that progress.
          </p>
          <p>
            In accordance with our{" "}
            <Link to={METHODOLOGY_TAB_LINK}>methodology</Link>, we suppress this
            incomplete data and render some states grey for certain COVID-19
            data types, as outlined below:
          </p>
          <ul>
            <li>
              Cases, hospitalizations and deaths:{" "}
              <b>Northern Mariana Islands</b>, <b>Mississippi</b>,{" "}
              <b>West Virginia</b>
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
            Note: The following states' case data for COVID-19 <i>are</i>{" "}
            included, but should be interpreted with caution since the cases
            reported may not be representative of the population at large.
          </p>
          <ul>
            <li>
              Cases (interpret with caution): <b>Connecticut</b>, <b>Florida</b>
              , <b>Kentucky</b>, <b>Michigan</b>, <b>Nebraska</b>, and{" "}
              <b>Ohio</b>.
            </li>
          </ul>

          <h4>Missing Vaccination Data</h4>
          <p>
            There is no county level vaccine demographic dataset, so we show
            county totals according to the CDC to provide context.
          </p>

          <h4>Missing Population Data</h4>
          <p>
            We primarily incorporate the U.S. Census Bureau's American Community
            Survey (ACS) 5-year estimates when presenting population
            information. However, certain situations have required an alternate
            approach due to incompatible or missing data, as outlined below:{" "}
          </p>

          <ul>
            <li>
              <b>Territories:</b> Population data for{" "}
              <b>Northern Mariana Islands</b>, <b>Guam</b>,{" "}
              <b>American Samoa</b>, and the <b>U.S. Virgin Islands</b> are not
              reported in the ACS five year estimates. The last reliable
              population numbers we could find for these territories is from the
              2010 census, so we use those numbers when calculating all
              territory- and national-level COVID-19 rates.
            </li>
            <li>
              <b>COVID-19 Vaccinations:</b> Because state-reported population
              categories do not always coincide with the categories reported by
              the census, we rely on the Kaiser Family Foundation population
              tabulations for state-reported population categories, which only
              include population numbers for <b>Black,</b> <b>White</b>,{" "}
              <b>Asian</b>, and <b>Hispanic</b>. ‘Percent of vaccinated’ metrics
              for <b>Native Hawaiian and Pacific Islander</b>, and{" "}
              <b>American Indian and Alaska Native</b> are shown with a
              population comparison metric from the ACS 5-year estimates, while{" "}
              <b>Unrepresented race</b> is shown without any population
              comparison metric.
            </li>
            <li>
              <b>Women in Legislative Office:</b> The Center for American Women
              in Politics (CAWP) dataset uses unique race/ethnicity groupings
              that do not correspond directly with the categories used by the
              U.S. Census. For this reason,{" "}
              <b>Middle Eastern & North African (Women)</b>,{" "}
              <b>Asian American & Pacific Islander (Women)</b>, and{" "}
              <b>Native American, Alaska Native, & Native Hawaiian (Women)</b>{" "}
              are presented without corresponding population comparison metrics.
            </li>
          </ul>

          <p></p>
          <p></p>

          <Button
            className={styles.SeeOurDataSourcesButton}
            href={DATA_CATALOG_PAGE_LINK}
            color="primary"
            endIcon={<ArrowForward />}
          >
            See Our Data Sources
          </Button>

          <div className={styles.MissingDataContactUs}>
            <p>
              Do you have information that belongs on the Health Equity Tracker?{" "}
              <LinkWithStickyParams to={`${CONTACT_TAB_LINK}`}>
                We would love to hear from you!
              </LinkWithStickyParams>
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

export default ReportProvider;
