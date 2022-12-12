import { MetricConfig } from "../../data/config/MetricConfig";
import { useCreateChartTitle } from "./useCreateChartTitle";
import { UnknownsMapCard } from "../../cards/UnknownsMapCard";

const metricConfig: MetricConfig = {
  metricId: "covid_cases_per_100k",
  chartTitleLines: ["COVID-19 cases since Jan 2020", "per 100k people"],
  trendsCardTitleName: "Monthly COVID-19 cases per 100k people",
  columnTitleHeader: "Rates of COVID-19 cases",
  shortLabel: "cases per 100k",
  type: "per100k",
};
const location = "";
const breakdown = "";

describe("checkUseCreateTitle", function () {
  test("it should return a single string for dataname", () => {
    const dataName = "";
    expect(useCreateChartTitle(metricConfig, location, breakdown)).toEqual(
      dataName
    );
  });
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// it('when image is WIDE and media match with medium', () => {
//     window.matchMedia = jest.fn().mockImplementation(query => ({
//       matches: query !== '(min-width: 240px) and (max-width: 767px)',
//       media: '',
//       onchange: null,
//       addListener: jest.fn(),
//       removeListener: jest.fn()
//     }));

//   });
