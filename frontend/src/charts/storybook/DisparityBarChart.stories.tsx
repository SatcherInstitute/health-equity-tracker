import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import {
  METRIC_CONFIG,
  POPULATION_VARIABLE_CONFIG,
} from "../../data/config/MetricConfig";
import {
  DisparityBarChart,
  DisparityBarChartProps,
} from "../DisparityBarChart";
import { StoryWrapper } from "../../storybook/StoryWrapper";
import { RACE } from "../../data/utils/Constants";

export default {
  title: "Charts/DisparityBarChart",
  decorators: [StoryWrapper],
  component: DisparityBarChart,
} as Meta;

const Template: Story<DisparityBarChartProps> = (args) => (
  <DisparityBarChart {...args} />
);

export const Example1 = Template.bind({});
Example1.args = {
  data: [
    {
      covid_cases_share: 0.4,
      population_pct: 0.8,
      race_and_ethnicity: "Race 1",
    },
    {
      covid_cases_share: 0.8,
      population_pct: 0.3,
      race_and_ethnicity: "Race 2",
    },
  ],
  lightMetric: METRIC_CONFIG["covid"][0].metrics["pct_share"],
  darkMetric: POPULATION_VARIABLE_CONFIG.metrics.pct_share,
  breakdownVar: RACE,
  metricDisplayName: "Metric Display name",
};
