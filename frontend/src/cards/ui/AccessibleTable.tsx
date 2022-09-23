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
import { Row } from "../../data/utils/DatasetTypes";
import styles from "./AccessibleTable.module.scss";

interface AccessibleTableProps {
  expanded: boolean;
  setExpanded: Function;
  expandBoxLabel: string;
  tableCaption: string;
  accessibleData: Row[];
  breakdownVar: BreakdownVar;
  metricConfig: MetricConfig;
}

export default function AccessibleTable(props: AccessibleTableProps) {
  const optionalAgesPrefix = props.breakdownVar === "age" ? "Ages " : "";

  return (
    <AnimateHeight
      duration={500}
      height={props.expanded ? "auto" : 47}
      onAnimationEnd={() => window.dispatchEvent(new Event("resize"))}
      className={styles.ListBox}
    >
      <div className={styles.CollapseButton}>
        <IconButton
          aria-label={props.expanded ? `hide ` : `show `}
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
        {!props.expanded ? "Expand" : "Collapse"} <b>{props.expandBoxLabel}</b>{" "}
        data table
      </div>

      {/* Don't render collapsed info, so keyboard nav will skip */}
      {props.expanded && (
        <>
          <TableContainer tabIndex={0}>
            <Table className={styles.A11yTable} size="small" stickyHeader>
              <caption>{props.tableCaption}</caption>
              <TableHead>
                <TableRow>
                  {Object.keys(props.accessibleData[0]).map((key, i) => {
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
                        <b>
                          {!isTimeCol &&
                            key !== "All" &&
                            !isUnknownPctCol &&
                            optionalAgesPrefix}
                          {key}
                          {!isTimeCol &&
                            !isUnknownPctCol &&
                            ` ${props.metricConfig.shortLabel}`}
                        </b>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>

              <TableBody>
                {props.accessibleData.map((row, i) => {
                  return (
                    <TableRow>
                      {Object.keys(row).map((key) => {
                        return (
                          <TableCell
                            style={{
                              whiteSpace: "normal",
                              wordWrap: "break-word",
                            }}
                          >
                            {row[key]}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </AnimateHeight>
  );
}
