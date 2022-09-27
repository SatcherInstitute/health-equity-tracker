import { StepData } from "../utils/hooks/useStepObserver";

export const reportProviderSteps: StepData[] = [
  {
    label: "Location info & filters",
    pluralOnCompare: false,
    hashId: "location-info",
  },
  {
    label: "Rate map",
    pluralOnCompare: true,
    hashId: "rate-map",
  },
  {
    label: "Rates over time",
    pluralOnCompare: false,
    hashId: "rate-trends",
  },
  {
    label: "Rate chart",
    pluralOnCompare: false,
    hashId: "rate-chart",
  },
  {
    label: "Unknown demographic map",
    pluralOnCompare: true,
    hashId: "unknowns-map",
  },
  {
    label: "Share disparities over time",
    pluralOnCompare: false,
    hashId: "share-trends",
  },
  {
    label: "Population vs. share",
    pluralOnCompare: false,
    hashId: "population-vs-share",
  },
  {
    label: "Data table",
    pluralOnCompare: true,
    hashId: "data-table",
  },
  {
    label: "Age-adjusted risk ratio",
    pluralOnCompare: true,
    hashId: "age-adjusted-risk",
  },
  {
    label: "Missing data & definitions",
    pluralOnCompare: false,
    hashId: "definitions-missing-data",
  },
];
