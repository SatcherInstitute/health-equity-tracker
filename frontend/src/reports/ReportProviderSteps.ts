import { StepData } from "../utils/hooks/useStepObserver";

export const reportProviderSteps: StepData[] = [
  {
    label: "Location Info and Filters",
    pluralOnCompare: false,
    hashId: "location-info",
  },
  {
    label: "Rate Map",
    pluralOnCompare: true,
    hashId: "rate-map",
  },
  {
    label: "Rate Chart",
    pluralOnCompare: true,
    hashId: "rate-chart",
  },
  {
    label: "Unknown Map",
    pluralOnCompare: true,
    hashId: "unknowns-map",
  },
  {
    label: "Population vs. Share",
    pluralOnCompare: true,
    hashId: "population-vs-share",
  },
  {
    label: "Data Table",
    pluralOnCompare: true,
    hashId: "data-table",
  },
  {
    label: "Risk Ratio Table",
    pluralOnCompare: true,
    hashId: "age-adjusted-risk",
  },
  {
    label: "Missing Data and Definitions",
    pluralOnCompare: false,
    hashId: "definitions-missing-data",
  },
];
