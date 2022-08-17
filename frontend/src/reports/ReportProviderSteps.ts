export type StepData = {
  label: string;
  hashId: ScrollableHashId;
  pluralOnCompare: boolean;
};

export type ScrollableHashId =
  | "population"
  | "map"
  | "bar"
  | "unknowns"
  | "disparity"
  | "table"
  | "age-adjusted"
  | "def"
  | "what";

export const reportProviderSteps: StepData[] = [
  {
    label: "Location Info",
    pluralOnCompare: false,
    hashId: "population",
  },
  {
    label: "Rate Map",
    pluralOnCompare: true,
    hashId: "map",
  },
  {
    label: "Rate Chart",
    pluralOnCompare: true,
    hashId: "bar",
  },
  {
    label: "Unknown Share Map",
    pluralOnCompare: true,
    hashId: "unknowns",
  },
  {
    label: "Share Chart",
    pluralOnCompare: true,
    hashId: "disparity",
  },
  {
    label: "Data Table",
    pluralOnCompare: true,
    hashId: "table",
  },
  {
    label: "Risk Ratio Table",
    pluralOnCompare: true,
    hashId: "age-adjusted",
  },
  {
    label: "Missing Data and Definitions",
    pluralOnCompare: false,
    hashId: "def",
  },
];
