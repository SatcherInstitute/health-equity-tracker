import { StepData } from "../utils/hooks/useStepObserver";

export const reportProviderSteps: StepData[] = [
  {
    label: "Location Info & Filters",
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
    label: "Unknown Demographic Map",
    pluralOnCompare: true,
    hashId: "unknowns-map",
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
    label: "Definitions & Missing Data",
    pluralOnCompare: false,
    hashId: "definitions-missing-data",
  },
];
