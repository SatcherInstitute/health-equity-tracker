import React from "react";
import { Grid } from "@material-ui/core";
import { DropdownVarId } from "../utils/MadLibs";
import { Fips } from "../data/utils/Fips";
import { PopulationCard } from "../cards/PopulationCard";
import { VariableDisparityReport } from "./VariableDisparityReport";

function TwoVariableReport(props: {
  key: string;
  dropdownVarId1: DropdownVarId;
  dropdownVarId2: DropdownVarId;
  fips: Fips;
  updateFipsCallback: Function;
  hidePopulationCard?: boolean;
}) {
  return (
    <Grid container spacing={1} alignItems="flex-start">
      <Grid item xs={12}>
        <PopulationCard fips={props.fips} />
      </Grid>
      <Grid item xs={6}>
        <VariableDisparityReport
          key={props.dropdownVarId1 + props.fips.code}
          dropdownVarId={props.dropdownVarId1}
          fips={props.fips}
          updateFipsCallback={(fips: Fips) => props.updateFipsCallback(fips)}
          vertical={true}
          hidePopulationCard={true}
        />
      </Grid>
      <Grid item xs={6}>
        <VariableDisparityReport
          key={props.dropdownVarId2 + props.fips.code}
          dropdownVarId={props.dropdownVarId2}
          fips={props.fips}
          updateFipsCallback={(fips: Fips) => props.updateFipsCallback(fips)}
          vertical={true}
          hidePopulationCard={true}
        />
      </Grid>
    </Grid>
  );
}

export default TwoVariableReport;
