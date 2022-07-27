import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";
import { TrendsChart, TrendsChartProps } from "../trendsChart/Index";
import data from "../../../public/tmp/trends.json";

const props: TrendsChartProps = {
  data: data.race_national.covid_cases_per_100k,
  unknown: [],
  type: "100K",
};

export default {
  title: "Components/TrendsChart",
  component: TrendsChart,
} as Meta;

// ref: https://storybook.js.org/docs/react/writing-stories/args#story-args
const Template: Story<TrendsChartProps> = (args) => <TrendsChart {...args} />;

export const Default = Template.bind({});
Default.args = {
  ...props,
};
