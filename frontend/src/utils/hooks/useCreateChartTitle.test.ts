import { createTitle } from "./useCreateChartTitle";

const CHART_TITLE_LINES = ["COVID-19 cases since Jan 2020", "per 100k people"];
const LOCATION = "in the United States";

describe("Create  Chart Titles", () => {
  describe("100K Map", () => {
    it("Should return a single string, when screen is large", () => {
      const output =
        "COVID-19 cases since Jan 2020 per 100k people in the United States";
      const chartTitleLines = CHART_TITLE_LINES;
      const location = LOCATION;
      const screenSize = "large";
      expect(createTitle(chartTitleLines, location, screenSize)).toEqual(
        output
      );
    });
    it("Should return a array of two strings, when ", () => {
      const output = [
        "COVID-19 cases since Jan 2020 per 100k people",
        "in the United States",
      ];
      const chartTitleLines = CHART_TITLE_LINES;
      const location = LOCATION;
      const screenSize = "medium";
      expect(createTitle(chartTitleLines, location, screenSize)).toEqual(
        output
      );
    });
    it("Should return an array of three strings, when small", () => {
      const output = [
        "COVID-19 cases since Jan 2020",
        "per 100k people",
        "in the United States",
      ];
      const chartTitleLines = CHART_TITLE_LINES;
      const location = LOCATION;
      const screenSize = "small";
      expect(createTitle(chartTitleLines, location, screenSize)).toEqual(
        output
      );
    });
  });
  describe("Unknowns Map", () => {
    it("Should return a single string, when screen is large", () => {
      const output =
        "Share of total COVID-19 cases with unknown race and ethnicity in the United States";
      const chartTitleLines = [
        "Share of total COVID-19 cases",
        "with unknown race and ethnicity",
      ];
      const location = LOCATION;
      const screenSize = "large";
      expect(createTitle(chartTitleLines, location, screenSize)).toEqual(
        output
      );
    });
  });
});
