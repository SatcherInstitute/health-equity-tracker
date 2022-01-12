import React from "react";
import { MetricConfig } from "../data/config/MetricConfig";
import { Row } from "../data/utils/DatasetTypes";
import { Fips } from "../data/utils/Fips";
import styles from "./Chart.module.scss";

interface A11yTableProps {
  data: Row[];
  caption: string;
  currentMetric: MetricConfig;
  fips: Fips;
}

export default function A11yTable(props: A11yTableProps) {
  // meaningful column name for FIPS values (eg counties in california)
  let fipsColumnName = props.fips.isCounty()
    ? "Selected County"
    : props.fips.getPluralChildFipsTypeDisplayName();
  if (!props.fips.isUsa() && !props.fips.isCounty())
    fipsColumnName += ` in ${props.fips.getDisplayName()}`;

  return (
    <details className={styles.srOnly}>
      <summary>Data table used for this map</summary>

      <table>
        <caption>{props.caption}</caption>

        <thead>
          <tr>
            <th>{fipsColumnName}</th>
            <th>{props.currentMetric.shortVegaLabel}</th>
          </tr>
        </thead>
        <tbody>
          {props.data.map((row) => (
            <tr key={row.fips}>
              <td>{row.fips_name}</td>
              <td>{row[props.currentMetric.metricId]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
