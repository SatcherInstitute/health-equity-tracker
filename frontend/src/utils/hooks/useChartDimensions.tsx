import { useEffect, useState } from "react";

export interface ChartDimensionProps {
  axisTickMinStep?: number;
  axisTitleAlign: string;
  axisTitleX?: number;
  verticalTickMinStep?: number;
}

export function useChartDimensions(width: number) {
  const chartIsSmall = width < 350;
  const chartIsMedium = width > 500 && width < 800;
  const chartIsLarge = width >= 800;
  const [chartDimensions, setDimensions] = useState<ChartDimensionProps>({
    axisTickMinStep: 5,
    axisTitleAlign: "center",
    verticalTickMinStep: 10,
  });

  useEffect(() => {
    if (chartIsSmall) {
      setDimensions({
        ...chartDimensions,
        axisTickMinStep: 5,
        axisTitleAlign: "left",
        axisTitleX: 0,
        verticalTickMinStep: 10,
      });
    }
    if (chartIsMedium) {
      setDimensions({
        ...chartDimensions,
        axisTickMinStep: 5,
        axisTitleAlign: "center",
        axisTitleX: undefined,
        verticalTickMinStep: 5,
      });
    }
    if (chartIsLarge) {
      setDimensions({
        ...chartDimensions,
        axisTickMinStep: 2,
        axisTitleAlign: "center",
        axisTitleX: undefined,
        verticalTickMinStep: 2,
      });
    }
  }, [chartIsSmall, chartIsMedium, chartIsLarge, setDimensions]);

  return [chartDimensions];
}
