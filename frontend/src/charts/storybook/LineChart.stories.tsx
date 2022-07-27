import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";
import { LineChart, LineChartProps } from "../trendsChart/LineChart";
import { scaleTime } from "d3";
import data from "../../../public/tmp/trends.json";

const props: LineChartProps = {
  data: data.race_national.covid_cases_per_100k,
  xScale: scaleTime(
    [new Date("2020-01-01"), new Date("2022-06-01")],
    [10, 490]
  ),
};

export default {
  title: "Components/LineChart",
  component: LineChart,
} as Meta;

// ref: https://storybook.js.org/docs/react/writing-stories/args#story-args
const Template: Story<LineChartProps> = (args) => <LineChart {...args} />;

export const Default = Template.bind({});
Default.args = {
  ...props,
};
