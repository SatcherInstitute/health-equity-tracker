import { MetricConfig } from "../../data/config/MetricConfig";
import { BreakdownVar } from "../../data/query/Breakdowns";
import {
  addLineBreakDelimitersToField,
  addMetricDisplayColumn,
  oneLineLabel,
} from "../utils";
import {
  BAR_PADDING,
  DARK_MEASURE_COLOR,
  LABEL_SWAP_CUTOFF_PERCENT,
  LIGHT_MEASURE_COLOR,
  SIDE_BY_SIDE_FULL_BAR_RATIO,
  SIDE_BY_SIDE_ONE_BAR_RATIO,
  THIN_RATIO,
} from "./constants";
import { MarkProps } from "./types";

const altLightMetric: MetricConfig = {
  fullCardTitleName: "Population Share (ACS)",
  metricId: "acs_vaccine_population_pct",
  shortLabel: "% of population (ACS)",
  type: "pct_share",
};

export function Marks(props: MarkProps) {
  const lightMeasureDisplayName = props.lightMetric.shortLabel;
  const darkMeasureDisplayName = props.darkMetric.shortLabel;
  const lightMeasure = props.lightMetric.metricId;
  const darkMeasure = props.darkMetric.metricId;
  const altLightMeasure = altLightMetric.metricId;

  const dataWithLineBreakDelimiter = addLineBreakDelimitersToField(
    props.data,
    props.breakdownVar
  );

  const [dataWithLightMetric, lightMetricDisplayColumnName] =
    addMetricDisplayColumn(
      props.lightMetric,
      dataWithLineBreakDelimiter,
      /* omitPctSymbol= */ true
    );

  const [dataWithDarkMetric, darkMetricDisplayColumnName] =
    addMetricDisplayColumn(
      props.darkMetric,
      dataWithLightMetric,
      /* omitPctSymbol= */ true
    );

  const barLabelBreakpoint =
    Math.max(
      ...props.data.map(
        (row: { [x: string]: any }) => row[props.darkMetric.metricId]
      )
    ) *
    (LABEL_SWAP_CUTOFF_PERCENT / 100);

  const [dataMarks, altLightMetricDisplayColumnName] = props.hasAltPop
    ? addMetricDisplayColumn(
        altLightMetric,
        dataWithDarkMetric,
        /* omitPctSymbol= */ true
      )
    : [dataWithDarkMetric, ""];

  const BAR_HEIGHT = props.stacked ? 40 : 12;
  const STACKED_BAND_HEIGHT = BAR_HEIGHT - BAR_HEIGHT * BAR_PADDING;
  const SIDE_BY_SIDE_BAND_HEIGHT =
    SIDE_BY_SIDE_FULL_BAR_RATIO * BAR_HEIGHT -
    SIDE_BY_SIDE_FULL_BAR_RATIO * BAR_HEIGHT * BAR_PADDING;
  const MIDDLE_OF_BAND = SIDE_BY_SIDE_BAND_HEIGHT / 2;
  const SIDE_BY_SIDE_OFFSET =
    BAR_HEIGHT * SIDE_BY_SIDE_ONE_BAR_RATIO * (SIDE_BY_SIDE_FULL_BAR_RATIO / 2);

  const createBarLabel = () => {
    const singleLineLabel = `datum.${darkMetricDisplayColumnName} + "${props.metricDisplayName}"`;
    const multiLineLabel = `datum.${darkMetricDisplayColumnName} + "%"`;
    if (props.chartIsSmall) {
      return multiLineLabel;
    } else return singleLineLabel;
  };

  const altTextLabels = {
    name: "alt_text_labels",
    type: "text",
    style: ["text"],
    from: { data: "DATASET" },
    description: `${dataMarks.length} items`,
    encode: {
      update: {
        y: { scale: "y", field: props.breakdownVar, band: 0.5 },
        opacity: {
          signal: "0",
        },
        fontSize: { value: 0 },
        text: {
          signal: !props.hasAltPop
            ? // NORMAL
              `${oneLineLabel(props.breakdownVar)}
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
                ${oneLineLabel(props.breakdownVar)}
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
    name: "lightMeasure_bars",
    aria: false,
    type: "rect",
    style: ["bar"],
    from: { data: "DATASET" },
    encode: {
      enter: {
        tooltip: {
          signal: `${oneLineLabel(
            props.breakdownVar
          )} + ', ${lightMeasureDisplayName}: ' + datum.${lightMetricDisplayColumnName}`,
        },
      },
      update: {
        fill: { value: LIGHT_MEASURE_COLOR },
        ariaRoleDescription: { value: "bar" },
        x: { scale: "x", field: lightMeasure },
        x2: { scale: "x", value: 0 },
        y: { scale: "y", field: props.breakdownVar },
        yc: {
          scale: "y",
          field: props.breakdownVar,
          offset: props.stacked
            ? STACKED_BAND_HEIGHT / 2
            : MIDDLE_OF_BAND - SIDE_BY_SIDE_OFFSET,
        },
        height: {
          scale: "y",
          band: props.stacked ? 1 : SIDE_BY_SIDE_ONE_BAR_RATIO,
        },
      },
    },
  };

  const darkMeasureBars = {
    name: "darkMeasure_bars",
    type: "rect",
    style: ["bar"],
    aria: false,
    from: { data: "DATASET" },
    encode: {
      enter: {
        tooltip: {
          signal: `${oneLineLabel(
            props.breakdownVar
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
          field: props.breakdownVar,
          offset: props.stacked
            ? STACKED_BAND_HEIGHT / 2
            : MIDDLE_OF_BAND + SIDE_BY_SIDE_OFFSET,
        },
        height: {
          scale: "y",
          band: props.stacked ? THIN_RATIO : SIDE_BY_SIDE_ONE_BAR_RATIO,
        },
      },
    },
  };

  const darkMeasureTextLabels = {
    name: "darkMeasure_text_labels",
    aria: false, // this data accessible in alt_text_labels
    type: "text",
    style: ["text"],
    from: { data: "DATASET" },
    encode: {
      enter: {
        tooltip: {
          signal: `${oneLineLabel(
            props.breakdownVar
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
        y: { scale: "y", field: props.breakdownVar, band: 0.5 },
        yc: {
          scale: "y",
          field: props.breakdownVar,
          offset: props.stacked
            ? STACKED_BAND_HEIGHT / 2
            : MIDDLE_OF_BAND + BAR_HEIGHT,
        },
        text: {
          signal: createBarLabel(),
        },
      },
    },
  };

  const marks = {
    altTextLabels,
    lightMeasureBars,
    darkMeasureBars,
    darkMeasureTextLabels,
  };

  return { marks };
}
