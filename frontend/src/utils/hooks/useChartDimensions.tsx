import { useState, useEffect } from "react";

export function useChartDimensions(width: number) {
  const chartIsSmall = width < 350;
  const chartIsLarge = width > 800;
  const chartIsMedium = width > 500 && width < 800;
  const [minTick, setTesting] = useState<string>("");
  const [minTickBarStep, setMinTickBarStep] = useState(10);
  console.log(chartIsLarge);

  useEffect(() => {
    if (chartIsLarge) {
      setTesting("hi");
      setMinTickBarStep(2);
    }
    if (chartIsMedium) {
      setMinTickBarStep(5);
    } else {
    }
  }, [chartIsLarge, chartIsMedium, chartIsSmall, minTick, minTickBarStep]);

  return { minTick, minTickBarStep };
}
