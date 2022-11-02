import { useEffect, useState } from "react";
import { AlignValue, LegendOrient } from "vega";

export interface ChartDimensionProps {
  axisTickMinStep?: number;
  axisTitleAlign?: AlignValue;
  axisTitleX?: number;
  verticalTickMinStep?: number;
  legendOrient?: LegendOrient;
}

export function useChartDimensions(width: number) {
  const chartIsTiny = width < 350;
  const chartIsSmall = width > 350 && width < 500;
  const chartIsMedium = width > 500 && width < 800;
  const chartIsLarge = width >= 800;

  const initialState: ChartDimensionProps = {
    axisTickMinStep: 5,
    axisTitleAlign: "center",
    axisTitleX: undefined,
    verticalTickMinStep: 10,
    legendOrient: "top",
  };

  const [chartProperties, setProperties] = useState(initialState);

  useEffect(() => {
    const handlePropertyChange = () => {
      if (chartIsTiny) {
        setProperties({
          axisTickMinStep: 5,
          axisTitleAlign: "left",
          axisTitleX: 0,
          verticalTickMinStep: 10,
          legendOrient: "none",
        });
      }
      if (chartIsSmall) {
        setProperties({
          axisTickMinStep: 5,
          axisTitleAlign: "center",
          axisTitleX: undefined,
          verticalTickMinStep: 10,
          legendOrient: "top",
        });
      }
      if (chartIsMedium) {
        setProperties({
          axisTickMinStep: 5,
          axisTitleAlign: "center",
          axisTitleX: undefined,
          verticalTickMinStep: 5,
          legendOrient: "top",
        });
      }
      if (chartIsLarge) {
        setProperties({
          axisTickMinStep: 2,
          axisTitleAlign: "center",
          axisTitleX: undefined,
          verticalTickMinStep: 2,
          legendOrient: "top",
        });
      }
    };
    handlePropertyChange();
  }, [chartIsTiny, chartIsSmall, chartIsLarge, chartIsMedium]);

  return [chartProperties];
}
