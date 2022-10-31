import { Row } from "react-table";

export interface DisparityBarChartCardProps {
  data: Row[];
  chartTitle?: string;
  filename: string;
  stacked: boolean;
}

export interface Spec {
  data: Row[];
  chartTitle?: string;
  filename: string;
  fontSize: number;
  title: {
    text: string;
    subTitle?: string;
    encode: {
      title: {
        enter: {
          fontSize: { value: number };
          font: { value: string };
        };
      };
    };
  };
  width: number;
}

export interface getTitleProps {
  chartTitle?: string;
  fontSize: number;
}
