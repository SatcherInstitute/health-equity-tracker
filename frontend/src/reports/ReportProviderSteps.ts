import { ScrollableHashId } from "../utils/hooks/useStepObserver";

export interface StepLabelInfo {
  pluralOnCompare: boolean;
  label: string;
}

export const reportProviderSteps: Record<ScrollableHashId, StepLabelInfo> = {
  "location-info": {
    label: "Location info & filters",
    pluralOnCompare: false,
  },
  "rate-map": {
    label: "Rate map",
    pluralOnCompare: true,
  },
  "rates-over-time": {
    label: "Rates over time",
    pluralOnCompare: false,
  },
  "rate-chart": {
    label: "Rate chart",
    pluralOnCompare: false,
  },
  "unknown-demographic-map": {
    label: "Unknown demographic map",
    pluralOnCompare: true,
  },
  "inequities-over-time": {
    label: "Inequities over time",
    pluralOnCompare: false,
  },
  "population-vs-distribution": {
    label: "Population vs. distribution",
    pluralOnCompare: false,
  },
  "data-table": {
    label: "Data table",
    pluralOnCompare: true,
  },
  "age-adjusted-risk": {
    label: "Age-adjusted risk",
    pluralOnCompare: true,
  },
  "definitions-missing-data": {
    label: "Definitions & missing data",
    pluralOnCompare: false,
  },
};
