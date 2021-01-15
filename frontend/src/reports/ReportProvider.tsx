import React, { useState } from "react";
import { Grid } from "@material-ui/core";
import { VariableDisparityReport } from "./VariableDisparityReport";
import TwoVariableReport from "./TwoVariableReport";
import {
  MadLib,
  getMadLibWithUpdatedValue,
  DropdownVarId,
  MadLibId,
} from "../utils/madlib/MadLibs";
import { Fips } from "../utils/madlib/Fips";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { getMadLibPhraseText } from "../utils/madlib/MadLibs";
import { linkToMadLib, DATA_CATALOG_PAGE_LINK } from "../utils/urlutils";
import Button from "@material-ui/core/Button";
import ArrowForward from "@material-ui/icons/ArrowForward";
import ShareIcon from "@material-ui/icons/Share";
import styles from "./Report.module.scss";

function getPhraseValue(madLib: MadLib, segmentIndex: number): string {
  const segment = madLib.phrase[segmentIndex];
  return typeof segment === "string"
    ? segment
    : madLib.activeSelections[segmentIndex];
}

function ReportProvider(props: { madLib: MadLib; setMadLib: Function }) {
  const [shareModalOpen, setShareModalOpen] = useState(false);

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
          <Grid container spacing={1} alignItems="flex-start">
            <Grid item xs={6}>
              <VariableDisparityReport
                key={compareDisparityVariable + fipsCode1}
                dropdownVarId={compareDisparityVariable as DropdownVarId}
                fips={new Fips(fipsCode1)}
                updateFipsCallback={(fips: Fips) =>
                  props.setMadLib(
                    getMadLibWithUpdatedValue(props.madLib, 3, fips.code)
                  )
                }
                vertical={true}
              />
            </Grid>
            <Grid item xs={6}>
              <VariableDisparityReport
                key={compareDisparityVariable + fipsCode2}
                dropdownVarId={compareDisparityVariable as DropdownVarId}
                fips={new Fips(fipsCode2)}
                updateFipsCallback={(fips: Fips) =>
                  props.setMadLib(
                    getMadLibWithUpdatedValue(props.madLib, 5, fips.code)
                  )
                }
                vertical={true}
              />
            </Grid>
          </Grid>
        );
      case "comparevars":
        const compareDisparityVariable1 = getPhraseValue(props.madLib, 1);
        const compareDisparityVariable2 = getPhraseValue(props.madLib, 3);
        const fipsCode = getPhraseValue(props.madLib, 5);
        return (
          <TwoVariableReport
            key={
              compareDisparityVariable1 + +compareDisparityVariable2 + fipsCode
            }
            dropdownVarId1={compareDisparityVariable1 as DropdownVarId}
            dropdownVarId2={compareDisparityVariable2 as DropdownVarId}
            fips={new Fips(fipsCode)}
            updateFipsCallback={(fips: Fips) =>
              props.setMadLib(
                getMadLibWithUpdatedValue(props.madLib, 5, fips.code)
              )
            }
          />
        );
      default:
        return <p>Report not found</p>;
    }
  }

  return (
    <>
      <div className={styles.ReportWrapper}>
        <Dialog
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Link to this Report</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {getMadLibPhraseText(props.madLib)}
            </DialogContentText>
            <DialogContentText id="alert-dialog-description">
              {linkToMadLib(
                props.madLib.id,
                props.madLib.activeSelections,
                true
              )}
            </DialogContentText>
          </DialogContent>
        </Dialog>
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
        {getReport()}
      </div>
      {/* TODO- could we extract the names of datasets from the Fake Metdata */}
      <div className={styles.MissingDataInfo}>
        <h1>What Data Are Missing?</h1>
        <p>
          In this tracker, we are using <a href="/">COVID Tracking Project</a>,{" "}
          <a href="/">CDC Public Datasets</a>, and{" "}
          <a href="/">U.S. Census Bureau data</a>. Some soures are more
          “real-time” like case data, but other important data, such as
          information around social determinants of health can lag weeks to
          years. For the moment, this is our best representation of how the
          country is doing based on publically available information.
        </p>
        <p>
          Unfortunately, with these publically available data sets, there are
          crucial pieces missing, including but not limited to: comprehensive
          city-, census tract-, and county-level data; comprehensive race and
          ethnicity breakdowns; comprehensive gender and age breakdowns by
          county, etc.
        </p>
        <h3>Known limitations in the data</h3>
        <ul>
          <li>
            To protect the privacy of affected individuals, COVID-19 data may be
            hidden in counties with smaller numbers of COVID-19 cases,
            hospitalizations and deaths.
          </li>
          <li>
            Racial and ethnic categories are often at the discretion of
            healthcare professionals and may not be accurate.
          </li>
          <li>
            Specific racial and ethnic categories (e.g. “Native Hawaiian,”
            “Alaska Native”) differ by source and can be inappropriately
            obscured by broader categories (e.g. “Other,” “Asian”).
          </li>
          <li>
            National statistics are aggregations of state-wide data. If state
            data is not available, these aggregations may be incomplete and
            potentially skewed.
          </li>
          <li>
            We typically refresh our data sources with newly available data
            within a few days. Seeking the latest information? Please navigate
            to the data sources directly.
          </li>
        </ul>
        <a href={DATA_CATALOG_PAGE_LINK}>
          <Button color="primary" endIcon={<ArrowForward />}>
            See Data Sources
          </Button>
        </a>
      </div>
    </>
  );
}

export default ReportProvider;
