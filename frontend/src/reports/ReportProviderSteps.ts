import { StepData } from "../utils/useStepObserver";

export const reportProviderSteps: StepData[] = [
  {
    label: "Location Info and Filters",
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
    label: "Unknown Map",
    pluralOnCompare: true,
    hashId: "unknowns",
  },
  {
    label: "Share vs. Population",
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
