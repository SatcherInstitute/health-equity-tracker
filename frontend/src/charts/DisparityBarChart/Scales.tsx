import { useMediaQuery } from "@material-ui/core";
import { Scale } from "vega";
import { MetricId } from "../../data/config/MetricConfig";
import { BreakdownVar } from "../../data/query/Breakdowns";
import { BAR_PADDING, DATASET, LEGEND_COLORS } from "./constants";

export function Scales(
  measureWithLargerDomain: MetricId,
  breakdownVar: BreakdownVar,
  LEGEND_DOMAINS: any
) {
  const pageIsTiny = useMediaQuery("(max-width:400px)");

  const xScales = {
    name: "x",
    type: "linear",
    domain: { data: DATASET, field: measureWithLargerDomain },
    range: [0, { signal: "width" }],
    nice: !pageIsTiny, //on desktop, extend x-axis to a "nice" value
    zero: true,
  };

  const yScales = {
    name: "y",
    type: "band",
    domain: {
      data: DATASET,
      field: breakdownVar,
    },
    range: { step: { signal: "y_step" } },
    paddingInner: BAR_PADDING,
  };

  const variables = {
    name: "variables",
    type: "ordinal",
    domain: LEGEND_DOMAINS,
    range: LEGEND_COLORS,
  };

  return [xScales, yScales, variables] as Scale[];
}
