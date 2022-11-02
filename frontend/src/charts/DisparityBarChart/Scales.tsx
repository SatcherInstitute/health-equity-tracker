import { useMediaQuery } from "@material-ui/core";
import { Scale } from "vega";
import { BAR_PADDING, DATASET, LEGEND_COLORS } from "./constants";
import { ScalesProps } from "./types";

export function Scales({
  largerMeasure,
  breakdownVar,
  LEGEND_DOMAINS,
}: ScalesProps) {
  const pageIsTiny = useMediaQuery("(max-width:400px)");

  const xScales: Scale = {
    name: "x",
    type: "linear",
    domain: { data: DATASET, field: largerMeasure },
    range: [0, { signal: "width" }],
    nice: !pageIsTiny, //on desktop, extend x-axis to a "nice" value
    zero: true,
  };

  const yScales: Scale = {
    name: "y",
    type: "band",
    domain: {
      data: DATASET,
      field: breakdownVar,
    },
    range: { step: { signal: "y_step" } },
    paddingInner: BAR_PADDING,
  };

  const variables: Scale = {
    name: "variables",
    type: "ordinal",
    domain: LEGEND_DOMAINS,
    range: LEGEND_COLORS,
  };

  const scales: Scale[] = [xScales, yScales, variables];

  return scales;
}
