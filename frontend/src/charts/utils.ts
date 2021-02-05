import { Row } from "../data/utils/DatasetTypes";

const MAX_LINE_LENGTH = 18;
export const DELIMITER = "*~*";

// Returns a Vega Expression to create an array of the multiple lines in the label
export const MULTILINE_LABEL = `split(datum.value, '${DELIMITER}')`;

// Returns a Vega Expression to create teplace delimiter token with a space for displaying the label on one label
export function oneLineLabel(field: string) {
  return `join(split(datum.${field}, '${DELIMITER}'), ' ')`;
}

// We use nested ternerys to determine the label's y axis delta based on the number of lines in the label to vertically align
export const AXIS_LABEL_Y_DELTA = `length(${MULTILINE_LABEL}) == 2 ? -3 : length(${MULTILINE_LABEL}) > 2 ? -7 : 5`;

export function addLineBreakDelimitersToField(rawData: Row[], field: string) {
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
