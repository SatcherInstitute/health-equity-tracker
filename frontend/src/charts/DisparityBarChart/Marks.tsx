import { TrailMark } from "vega";
import { MetricConfig, MetricId } from "../../data/config/MetricConfig";
import { BreakdownVar } from "../../data/query/Breakdowns";
import {
  addLineBreakDelimitersToField,
  addMetricDisplayColumn,
  oneLineLabel,
} from "../utils";
import {
  ALT_LIGHT_MEASURE_COLOR,
  ALT_TEXT_LABELS,
  BAR_HEIGHT,
  BAR_PADDING,
  DARK_MEASURE_BARS,
  DARK_MEASURE_COLOR,
  DARK_MEASURE_TEXT_LABELS,
  DATASET,
  LEGEND_COLORS,
  LIGHT_MEASURE_BARS,
  LIGHT_MEASURE_COLOR,
  SIDE_BY_SIDE_FULL_BAR_RATIO,
  SIDE_BY_SIDE_ONE_BAR_RATIO,
} from "./constants";

const altLightMetric: MetricConfig = {
  fullCardTitleName: "Population Share (ACS)",
  metricId: "acs_vaccine_population_pct",
  shortLabel: "% of population (ACS)",
  type: "pct_share",
};

export function Marks(
  dataWithLineBreakDelimiter: Readonly<Record<string, any>>[],
  metricDisplayName: string,
  breakdownVar: BreakdownVar,
  hasAltPop: boolean | undefined,
  chartIsSmall: boolean,
  barLabelBreakpoint: number,
  LEGEND_DOMAINS: string[],
  lightMetric: MetricConfig,
  darkMetric: MetricConfig
) {
  const lightMeasureDisplayName = lightMetric.shortLabel;
  const darkMeasureDisplayName = darkMetric.shortLabel;
  const lightMeasure = lightMetric.metricId;
  const darkMeasure = darkMetric.metricId;
  const altLightMeasure = altLightMetric.metricId;

  const altLightMeasureDisplayName = hasAltPop ? altLightMetric.shortLabel : "";

  const SIDE_BY_SIDE_BAND_HEIGHT =
    SIDE_BY_SIDE_FULL_BAR_RATIO * BAR_HEIGHT -
    SIDE_BY_SIDE_FULL_BAR_RATIO * BAR_HEIGHT * BAR_PADDING;

  const MIDDLE_OF_BAND = SIDE_BY_SIDE_BAND_HEIGHT / 2;

  const SIDE_BY_SIDE_OFFSET =
    BAR_HEIGHT * SIDE_BY_SIDE_ONE_BAR_RATIO * (SIDE_BY_SIDE_FULL_BAR_RATIO / 2);

  const [dataWithLightMetric, lightMetricDisplayColumnName] =
    addMetricDisplayColumn(
      lightMetric,
      dataWithLineBreakDelimiter,
      /* omitPctSymbol= */ true
    );

  const [dataWithDarkMetric, darkMetricDisplayColumnName] =
    addMetricDisplayColumn(
      darkMetric,
      dataWithLightMetric,
      /* omitPctSymbol= */ true
    );

  const [data, altLightMetricDisplayColumnName] = hasAltPop
    ? addMetricDisplayColumn(
        altLightMetric,
        dataWithDarkMetric,
        /* omitPctSymbol= */ true
      )
    : [dataWithDarkMetric, ""];

  const createBarLabel = () => {
    const singleLineLabel = `datum.${darkMetricDisplayColumnName} + "${metricDisplayName}"`;
    const multiLineLabel = `datum.${darkMetricDisplayColumnName} + "%"`;
    if (chartIsSmall) {
      return multiLineLabel;
    } else return singleLineLabel;
  };

  const altTextLabels = {
    name: ALT_TEXT_LABELS,
    type: "text",
    style: ["text"],
    from: { data: DATASET },
    description: `${data.length} items`,
    encode: {
      update: {
        y: { scale: "y", field: breakdownVar, band: 0.5 },
        opacity: { signal: "0" },
        fontSize: { value: 0 },
        text: {
          signal: !hasAltPop
            ? // NORMAL
              `${oneLineLabel(breakdownVar)}
              +
                ': '
                +
                datum.${lightMetricDisplayColumnName}
                +
                '${lightMeasureDisplayName}'
                +
                ' vs. '
                +
                datum.${darkMetricDisplayColumnName}
                +
                '${darkMeasureDisplayName}'
              `
            : // FOR GEOS WITH ALT POPULATIONS
              `
                ${oneLineLabel(breakdownVar)}
                +
                ': '
                +
                if(datum.${altLightMeasure} == null, datum.${lightMetricDisplayColumnName}, datum.${altLightMetricDisplayColumnName})
                +
                '${lightMeasureDisplayName}'
                +
                ' vs. '
                +
                datum.${darkMetricDisplayColumnName}
                +
                '${darkMeasureDisplayName}'
                `,
        },
      },
    },
  };

  const lightMeasureBars = {
    name: LIGHT_MEASURE_BARS,
    aria: false,
    type: "rect",
    style: ["bar"],
    from: { data: DATASET },
    encode: {
      enter: {
        tooltip: {
          signal: `${oneLineLabel(
            breakdownVar
          )} + ', ${lightMeasureDisplayName}: ' + datum.${lightMetricDisplayColumnName}`,
        },
      },
      update: {
        fill: { value: LIGHT_MEASURE_COLOR },
        ariaRoleDescription: { value: "bar" },
        x: { scale: "x", field: lightMeasure },
        x2: { scale: "x", value: 0 },
        y: { scale: "y", field: breakdownVar },
        yc: {
          scale: "y",
          field: breakdownVar,
          offset: MIDDLE_OF_BAND - SIDE_BY_SIDE_OFFSET,
        },
        height: {
          scale: "y",
          band: SIDE_BY_SIDE_ONE_BAR_RATIO,
        },
      },
    },
  };

  const darkMeasureBars = {
    name: DARK_MEASURE_BARS,
    type: "rect",
    style: ["bar"],
    aria: false,
    from: { data: DATASET },
    encode: {
      enter: {
        tooltip: {
          signal: `${oneLineLabel(
            breakdownVar
          )} + ', ${darkMeasureDisplayName}: ' + datum.${darkMetricDisplayColumnName}`,
        },
      },
      update: {
        fill: { value: DARK_MEASURE_COLOR },
        ariaRoleDescription: { value: "bar" },
        x: { scale: "x", field: darkMeasure },
        x2: { scale: "x", value: 0 },
        yc: {
          scale: "y",
          field: breakdownVar,
          offset: MIDDLE_OF_BAND + SIDE_BY_SIDE_OFFSET,
        },
        height: {
          scale: "y",
          band: SIDE_BY_SIDE_ONE_BAR_RATIO,
        },
      },
    },
  };

  const darkMeasureTextLabels = {
    name: DARK_MEASURE_TEXT_LABELS,
    aria: false, // this data accessible in alt_text_labels
    type: "text",
    style: ["text"],
    from: { data: DATASET },
    encode: {
      enter: {
        tooltip: {
          signal: `${oneLineLabel(
            breakdownVar
          )} + ', ${darkMeasureDisplayName}: ' + datum.${darkMetricDisplayColumnName}`,
        },
      },
      update: {
        align: {
          signal: `if(datum.${darkMeasure} > ${barLabelBreakpoint}, "right", "left")`,
        },
        baseline: { value: "middle" },
        dx: {
          signal: `if(datum.${darkMeasure} > ${barLabelBreakpoint}, -3, 3)`,
        },
        fill: {
          signal: `if(datum.${darkMeasure} > ${barLabelBreakpoint}, "white", "black")`,
        },
        x: { scale: "x", field: darkMeasure },
        y: { scale: "y", field: breakdownVar, band: 0.5 },
        yc: {
          scale: "y",
          field: breakdownVar,
          offset: MIDDLE_OF_BAND + BAR_HEIGHT,
        },
        text: {
          signal: createBarLabel(),
        },
      },
    },
  };

  const marks = [
    altTextLabels,
    lightMeasureBars,
    darkMeasureBars,
    darkMeasureTextLabels,
  ];

  if (hasAltPop) {
    LEGEND_COLORS.splice(1, 0, ALT_LIGHT_MEASURE_COLOR);
    LEGEND_DOMAINS[0] = `${lightMeasureDisplayName} (KFF)`;
    LEGEND_DOMAINS.splice(1, 0, altLightMeasureDisplayName!);
    marks.push({
      name: "altLightMeasure_bars",
      aria: false, // this data accessible in alt_text_labels
      type: "rect",
      style: ["bar"],
      from: { data: "DATASET" },
      encode: {
        enter: {
          tooltip: {
            signal: `${oneLineLabel(
              breakdownVar
            )} + ', ${altLightMeasureDisplayName}: ' + datum.${altLightMetricDisplayColumnName}`,
          },
        },
        update: {
          fill: { value: ALT_LIGHT_MEASURE_COLOR },
          // @ts-ignore
          fillOpacity: { value: ALT_LIGHT_MEASURE_OPACITY },
          ariaRoleDescription: { value: "bar" },
          x: { scale: "x", field: altLightMeasure! },
          x2: { scale: "x", value: 0 },
          y: { scale: "y", field: breakdownVar },
          yc: {
            scale: "y",
            field: breakdownVar,
            offset: MIDDLE_OF_BAND - SIDE_BY_SIDE_OFFSET,
          },
          height: {
            scale: "y",
            band: SIDE_BY_SIDE_ONE_BAR_RATIO,
          },
        },
      },
    });
  }

  return marks as TrailMark[];
}
