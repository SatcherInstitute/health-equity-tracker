import { useMediaQuery } from "@material-ui/core";
import { MetricConfig } from "../../data/config/MetricConfig";

export function useCreateChartTitle(
  metricConfig: MetricConfig,
  location: string
) {
  const isMobile = useMediaQuery("(max-width:800px)");
  const isLarge = useMediaQuery("(max-width:1850px)");
  const isTiny = useMediaQuery("(max-width:500px)");
  const isComparing = window.location.href.includes("compare");
  const titleTextArray = [metricConfig.chartTitle || "", location];
  console.log(metricConfig.chartTitle);

  if ((isComparing && isLarge) || isTiny) {
    return [...(metricConfig.mobileChartTitle ?? []), location];
  }
  if (isMobile) {
    return titleTextArray;
  } else return titleTextArray.join(" ");
}
