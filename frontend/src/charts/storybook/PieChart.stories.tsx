import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { PieChart, PieChartProps } from "../PieChart";
import { StoryWrapper } from "../../storybook/StoryWrapper";

export default {
  title: "Charts/PieChart",
  decorators: [StoryWrapper],
  component: PieChart,
} as Meta;

const Template: Story<PieChartProps> = (args) => <PieChart {...args} />;

export const Example1 = Template.bind({});
Example1.args = {
  data: [
    {
      covid_cases_pct_of_geo: 20,
      race_and_ethnicity: "Race 1",
    },
    {
      covid_cases_pct_of_geo: 80,
      race_and_ethnicity: "Race 2",
    },
  ],
  categoryField: "race_and_ethnicity",
  valueField: "covid_cases_pct_of_geo",
};
