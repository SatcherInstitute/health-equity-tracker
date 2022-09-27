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
  "rate-trends": {
    label: "Rates over time",
    pluralOnCompare: false,
  },
  "rate-chart": {
    label: "Rate chart",
    pluralOnCompare: false,
  },
  "unknowns-map": {
    label: "Unknown demographic map",
    pluralOnCompare: true,
  },
  "share-trends": {
    label: "Share disparities over time",
    pluralOnCompare: false,
  },
  "population-vs-share": {
    label: "Population vs. share",
    pluralOnCompare: false,
  },
  "data-table": {
    label: "Data table",
    pluralOnCompare: true,
  },
  "age-adjusted-risk": {
    label: "Age-adjusted risk ratio",
    pluralOnCompare: true,
  },
  "definitions-missing-data": {
    label: "Missing data & definitions",
    pluralOnCompare: false,
  },
};

// {
//   label: "Location info & filters",
//   pluralOnCompare: false,
//   hashId: "location-info",
// },
// {
//   label: "Rate map",
//   pluralOnCompare: true,
//   hashId: "rate-map",
// },
// {
//   label: "Rates over time",
//   pluralOnCompare: false,
//   hashId: "rate-trends",
// },
// {
//   label: "Rate chart",
//   pluralOnCompare: false,
//   hashId: "rate-chart",
// },
// {
//   label: "Unknown demographic map",
//   pluralOnCompare: true,
//   hashId: "unknowns-map",
// },
// {
//   label: "Share disparities over time",
//   pluralOnCompare: false,
//   hashId: "share-trends",
// },
// {
//   label: "Population vs. share",
//   pluralOnCompare: false,
//   hashId: "population-vs-share",
// },
// {
//   label: "Data table",
//   pluralOnCompare: true,
//   hashId: "data-table",
// },
// {
//   label: "Age-adjusted risk ratio",
//   pluralOnCompare: true,
//   hashId: "age-adjusted-risk",
// },
// {
//   label: "Missing data & definitions",
//   pluralOnCompare: false,
//   hashId: "definitions-missing-data",
// },

// export const reportProviderSteps: StepData[] = [
//   {
//     label: "Location info & filters",
//     pluralOnCompare: false,
//     hashId: "location-info",
//   },
//   {
//     label: "Rate map",
//     pluralOnCompare: true,
//     hashId: "rate-map",
//   },
//   {
//     label: "Rates over time",
//     pluralOnCompare: false,
//     hashId: "rate-trends",
//   },
//   {
//     label: "Rate chart",
//     pluralOnCompare: false,
//     hashId: "rate-chart",
//   },
//   {
//     label: "Unknown demographic map",
//     pluralOnCompare: true,
//     hashId: "unknowns-map",
//   },
//   {
//     label: "Share disparities over time",
//     pluralOnCompare: false,
//     hashId: "share-trends",
//   },
//   {
//     label: "Population vs. share",
//     pluralOnCompare: false,
//     hashId: "population-vs-share",
//   },
//   {
//     label: "Data table",
//     pluralOnCompare: true,
//     hashId: "data-table",
//   },
//   {
//     label: "Age-adjusted risk ratio",
//     pluralOnCompare: true,
//     hashId: "age-adjusted-risk",
//   },
//   {
//     label: "Missing data & definitions",
//     pluralOnCompare: false,
//     hashId: "definitions-missing-data",
//   },
// ];
