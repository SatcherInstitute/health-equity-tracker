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
    label: "Rate Trends Over Time",
    pluralOnCompare: true,
    hashId: "rate-trends",
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
    label: "Share Disparities Over Time",
    pluralOnCompare: true,
    hashId: "share-trends",
  },
  {
    label: "Share vs. Population",
    pluralOnCompare: true,
    hashId: "share-vs-population",
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
