import { CardContent } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React from "react";
import { HashLink } from "react-router-hash-link";
import { VariableId } from "../../data/config/MetricConfig";
import { METHODOLOGY_TAB_LINK } from "../../utils/internalRoutes";

interface PopulationSubsetAlertProps {
  variableId: VariableId;
}

export default function PopulationSubsetAlert({
  variableId,
}: PopulationSubsetAlertProps) {
  let variable, ageGroup;

  if (variableId === "hiv_deaths") {
    variable = "HIV deaths";
    ageGroup = "ages 13 and older";
  }
  if (variableId === "hiv_diagnoses") {
    variable = "HIV diagnoses";
    ageGroup = " ages 13 and older";
  }
  if (variableId === "hiv_prep") {
    variable = "PrEP coverage";
    ageGroup = "eligible for PrEP, ages 16 and older";
  }

  return (
    <CardContent>
      <Alert severity="info" role="note">
        All values presented for <b>{variable}</b> are calculated on the
        population of individuals {ageGroup}. Read more on our{" "}
        <HashLink to={METHODOLOGY_TAB_LINK}>methodology.</HashLink>
      </Alert>
    </CardContent>
  );
}
