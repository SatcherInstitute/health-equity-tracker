import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";
import { CircleChart, CircleChartProps } from "../trendsChart/CircleChart";
import { scaleTime } from "d3";
import data from "../../../public/tmp/trends.json";

const props: CircleChartProps = {
  data: data.race_national.covid_cases_per_100k,
  xScale: scaleTime(
    [new Date("2020-01-01"), new Date("2022-06-01")],
    [10, 490]
  ),
};

export default {
  title: "Components/CircleChart",
  component: CircleChart,
} as Meta;

// ref: https://storybook.js.org/docs/react/writing-stories/args#story-args
const Template: Story<CircleChartProps> = (args) => <CircleChart {...args} />;

export const Default = Template.bind({});
Default.args = {
  ...props,
};
