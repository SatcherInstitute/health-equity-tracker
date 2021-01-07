import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { LineChart, LineChartProps } from "../LineChart";
import { StoryWrapper } from "../../storybook/StoryWrapper";

export default {
  title: "Charts/LineChart",
  decorators: [StoryWrapper],
  component: LineChart,
} as Meta;

const Template: Story<LineChartProps> = (args) => <LineChart {...args} />;

export const ShareOfCovidAndPopulation = Template.bind({});
ShareOfCovidAndPopulation.args = {
  data: [
    {
      covid_cases: 20,
      race_and_ethnicity: "Race 1",
      date: "2020-05-13",
    },
    {
      covid_cases: 22,
      race_and_ethnicity: "Race 1",
      date: "2020-05-14",
    },
    {
      covid_cases: 28,
      race_and_ethnicity: "Race 1",
      date: "2020-05-15",
    },
    {
      covid_cases: 34,
      race_and_ethnicity: "Race 1",
      date: "2020-05-16",
    },
    {
      covid_cases: 40,
      race_and_ethnicity: "Race 2",
      date: "2020-05-13",
    },
    {
      covid_cases: 36,
      race_and_ethnicity: "Race 2",
      date: "2020-05-14",
    },
    {
      covid_cases: 30,
      race_and_ethnicity: "Race 2",
      date: "2020-05-15",
    },
    {
      covid_cases: 22,
      race_and_ethnicity: "Race 2",
      date: "2020-05-16",
    },
  ],
  breakdownVar: "race_and_ethnicity",
  variable: "covid_cases",
  timeVariable: "date",
};
