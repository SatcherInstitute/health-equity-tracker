import { useMediaQuery, createTheme } from "@material-ui/core";
import { MetricConfig } from "../../data/config/MetricConfig";

// These are custom breakpoints used for the text wrapping of
// titles in chart. The default breakpoints don't work well for the titles.
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 800,
      md: 900,
      lg: 1500,
      xl: 1850,
    },
  },
});

export function useCreateChartTitle(
  metricConfig: MetricConfig,
  location: string,
  breakdown?: string
) {
  const isComparing = window.location.href.includes("compare");
  const unknownMap = metricConfig.metricId.includes("share");

  const chartTitle = metricConfig.chartTitle || "";
  const unknownchartTitle = `${chartTitle} with unknown ${breakdown}`;
  let { chartTitleLines } = metricConfig;
  let titleTextArray = [chartTitle, `in ${location}`];

  const altMobileChartTitle = [
    chartTitle,
    `with unknown ${breakdown || ""}`,
    `in ${location}`,
  ];

  if (unknownMap && breakdown) {
    titleTextArray = [unknownchartTitle, `in ${location}`];
  }

  chartTitleLines = chartTitleLines
    ? [...chartTitleLines, `in ${location}`]
    : altMobileChartTitle;

  const isExtraSmall = useMediaQuery(theme.breakpoints.down("xs"));
  const isSmall = useMediaQuery(theme.breakpoints.only("sm"));
  const isNotLarge = useMediaQuery(theme.breakpoints.down("md"));
  const isLarge = useMediaQuery(theme.breakpoints.only("lg"));

  if (isExtraSmall || (isComparing && isNotLarge)) {
    return chartTitleLines;
  }
  if (isSmall || (isComparing && isLarge)) {
    return titleTextArray;
  } else return chartTitleLines.join(" ");
}
