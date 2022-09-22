import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import React from "react";
import { MetricConfig } from "../../data/config/MetricConfig";
import { BreakdownVar } from "../../data/query/Breakdowns";
import { Row } from "../../data/utils/DatasetTypes";
import styles from "./AccessibleTable.module.scss";

interface AccessibleTableProps {
  tableCaption: string;
  accessibleData: Row[];
  breakdownVar: BreakdownVar;
  metricConfig: MetricConfig;
}

export default function AccessibleTable(props: AccessibleTableProps) {
  const optionalAgesPrefix = props.breakdownVar === "age" ? "Ages " : "";

  return (
    <TableContainer component={Paper} tabIndex={0}>
      <Table className={styles.A11yTable} size="small">
        <caption>{props.tableCaption}</caption>
        <TableHead>
          <TableRow>
            {Object.keys(props.accessibleData[0]).map((key, i) => {
              if (i === 0)
                return (
                  <TableCell
                    style={{
                      whiteSpace: "normal",
                      wordWrap: "break-word",
                    }}
                  >
                    {key}
                  </TableCell>
                );

              // don't show "Ages " for the All group
              const prefix = key === "All" ? "" : optionalAgesPrefix;
              return (
                <TableCell
                  style={{
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                  }}
                >
                  {prefix}
                  {key}
                  {` ${props.metricConfig.shortLabel}`}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>

        <TableBody>
          {props.accessibleData.map((row) => {
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
  );

  // return <table className={styles.A11yTable} tabIndex={0}>
  // 	<caption>{props.tableCaption}</caption>
  // 	{/* header row with keys */}
  // 	<thead>
  // 		<tr>
  // 			{Object.keys(props.accessibleData[0]).map((key, i) => {

  // 				if (i === 0) return <th>{key}</th>

  // 				// don't show "Ages " for the All group
  // 				const prefix = key === "All" ? "" : optionalAgesPrefix
  // 				return <th>{prefix}{key}{` ${props.metricConfig.shortLabel}`}</th>
  // 			})}
  // 		</tr>
  // 	</thead>

  // 	{/* row with values */}
  // 	<tbody>
  // 		{props.accessibleData.map((row) => {
  // 			return <tr>
  // 				{Object.keys(row).map((key) => {
  // 					return <td>{row[key]}</td>
  // 				})}
  // 			</tr>
  // 		})}
  // 	</tbody>
  // </table>
}
