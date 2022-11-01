import { MetricId } from "../../data/config/MetricConfig";
import { BreakdownVar } from "../../data/query/Breakdowns";
import { BAR_PADDING, LEGEND_COLORS, Y_STEP } from "./constants";
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

function getSignals() {
  return [
    {
      name: "y_step",
      value: Y_STEP,
    },
    {
      name: "height",
      update: "bandspace(domain('y').length, 0.1, 0.05) * y_step",
    },
  ];
}

function maxValueInField(
  data: Readonly<Record<string, any>>[],
  field: MetricId
) {
  return Math.max(
    ...data
      .map((row) => row[field])
      .filter((value: number | undefined) => value !== undefined)
  );
}

function getLargerMeasure(
  data: Readonly<Record<string, any>>[],
  lightMetricId: MetricId,
  darkMetricId: MetricId
) {
  const lightValue = maxValueInField(data, lightMetricId);
  const darkValue = maxValueInField(data, darkMetricId);

  if (lightValue > darkValue) {
    return lightMetricId;
  } else return darkMetricId;
}

export { getTitle, getSignals, maxValueInField, getLargerMeasure };
