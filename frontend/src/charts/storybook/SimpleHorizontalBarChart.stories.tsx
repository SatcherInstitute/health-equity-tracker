import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { METRIC_CONFIG } from "../../data/config/MetricConfig";
import {
  SimpleHorizontalBarChart,
  SimpleHorizontalBarChartProps,
} from "../SimpleHorizontalBarChart";
import { StoryWrapper } from "../../storybook/StoryWrapper";
import { RACE } from "../../data/utils/Constants";

export default {
  title: "Charts/SimpleHorizontalBarChart",
  decorators: [StoryWrapper],
  component: SimpleHorizontalBarChart,
} as Meta;

const Template: Story<SimpleHorizontalBarChartProps> = (args) => (
  <SimpleHorizontalBarChart {...args} />
);

export const Example1 = Template.bind({});
Example1.args = {
  data: [
    { covid_cases_share: 0.4, race_and_ethnicity: "Race 1" },
    { covid_cases_share: 0.8, race_and_ethnicity: "Race 2" },
  ],
  metric: METRIC_CONFIG["covid"][0].metrics["pct_share"],
  breakdownVar: RACE,
  showLegend: true,
};
