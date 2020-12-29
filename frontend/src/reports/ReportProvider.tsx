import React, { useState } from "react";
import { Grid } from "@material-ui/core";
import ChartDumpReport from "./ChartDumpReport";
import VariableDisparityReport from "./VariableDisparityReport";
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
import { linkToMadLib } from "../utils/urlutils";
import Button from "@material-ui/core/Button";
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
      case "dump":
        return <ChartDumpReport />;
      default:
        return <p>Report not found</p>;
    }
  }

  return (
    <>
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
            {linkToMadLib(props.madLib.id, props.madLib.activeSelections, true)}
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
    </>
  );
}

export default ReportProvider;
