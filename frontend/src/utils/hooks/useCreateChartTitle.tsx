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
  const isExtraSmall = useMediaQuery(theme.breakpoints.down("xs"));
  const isSmall = useMediaQuery(theme.breakpoints.only("sm"));
  const isNotLarge = useMediaQuery(theme.breakpoints.down("md"));
  const isLarge = useMediaQuery(theme.breakpoints.only("lg"));
  const isComparing = window.location.href.includes("compare");

  let { chartTitleLines } = metricConfig;
  const dataName = chartTitleLines.join(" ");
  if (breakdown) chartTitleLines = [...chartTitleLines, breakdown];

  const multiLineTitle = [...chartTitleLines, location];
  const twoLineTitle = [chartTitleLines.join(" "), location];
  const singleLineTitle = twoLineTitle.join(" ");

  if (isExtraSmall || (isComparing && isNotLarge)) {
    return { chartTitle: multiLineTitle, filename: singleLineTitle, dataName };
  }
  if (isSmall || (isComparing && isLarge)) {
    return { chartTitle: twoLineTitle, filename: singleLineTitle, dataName };
  } else
    return { chartTitle: singleLineTitle, filename: singleLineTitle, dataName };
}
