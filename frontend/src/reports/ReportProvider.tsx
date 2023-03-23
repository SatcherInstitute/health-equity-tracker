import React, { useState } from "react";
import { OneVariableReport } from "./OneVariableReport";
import TwoVariableReport from "./TwoVariableReport";
import {
  MadLib,
  getMadLibWithUpdatedValue,
  MadLibId,
  getPhraseValue,
} from "../utils/MadLibs";
import { Fips } from "../data/utils/Fips";
import {
  DATA_CATALOG_PAGE_LINK,
  CONTACT_TAB_LINK,
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
import ShareButtons from "./ui/ShareButtons";
import { Box } from "@material-ui/core";
import DefinitionsList from "./ui/DefinitionsList";
import LifelineAlert from "./ui/LifelineAlert";
import LazyLoad from "react-lazyload";
import IncarceratedChildrenLongAlert from "./ui/IncarceratedChildrenLongAlert";
import { ScrollableHashId } from "../utils/hooks/useStepObserver";
import { LinkWithStickyParams } from "../utils/urlutils";
import {
  MissingCovidData,
  MissingCovidVaccinationData,
  MissingCAWPData,
  MissingHIVData,
} from "../pages/DataCatalog/methodologyContent/missingDataBlurbs";

export const SINGLE_COLUMN_WIDTH = 12;

interface ReportProviderProps {
  isSingleColumn: boolean;
  madLib: MadLib;
  selectedConditions: VariableConfig[];
  showLifeLineAlert: boolean;
  setMadLib: Function;
  showIncarceratedChildrenAlert: boolean;
  isScrolledToTop: boolean;
  headerScrollMargin: number;
}

function ReportProvider(props: ReportProviderProps) {
  const [reportStepHashIds, setReportStepHashIds] = useState<
    ScrollableHashId[]
  >([]);

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

  const currentDropDownIds: DropdownVarId[] = metricConfigSubset.map(
    (id) => id?.[0] as DropdownVarId
  );

  const isCovid = currentDropDownIds.includes("covid");
  const isCovidVax = currentDropDownIds.includes("covid_vaccinations");
  const isCAWP = currentDropDownIds.includes("women_in_legislative_office");
  const isHIV = currentDropDownIds.includes("hiv_diagnoses");

  const reportWrapper = props.isSingleColumn
    ? styles.OneColumnReportWrapper
    : styles.TwoColumnReportWrapper;

  function getReport() {
    // Each report has a unique key based on its props so it will create a
    // new instance and reset its state when the provided props change.
    switch (props.madLib.id as MadLibId) {
      case "disparity":
        const dropdownOption = getPhraseValue(props.madLib, 1);
        return (
          <OneVariableReport
            key={dropdownOption}
            dropdownVarId={dropdownOption as DropdownVarId}
            fips={new Fips(getPhraseValue(props.madLib, 3))}
            updateFipsCallback={(fips: Fips) =>
              props.setMadLib(
                getMadLibWithUpdatedValue(props.madLib, 3, fips.code)
              )
            }
            isScrolledToTop={props.isScrolledToTop}
            reportStepHashIds={reportStepHashIds}
            setReportStepHashIds={setReportStepHashIds}
            headerScrollMargin={props.headerScrollMargin}
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
            isScrolledToTop={props.isScrolledToTop}
            reportStepHashIds={reportStepHashIds}
            setReportStepHashIds={setReportStepHashIds}
            headerScrollMargin={props.headerScrollMargin}
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
            isScrolledToTop={props.isScrolledToTop}
            reportStepHashIds={reportStepHashIds}
            setReportStepHashIds={setReportStepHashIds}
            headerScrollMargin={props.headerScrollMargin}
          />
        );
      default:
        return <p>Report not found</p>;
    }
  }

  return (
    <>
      <div className={reportWrapper}>
        <ShareButtons madLib={props.madLib} />
        {props.showLifeLineAlert && <LifelineAlert />}
        <DisclaimerAlert />
        {props.showIncarceratedChildrenAlert && false && (
          <IncarceratedChildrenLongAlert />
        )}

        {getReport()}
      </div>
      <div className={styles.MissingDataContainer}>
        <aside className={styles.MissingDataInfo}>
          {/* Display condition definition(s) based on the tracker madlib settings */}
          <div>
            {definedConditions.length > 0 && (
              <Box mb={5}>
                <h3
                  id="definitions-missing-data"
                  className={styles.FootnoteLargeHeading}
                >
                  Definitions:
                </h3>
                <LazyLoad offset={300} height={181} once>
                  <DefinitionsList variablesToDefine={metricConfigSubset} />
                </LazyLoad>
              </Box>
            )}
          </div>

          <Box mt={10}>
            <h3 className={styles.FootnoteLargeHeading}>
              What data are missing?
            </h3>
          </Box>

          <p>Unfortunately there are crucial data missing in our sources.</p>
          <h4>Missing and misidentified people</h4>
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
            with most data sources, and in almost all cases sex is recorded only
            as female, male, or other.
          </p>

          <h4>Missing population data</h4>
          <p>
            We primarily incorporate the U.S. Census Bureau's American Community
            Survey (ACS) 5-year estimates when presenting population
            information. However, certain data sets have required an alternate
            approach due to incompatible or missing data. Any alternate methods
            for the displayed topics on this page are outlined below.
          </p>
          <p>
            Population data for <b>Northern Mariana Islands</b>, <b>Guam</b>,{" "}
            <b>American Samoa</b>, and the <b>U.S. Virgin Islands</b> are not
            reported in the ACS five year estimates; in these territories for
            current and time-series based population figures back to 2016, we
            incorporate the 2020 Decennial Island Areas report. For time-series
            data from 2009-2015, we rely on the 2010 release of the Decennial
            report.
          </p>

          {isCovid && <MissingCovidData />}
          {isCovidVax && <MissingCovidVaccinationData />}
          {isCAWP && <MissingCAWPData />}
          {isHIV && <MissingHIVData />}

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
