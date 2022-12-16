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
import { WHAT_DATA_ARE_MISSING_ID } from "../../utils/internalRoutes";

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
  highestValues: Row[];
  lowestValues: Row[];
  // items in highest/lowest list that should receive qualifiers
  qualifierItems?: string[];
  // message to display under a list with qualifiers
  qualifierMessage?: string;
  // optional suffix to alter the selected metric (used for CAWP "identifying as Black women")
  selectedRaceSuffix?: string;
}

/*
   Collapsible box showing lists of geographies with the highest and lowest rates
*/
export function HighestLowestList(props: HighestLowestListProps) {
  const highestValuesAreTied =
    props.highestValues?.[0] === props.highestValues?.[1];
  const lowestValuesAreTied =
    props.lowestValues?.[0] === props.lowestValues?.[1];

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
              <ExtremeList
                whichExtreme="Highest"
                values={props.highestValues}
                isTied={highestValuesAreTied}
                metricConfig={props.metricConfig}
                qualifierMessage={props.qualifierMessage}
                qualifierItems={props.qualifierItems}
              />

              <ExtremeList
                whichExtreme="Lowest"
                values={props.lowestValues}
                isTied={lowestValuesAreTied}
                metricConfig={props.metricConfig}
                qualifierMessage={props.qualifierMessage}
                qualifierItems={props.qualifierItems}
              />
            </Grid>
          </div>

          <p>
            All rates are reported as:{" "}
            <b>
              {props.metricConfig.chartTitleLines.join(" ")}
              {props.selectedRaceSuffix}
            </b>
            .
          </p>
          <p>
            Consider the possible impact of{" "}
            <a href={`#${WHAT_DATA_ARE_MISSING_ID}`}>data reporting gaps</a>{" "}
            when interpreting the highest and lowest rates.
          </p>
        </>
      )}
    </AnimateHeight>
  );
}

export interface ExtremeListProps {
  whichExtreme: "Highest" | "Lowest";
  values: Row[];
  isTied: boolean;
  metricConfig: MetricConfig;
  qualifierItems?: string[];
  qualifierMessage?: string;
}

function ExtremeList(props: ExtremeListProps) {
  const { type: metricType, metricId } = props.metricConfig;
  const tiedAtVal = formatFieldValue(metricType, props.values?.[0][metricId]);

  return (
    <Grid item xs={12} sm={6}>
      <h4>
        {props.isTied
          ? `${props.whichExtreme} (${tiedAtVal}):`
          : `${props.values.length} ${props.whichExtreme.toLowerCase()}:`}
      </h4>

      <ul className={styles.ExtremeList}>
        {/* TIED */}
        {props.isTied && (
          <li>
            <>
              {props.values.map((row, i) => {
                let placeName = row["fips_name"];
                if (props.qualifierItems?.includes(placeName)) {
                  placeName += ` ${props.qualifierMessage}`;
                }

                return (
                  <span key={row["fips_name"]}>
                    {placeName}
                    {i < props.values.length - 1 ? ", " : ""}
                  </span>
                );
              })}
            </>
          </li>
        )}

        {/* NORMAL */}
        {!props.isTied &&
          props.values.map((row) => {
            let placeName = row["fips_name"];
            if (props.qualifierItems?.includes(placeName)) {
              placeName += ` ${props.qualifierMessage}`;
            }

            return (
              <li key={row["fips_name"]}>
                {placeName}: {formatFieldValue(metricType, row[metricId])}{" "}
                <span className={styles.Unit}>
                  {metricType === "per100k" ? "per 100k" : ""}
                </span>
              </li>
            );
          })}
      </ul>
    </Grid>
  );
}
