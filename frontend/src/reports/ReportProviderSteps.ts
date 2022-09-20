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
    label: "Rates Over Time",
    pluralOnCompare: false,
    hashId: "rate-trends",
  },
  {
    label: "Current Rates",
    pluralOnCompare: false,
    hashId: "rate-chart",
  },
  {
    label: "Unknown Demographic Map",
    pluralOnCompare: true,
    hashId: "unknowns-map",
  },
  {
    label: "Share Disparities Over Time",
    pluralOnCompare: false,
    hashId: "share-trends",
  },
  {
    label: "Population vs. Share",
    pluralOnCompare: false,
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
    label: "Missing Data & Definitions",
    pluralOnCompare: false,
    hashId: "definitions-missing-data",
  },
];
