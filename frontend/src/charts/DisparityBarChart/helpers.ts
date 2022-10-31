import { useMediaQuery } from "@material-ui/core";
import { MetricId } from "../../data/config/MetricConfig";
import { BreakdownVar } from "../../data/query/Breakdowns";
import { BAR_PADDING, LEGEND_COLORS } from "./constants";
import { getTitleProps } from "./types";

function getTitle(props: getTitleProps) {
  return {
    text: props.chartTitle || "",
    subtitle: " ",
    encode: {
      title: {
        enter: {
          fontSize: { value: props.fontSize },
          font: { value: "Inter, sans-serif" },
        },
      },
    },
  };
}

function getSignals(stacked?: boolean) {
  return [
    {
      name: "y_step",
      value: stacked ? 40 : 12 * 5,
    },
    {
      name: "height",
      update: "bandspace(domain('y').length, 0.1, 0.05) * y_step",
    },
  ];
}

function Scales(
  measureWithLargerDomain: MetricId,
  breakdownVar: BreakdownVar,
  LEGEND_DOMAINS: any
) {
  const pageIsTiny = useMediaQuery("(max-width:400px)");

  return [
    {
      name: "x",
      type: "linear",
      domain: { data: "DATASET", field: measureWithLargerDomain },
      range: [0, { signal: "width" }],
      nice: !pageIsTiny, //on desktop, extend x-axis to a "nice" value
      zero: true,
    },
    {
      name: "y",
      type: "band",
      domain: {
        data: "DATASET",
        field: breakdownVar,
      },
      range: { step: { signal: "y_step" } },
      paddingInner: BAR_PADDING,
    },
    {
      name: "variables",
      type: "ordinal",
      domain: LEGEND_DOMAINS,
      range: LEGEND_COLORS,
    },
  ];
}

export { getTitle, getSignals, Scales };
