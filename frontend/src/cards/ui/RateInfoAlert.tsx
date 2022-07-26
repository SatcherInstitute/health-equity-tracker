import { CardContent, Divider } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React from "react";
import {
  formatFieldValue,
  MetricConfig,
  VariableConfig,
} from "../../data/config/MetricConfig";
import {
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../../data/query/Breakdowns";
import { MetricQueryResponse } from "../../data/query/MetricQuery";
import { DemographicGroup } from "../../data/utils/Constants";
import { Fips } from "../../data/utils/Fips";
import { MultiMapLink } from "./MultiMapLink";
import styles from "../Card.module.scss";

interface RateInfoAlertProps {
  overallQueryResponse: MetricQueryResponse;
  currentBreakdown: BreakdownVar;
  activeBreakdownFilter: DemographicGroup;
  metricConfig: MetricConfig;
  jumpToDefinitions: Function;
  fips: Fips;
  setSmallMultiplesDialogOpen: Function;
  variableConfig: VariableConfig;
}

export function RateInfoAlert(props: RateInfoAlertProps) {
  // If possible, calculate the total for the selected demographic group and dynamically generate the rest of the phrase
  //     {/* TODO: The "all" display in this info box should appear even if the only data available is the current level total */}

  function generateDemographicTotalPhrase() {
    const options = props.overallQueryResponse.data.find(
      (row) => row[props.currentBreakdown] === props.activeBreakdownFilter
    );

    return options ? (
      <>
        <b>
          {formatFieldValue(
            /* metricType: MetricType, */ props.metricConfig.type,
            /* value: any, */ options[props.metricConfig.metricId],
            /* omitPctSymbol: boolean = false */ true
          )}
        </b>{" "}
        {/*} HYPERLINKED TO BOTTOM DEFINITION {condition} cases per 100k  */}
        <a
          href="#definitionsList"
          onClick={(e) => {
            e.preventDefault();
            props.jumpToDefinitions();
          }}
          className={styles.ConditionDefinitionLink}
        >
          {props.metricConfig.shortLabel}
        </a>
        {/*} for  */}
        {props.activeBreakdownFilter !== "All" && " for"}
        {/*} [ ages 30-39] */}
        {BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.currentBreakdown] ===
          "age" &&
          props.activeBreakdownFilter !== "All" &&
          ` ages ${props.activeBreakdownFilter}`}
        {/*} [Asian (non Hispanic) individuals] */}
        {BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.currentBreakdown] !==
          "age" &&
          props.activeBreakdownFilter !== "All" &&
          ` ${props.activeBreakdownFilter} individuals`}
        {" in  "}
        {/*} Georgia */}
        {props.fips.getSentenceDisplayName()}
        {". "}
      </>
    ) : (
      ""
    );
  }

  return (
    <>
      <Divider />
      <CardContent>
        <Alert severity="info" role="note">
          {generateDemographicTotalPhrase()}
          {/* Compare across XYZ for all variables except vaccinated at county level */}
          <MultiMapLink
            setSmallMultiplesDialogOpen={props.setSmallMultiplesDialogOpen}
            currentBreakdown={props.currentBreakdown}
            currentVariable={props.variableConfig.variableFullDisplayName}
          />
        </Alert>
      </CardContent>
    </>
  );
}
