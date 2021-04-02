import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { StackedBarChart, StackedBarChartProps } from "../StackedBarChart";
import { StoryWrapper } from "../../storybook/StoryWrapper";

export default {
  title: "Charts/StackedBarChart",
  decorators: [StoryWrapper],
  component: StackedBarChart,
} as Meta;

const Template: Story<StackedBarChartProps> = (args) => (
  <StackedBarChart {...args} />
);

export const RaceByState = Template.bind({});
RaceByState.args = {
  data: [
    {
      covid_cases_share: 20,
      race_and_ethnicity: "Race 1",
      fips_name: "State 1",
    },
    {
      covid_cases_share: 80,
      race_and_ethnicity: "Race 2",
      fips_name: "State 1",
    },
    {
      covid_cases_share: 60,
      race_and_ethnicity: "Race 1",
      fips_name: "State 2",
    },
    {
      covid_cases_share: 40,
      race_and_ethnicity: "Race 2",
      fips_name: "State 2",
    },
  ],
  measure: "covid_cases_share",
};
