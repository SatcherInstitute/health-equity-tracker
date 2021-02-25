import React, { useState, useEffect } from "react";
import { Vega } from "react-vega";
import { useResponsiveWidth } from "../utils/useResponsiveWidth";
import { MetricConfig } from "../data/config/MetricConfig";
import { FieldRange } from "../data/utils/DatasetTypes";
import { ScaleType } from "./ChoroplethMap";

type NumberFormat = "raw" | "percentage";

const COLOR_SCALE = "COLOR_SCALE";

const LEGEND_DATASET = "LEGEND_DATASET";
// TODO - consider moving standardized column names, like fips, to variables shared between here and VariableProvider

export interface Legend {
  legendData?: Record<string, any>[]; // Dataset for which to calculate legend
  metric: MetricConfig;
  legendTitle: string;
  numberFormat?: NumberFormat;
  hideLegend?: boolean;
  fieldRange?: FieldRange;
  scaleType: ScaleType;
}

export function Legend(props: Legend) {
  const [ref, width] = useResponsiveWidth(
    100 /* default width during intialization */
  );

  // Initial spec state is set in useEffect
  const [spec, setSpec] = useState({});

  useEffect(() => {
    /* SET UP LEGEND */
    // TODO - Legends should be scaled exactly the same the across compared charts. Looks misleading otherwise.
    let legendList = [];
    let legend: any = {
      fill: COLOR_SCALE,
      direction: "horizontal",
      orient: "bottom-left",
      title: props.legendTitle,
      font: "monospace",
      labelFont: "monospace",
      offset: 10,
    };
    if (props.numberFormat === "percentage") {
      legend["format"] = "0.1%";
    }
    if (!props.hideLegend) {
      legendList.push(legend);
    }

    let colorScale: any = {
      name: COLOR_SCALE,
      type: props.scaleType,
      domain: { data: LEGEND_DATASET, field: props.metric.metricId },
      range: { scheme: "yellowgreenblue", count: 7 },
    };
    if (props.fieldRange) {
      colorScale["domainMax"] = props.fieldRange.max;
      colorScale["domainMin"] = props.fieldRange.min;
    }

    setSpec({
      $schema: "https://vega.github.io/schema/vega/v5.json",
      description: "Legend",
      data: [
        {
          name: LEGEND_DATASET,
          values: props.legendData,
        },
      ],
      scales: [colorScale],
      legends: legendList,
    });
  }, [
    width,
    props.metric,
    props.legendTitle,
    props.numberFormat,
    props.scaleType,
    props.hideLegend,
    props.fieldRange,
    props.legendData,
  ]);

  return (
    <div
      ref={ref}
      style={{
        width: "80%",
        margin: "auto",
      }}
    >
      <Vega spec={spec} width={width} actions={false} />
    </div>
  );
}
