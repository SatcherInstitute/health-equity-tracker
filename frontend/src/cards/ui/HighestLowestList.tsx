import React from "react";
import styles from "./HighestLowestList.module.scss";
import AnimateHeight from "react-animate-height";
import { Grid } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import ArrowDropUp from "@material-ui/icons/ArrowDropUp";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";
import { IconButton } from "@material-ui/core";
import {
  MetricConfig,
  VariableConfig,
  formatFieldValue,
} from "../../data/config/MetricConfig";
import { Row } from "../../data/utils/DatasetTypes";

export interface HighestLowestListProps {
  // MetricConfig for data
  metricConfig: MetricConfig;
  // VariableConfig for data
  variableConfig: VariableConfig;
  // Display name for geo type in as "see the ___ with the highest rates"
  fipsTypePluralDisplayName: string;
  // Whether or not list is expanded
  listExpanded: boolean;
  // Expand or collapse the list
  setListExpanded: (listExpanded: boolean) => void;
  // List of rows with highest rates
  highestRatesList: Row[];
  // List of rows with lowest rates
  lowestRatesList: Row[];
}

/*
   Collapsable box showing lists of geographies with the highest and lowest rates
*/
export function HighestLowestList(props: HighestLowestListProps) {
  return (
    <AnimateHeight
      duration={500}
      height={props.listExpanded ? "auto" : 47}
      onAnimationEnd={() => window.dispatchEvent(new Event("resize"))}
      className={styles.ListBox}
    >
      <div className={styles.CollapseButton}>
        <IconButton
          aria-label={
            props.listExpanded
              ? "hide highest and lowest rates"
              : "show highest and lowest rates"
          }
          onClick={() => props.setListExpanded(!props.listExpanded)}
          color="primary"
        >
          {props.listExpanded ? <ArrowDropUp /> : <ArrowDropDown />}
        </IconButton>
      </div>
      <div
        className={
          props.listExpanded ? styles.ListBoxTitleExpanded : styles.ListBoxTitle
        }
      >
        See the {props.fipsTypePluralDisplayName} with the <b>highest</b> and{" "}
        <b>lowest</b> rates
      </div>
      <div className={styles.ListBoxLists}>
        <Grid container justify="space-around">
          <Grid item>
            <h4>{props.highestRatesList.length} Highest Rates</h4>
            <ul>
              {props.highestRatesList.map((row) => {
                return (
                  <li>
                    {row["fips_name"]} -{" "}
                    {formatFieldValue(
                      props.metricConfig.type,
                      row[props.metricConfig.metricId]
                    )}
                  </li>
                );
              })}
            </ul>
          </Grid>
          <Grid item>
            <h4>{props.lowestRatesList.length} Lowest Rates</h4>
            <ul>
              {props.lowestRatesList.map((row) => {
                return (
                  <li>
                    {row["fips_name"]} -{" "}
                    {formatFieldValue(
                      props.metricConfig.type,
                      row[props.metricConfig.metricId]
                    )}
                  </li>
                );
              })}
            </ul>
          </Grid>
        </Grid>
      </div>
      <p>All rates are reported as: {props.metricConfig.fullCardTitleName}</p>
      <p>
        Consider the possible impact of
        <Button
          onClick={() =>
            document.getElementById("missingDataInfo")?.scrollIntoView()
          }
          className={styles.LinkButton}
        >
          data reporting gaps
        </Button>
        when interpreting the highest and lowest rates.
      </p>
    </AnimateHeight>
  );
}
