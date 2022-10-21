import { useMediaQuery, createTheme } from "@material-ui/core";
import { MetricConfig } from "../../data/config/MetricConfig";

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
  location: string
) {
  const isComparing = window.location.href.includes("compare");

  const titleTextArray = [metricConfig.chartTitle || "", location];

  const isExtraSmall = useMediaQuery(theme.breakpoints.down("xs"));
  const isSmall = useMediaQuery(theme.breakpoints.only("sm"));
  const isNotLarge = useMediaQuery(theme.breakpoints.down("md"));
  const isLarge = useMediaQuery(theme.breakpoints.only("lg"));

  if (isExtraSmall || (isComparing && isNotLarge)) {
    return [...(metricConfig.mobileChartTitle ?? []), location];
  }
  if (isSmall || (isComparing && isLarge)) {
    return titleTextArray;
  } else return titleTextArray.join(" ");
}
