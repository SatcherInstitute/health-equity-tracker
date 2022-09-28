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
import React, { useRef } from "react";
import AnimateHeight from "react-animate-height";
import { MetricConfig } from "../../data/config/MetricConfig";
import { BreakdownVar } from "../../data/query/Breakdowns";
import {
  DemographicGroup,
  TIME_PERIOD_LABEL,
} from "../../data/utils/Constants";
import { makeA11yTableData } from "../../data/utils/DatasetTimeUtils";
import { Row } from "../../data/utils/DatasetTypes";
import { DATA_TAB_LINK } from "../../utils/internalRoutes";
import styles from "./AltTableView.module.scss";

interface AltTableViewProps {
  expanded: boolean;
  setExpanded: Function;
  expandBoxLabel: string;
  tableCaption: string;
  knownsData: Row[];
  unknownsData: Row[];
  breakdownVar: BreakdownVar;
  knownMetricConfig: MetricConfig;
  unknownMetricConfig: MetricConfig;
  selectedGroups: DemographicGroup[];
}

export default function AltTableView(props: AltTableViewProps) {
  const tableRef = useRef(null);
  const linkRef = useRef(null);

  const optionalAgesPrefix = props.breakdownVar === "age" ? "Ages " : "";

  const accessibleData = makeA11yTableData(
    props.knownsData,
    props.unknownsData,
    props.breakdownVar,
    props.knownMetricConfig,
    props.unknownMetricConfig,
    props.selectedGroups
  );

  const firstTimePeriod = accessibleData[0][TIME_PERIOD_LABEL];
  const lastTimePeriod =
    accessibleData[accessibleData.length - 1][TIME_PERIOD_LABEL];

  return (
    <AnimateHeight
      duration={500}
      height={props.expanded ? "auto" : 47}
      onAnimationEnd={() => window.dispatchEvent(new Event("resize"))}
      className={styles.AltTableExpanderBox}
    >
      <div className={styles.CollapseButton}>
        <IconButton
          aria-label={`${
            !props.expanded ? "Expand" : "Collapse"
          } table view of ${props.expandBoxLabel} data`}
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
          props.expanded ? styles.AltTableTitleExpanded : styles.AltTableTitle
        }
      >
        {!props.expanded ? "Expand" : "Collapse"} table view of{" "}
        <b>{props.expandBoxLabel}</b> data
      </div>

      {/* Don't render collapsed info, so keyboard nav will skip */}
      {props.expanded && (
        <>
          <TableContainer className={styles.AltTableContainer}>
            <Table
              tabIndex={0}
              ref={tableRef}
              className={styles.AltTable}
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
                        key={key}
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
                    <TableRow key={row[TIME_PERIOD_LABEL]}>
                      {keys.map((key, j) => {
                        const isTimePeriod = key === TIME_PERIOD_LABEL;
                        const isLastCol = j === keys.length - 1;
                        const appendPct =
                          isLastCol ||
                          props.knownMetricConfig.type === "pct_share";
                        return (
                          <TableCell
                            key={key}
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
            <a href={DATA_TAB_LINK} ref={linkRef}>
              Downloads page.
            </a>
          </p>
        </>
      )}
    </AnimateHeight>
  );
}
