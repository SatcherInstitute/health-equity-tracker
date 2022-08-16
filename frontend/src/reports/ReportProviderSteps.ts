export type StepData = {
  label: string;
  hashId: ScrollableHashId;
};

export type ScrollableHashId =
  | "population"
  | "map"
  | "bar"
  | "unknowns"
  | "disparity"
  | "table"
  | "age-adjusted"
  | "definitions"
  | "missingDataInfo";

export const reportProviderSteps: StepData[] = [
  {
    label: "Location Info",
    hashId: "population",
  },
  {
    label: "Rate Map",
    hashId: "map",
  },
  {
    label: "Rate Chart",
    hashId: "bar",
  },
  {
    label: "Unknown Share Map",
    hashId: "unknowns",
  },
  {
    label: "Share Chart",
    hashId: "disparity",
  },
  {
    label: "Data Table",
    hashId: "table",
  },
  {
    label: "Risk Ratio Table",
    hashId: "age-adjusted",
  },
  // {
  //   label: "Definitions",
  //   hashId: "definitions",
  // },
  // {
  //   label: "What Data Are Missing?",
  //   hashId: "missingDataInfo",
  // },
];
