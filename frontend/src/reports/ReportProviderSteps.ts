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
    label: "Age-Adjusted Risk Ratios",
    pluralOnCompare: false,
    hashId: "age-adjusted-risk",
  },
  {
    label: "Missing Data & Definitions",
    pluralOnCompare: false,
    hashId: "definitions-missing-data",
  },
];
