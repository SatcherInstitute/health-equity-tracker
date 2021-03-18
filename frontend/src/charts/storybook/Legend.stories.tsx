import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { METRIC_CONFIG } from "../../data/config/MetricConfig";
import { Legend, LegendProps } from "../Legend";
import { StoryWrapper } from "../../storybook/StoryWrapper";

export default {
  title: "Charts/Legend",
  decorators: [StoryWrapper],
  component: Legend,
} as Meta;

const Template: Story<LegendProps> = (args) => <Legend {...args} />;

export const Example1 = Template.bind({});
Example1.args = {
  legendData: [
    {
      covid_cases_pct_of_geo: 0.4,
      population_pct: 0.8,
      race_and_ethnicity: "Race 1",
    },
    {
      covid_cases_pct_of_geo: 0.9,
      population_pct: 0.3,
      race_and_ethnicity: "Race 2",
    },
  ],
  metric: METRIC_CONFIG["covid"][0].metrics["pct_share"],
  legendTitle: "legendTitle",
  fieldRange: { min: 0.4, max: 0.9 },
  scaleType: "quantile",
  sameDotSize: false,
};
