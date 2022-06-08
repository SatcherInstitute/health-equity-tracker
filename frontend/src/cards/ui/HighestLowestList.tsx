import React from "react";
import styles from "./HighestLowestList.module.scss";
import AnimateHeight from "react-animate-height";
import { Grid } from "@material-ui/core";
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
  // to scroll user to bottom text box about Missing Data
  jumpToData: Function;
  // items in highest/lowest list that should receive qualifiers
  qualifierItems?: string[];
  // message to display under a list with qualifiers
  qualifierMessage?: string;
}

/*
   Collapsible box showing lists of geographies with the highest and lowest rates
*/
export function HighestLowestList(props: HighestLowestListProps) {
  function addqualifier(fipsName: string) {
    return props.qualifierItems?.includes(fipsName)
      ? " (combined prison & jail)"
      : "";
  }

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
              ? `hide lists of ${props.fipsTypePluralDisplayName} with highest and lowest rates `
              : `show lists of ${props.fipsTypePluralDisplayName} with highest and lowest rates`
          }
          onClick={() => props.setListExpanded(!props.listExpanded)}
          color="primary"
        >
          {props.listExpanded ? <ArrowDropUp /> : <ArrowDropDown />}
        </IconButton>
      </div>
      <div
        onClick={() => props.setListExpanded(!props.listExpanded)}
        aria-hidden={true}
        className={
          props.listExpanded ? styles.ListBoxTitleExpanded : styles.ListBoxTitle
        }
      >
        {!props.listExpanded ? "See " : "Viewing "}
        <span className={styles.HideOnMobile}>
          the {props.fipsTypePluralDisplayName} with the{" "}
        </span>
        <b>highest</b> and <b>lowest</b> rates.
      </div>

      {/* Don't render collapsed info, so keyboard nav will skip */}
      {props.listExpanded && (
        <>
          <div className={styles.ListBoxLists}>
            <Grid container justifyContent="space-around">
              <Grid item xs={12} sm={6}>
                <h4>{props.highestRatesList.length} Highest Rates</h4>
                <ul>
                  {props.highestRatesList.map((row) => {
                    return (
                      <li key={row["fips_name"]}>
                        {row["fips_name"]}
                        {addqualifier(row["fips_name"])}:{" "}
                        {formatFieldValue(
                          props.metricConfig.type,
                          row[props.metricConfig.metricId]
                        )}{" "}
                        <span className={styles.Unit}>
                          {props.metricConfig.type === "per100k"
                            ? "per 100k"
                            : ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </Grid>
              <Grid item xs={12} sm={6}>
                <h4>{props.lowestRatesList.length} Lowest Rates</h4>
                <ul>
                  {props.lowestRatesList.map((row) => {
                    return (
                      <li key={row["fips_name"]}>
                        {row["fips_name"]}
                        {addqualifier(row["fips_name"])}:{" "}
                        {formatFieldValue(
                          props.metricConfig.type,
                          row[props.metricConfig.metricId]
                        )}{" "}
                        <span className={styles.Unit}>
                          {props.metricConfig.type === "per100k"
                            ? "per 100k"
                            : ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </Grid>
            </Grid>
          </div>

          <p>
            All rates are reported as:{" "}
            <b>{props.metricConfig.fullCardTitleName}</b>.
          </p>
          <p>
            Consider the possible impact of{" "}
            <a
              href="#missingDataInfo"
              onClick={(e) => {
                e.preventDefault();
                props.jumpToData();
              }}
            >
              data reporting gaps
            </a>{" "}
            when interpreting the highest and lowest rates.
          </p>
        </>
      )}
    </AnimateHeight>
  );
}
