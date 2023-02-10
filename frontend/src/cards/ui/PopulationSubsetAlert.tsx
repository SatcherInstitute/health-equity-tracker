import { CardContent } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React from "react";
import { HashLink } from "react-router-hash-link";
import { METHODOLOGY_TAB_LINK } from "../../utils/internalRoutes";

export default function PopulationSubsetAlert() {
  return (
    <CardContent>
      <Alert severity="info" role="note">
        All values presented for <b>HIV diagnoses</b> are calculated on the
        population of individuals ages 13 and older. Read more on our{" "}
        <HashLink to={METHODOLOGY_TAB_LINK}>methodology.</HashLink>
      </Alert>
    </CardContent>
  );
}
