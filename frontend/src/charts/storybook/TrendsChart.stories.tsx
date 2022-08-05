import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";
import { TrendsChart, TrendsChartProps } from "../trendsChart/Index";
import { TYPES } from "../trendsChart/constants";

import data from "../../../public/tmp/trends.json";
import with_nulls from "../../../public/tmp/trends_with_nulls.json";

const props: TrendsChartProps = {
  // @ts-ignore - will be fixed with real data
  data: data.race_national.covid_cases_per_100k.filter(
    ([group]) => group !== "Unknown race"
  ),
  unknown: data.race_national.covid_cases_per_100k
    .filter(([group]) => group == "Unknown race")
    // @ts-ignore - will be fixed with real data
    .flatMap(([group, d]) => d),
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
  // @ts-ignore - will be fixed with real data
  data: data.race_national.covid_cases_share.filter(
    ([group]) => group !== "Unknown race"
  ),
  unknown: data.race_national.covid_cases_share
    .filter(([group]) => group == "Unknown race")
    // @ts-ignore - will be fixed with real data
    .flatMap(([group, d]) => d),
  type: TYPES.PERCENT_SHARE,
};

export const WithNulls = Template.bind({});
WithNulls.args = {
  ...props,
  // @ts-ignore - will be fixed with real data
  data: with_nulls.race_national.covid_cases_per_100k.filter(
    ([group]) => group !== "Unknown race"
  ),
  unknown: with_nulls.race_national.covid_cases_per_100k
    .filter(([group]) => group == "Unknown race")
    // @ts-ignore - will be fixed with real data
    .flatMap(([group, d]) => d),
};
