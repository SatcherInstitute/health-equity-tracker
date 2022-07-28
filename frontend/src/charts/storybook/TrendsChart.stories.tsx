import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";
import { TrendsChart, TrendsChartProps } from "../trendsChart/Index";
import { TYPES } from "../trendsChart/constants";

import data from "../../../public/tmp/trends.json";

const props: TrendsChartProps = {
  data: data.race_national.covid_cases_per_100k.filter(
    ([group]) => group !== "Unknown race"
  ),
  unknown: data.race_national.covid_cases_per_100k.filter(
    ([group]) => group == "Unknown race"
  ),
  type: TYPES.HUNDRED_K,
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

export const PercentShare = Template.bind({});
PercentShare.args = {
  ...props,
  data: data.race_national.covid_cases_share.filter(
    ([group]) => group !== "Unknown race"
  ),
  unknown: data.race_national.covid_cases_share.filter(
    ([group]) => group !== "Unknown race"
  ),
  type: TYPES.PERCENT_SHARE,
};
