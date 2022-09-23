import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { ArrowDropDown, ArrowDropUp } from "@material-ui/icons";
import React from "react";
import AnimateHeight from "react-animate-height";
import { MetricConfig } from "../../data/config/MetricConfig";
import { BreakdownVar } from "../../data/query/Breakdowns";
import { TIME_PERIOD_LABEL } from "../../data/utils/Constants";
import { makeA11yTableData } from "../../data/utils/DatasetTimeUtils";
import { Row } from "../../data/utils/DatasetTypes";
import { DATA_TAB_LINK } from "../../utils/internalRoutes";
import styles from "./AccessibleTable.module.scss";

interface AccessibleTableProps {
  expanded: boolean;
  setExpanded: Function;
  expandBoxLabel: string;
  tableCaption: string;
  knownsData: Row[];
  unknownsData: Row[];
  breakdownVar: BreakdownVar;
  knownMetricConfig: MetricConfig;
  unknownMetricConfig: MetricConfig;
}

export default function AccessibleTable(props: AccessibleTableProps) {
  const optionalAgesPrefix = props.breakdownVar === "age" ? "Ages " : "";

  const accessibleData = makeA11yTableData(
    props.knownsData,
    props.unknownsData,
    props.breakdownVar,
    props.knownMetricConfig,
    props.unknownMetricConfig
  );

  const firstTimePeriod = accessibleData[0][TIME_PERIOD_LABEL];
  const lastTimePeriod =
    accessibleData[accessibleData.length - 1][TIME_PERIOD_LABEL];

  return (
    <AnimateHeight
      duration={500}
      height={props.expanded ? "auto" : 47}
      onAnimationEnd={() => window.dispatchEvent(new Event("resize"))}
      className={styles.ListBox}
    >
      <div className={styles.CollapseButton}>
        <IconButton
          aria-label={`${
            !props.expanded ? "Expand" : "Collapse"
          } accessible table view of ${props.expandBoxLabel} data`}
          aria-expanded={props.expanded}
          onClick={() => props.setExpanded(!props.expanded)}
          color="primary"
        >
          {props.expanded ? <ArrowDropUp /> : <ArrowDropDown />}
        </IconButton>
      </div>
      <div
        onClick={() => props.setExpanded(!props.expanded)}
        aria-hidden={true}
        className={
          props.expanded ? styles.ListBoxTitleExpanded : styles.ListBoxTitle
        }
      >
        {!props.expanded ? "Expand" : "Collapse"} table view of{" "}
        <b>{props.expandBoxLabel}</b> data
      </div>

      {/* Don't render collapsed info, so keyboard nav will skip */}
      {props.expanded && (
        <>
          <TableContainer className={styles.A11yTableContainer}>
            <Table
              tabIndex={0}
              className={styles.A11yTable}
              size="small"
              stickyHeader
            >
              <caption>
                <b>{props.tableCaption}</b>
              </caption>
              <TableHead>
                <TableRow>
                  {Object.keys(accessibleData[0]).map((key, i) => {
                    const isTimeCol = key === TIME_PERIOD_LABEL;
                    const isUnknownPctCol = key.includes(
                      "Percent with unknown "
                    );

                    return (
                      <TableCell
                        style={{
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                        }}
                      >
                        {!isTimeCol &&
                          key !== "All" &&
                          !isUnknownPctCol &&
                          optionalAgesPrefix}
                        {key.replaceAll("_", " ")}
                        {!isTimeCol &&
                          !isUnknownPctCol &&
                          ` ${props.knownMetricConfig.shortLabel}`}
                        {isTimeCol &&
                          ` (${firstTimePeriod} - ${lastTimePeriod})`}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>

              <TableBody>
                {accessibleData.map((row, i) => {
                  const keys = Object.keys(row);
                  return (
                    <TableRow>
                      {keys.map((key, j) => {
                        const isTimePeriod = key === TIME_PERIOD_LABEL;
                        const isLastCol = j === keys.length - 1;
                        const appendPct =
                          isLastCol ||
                          props.knownMetricConfig.type === "pct_share";
                        return (
                          <TableCell
                            style={{
                              whiteSpace: "normal",
                              wordWrap: "break-word",
                            }}
                          >
                            {row[key]}
                            {!isTimePeriod && appendPct && "%"}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <p>
            View and download full .csv files on the{" "}
            <a href={DATA_TAB_LINK}>Downloads page.</a>
          </p>
        </>
      )}
    </AnimateHeight>
  );
}
