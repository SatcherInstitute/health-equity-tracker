import { formatFieldValue, MetricConfig } from "../data/config/MetricConfig";
import { BreakdownVar } from "../data/query/Breakdowns";
import { DemographicGroup } from "../data/utils/Constants";
import { Row } from "../data/utils/DatasetTypes";

export type VisualizationType = "chart" | "map" | "table";

export const PADDING_FOR_ACTIONS_MENU = 30;

const MAX_LINE_LENGTH = 20;

// ! &nbsp&nbsp NON BREAKABLE SPACES that shouldn't occur in the data labels and can therefor be used as a delimiter that reads naturally on a screen reader &nbsp
export const DELIMITER = "  ";

export const ORDINAL = "ordinal";

// Returns a Vega Expression to create an array of the multiple lines in the label
export const MULTILINE_LABEL = `split(datum.value, '${DELIMITER}')`;

// Returns a Vega Expression to create replace delimiter token with a normal space for displaying the label on single line label
export function oneLineLabel(field: string) {
  return `join(split(datum.${field}, '${DELIMITER}'), ' ')`;
}

// We use nested ternaries to determine the label's y axis delta based on the number of lines in the label to vertically align
export const AXIS_LABEL_Y_DELTA = `length(${MULTILINE_LABEL}) == 2 ? -3 : length(${MULTILINE_LABEL}) > 2 ? -7 : 5`;

export function addLineBreakDelimitersToField(
  rawData: Row[],
  field: BreakdownVar
): Row[] {
  return rawData.map((data) => {
    let lines = [];
    let currentLine = "";
    for (let word of data[field].split(" ")) {
      if (word.length + currentLine.length >= MAX_LINE_LENGTH) {
        lines.push(currentLine.trim());
        currentLine = word + " ";
      } else {
        currentLine += word + " ";
      }
    }
    lines.push(currentLine.trim());
    return { ...data, [field]: lines.join(DELIMITER) };
  });
}

/**
 * Adds a display column to the data with the formatted values. This allows Vega
 * to directly reference the display column for labels and tooltips rather than
 * relying on formatting expression strings.
 * @param metric The metric to add the display column for.
 * @param data The data to add the column for.
 * @param omitPctSymbol Whether to omit the % symbol if the metric is a %. This
 *     can be used for example if the % symbol is part of the description.
 * @returns A tuple of
 *     [
 *         The data with the new display column,
 *         the name of the new display column
 *     ]
 */
export function addMetricDisplayColumn(
  metric: MetricConfig,
  data: Row[],
  omitPctSymbol: boolean = false
): [Row[], string] {
  const displayColName = metric.metricId + "__DISPLAY_" + String(omitPctSymbol);
  const newData = data.map((row) => {
    return {
      ...row,
      [displayColName]: formatFieldValue(
        metric.type,
        row[metric.metricId],
        omitPctSymbol
      ),
    };
  });

  return [newData, displayColName];
}

type subtitleProps = {
  activeBreakdownFilter: DemographicGroup;
  currentBreakdown: BreakdownVar;
};

export function createSubtitle({
  activeBreakdownFilter,
  currentBreakdown,
}: subtitleProps) {
  if (activeBreakdownFilter === "All") {
    return "";
  }
  if (currentBreakdown === "age") {
    return `Ages ${activeBreakdownFilter}`;
  } else {
    return `${activeBreakdownFilter}`;
  }
}
