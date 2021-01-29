import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { GroupedBarChart, GroupedBarChartProps } from "../GroupedBarChart";
import { StoryWrapper } from "../../storybook/StoryWrapper";

export default {
  title: "Charts/GroupedBarChart",
  decorators: [StoryWrapper],
  component: GroupedBarChart,
} as Meta;

const Template: Story<GroupedBarChartProps> = (args) => (
  <GroupedBarChart {...args} />
);

const RACE_BY_STATE_DATA = [
  {
    diabetes_per_100k: 20,
    race_and_ethnicity: "Race 1",
    fips_name: "State 1",
  },
  {
    diabetes_per_100k: 80,
    race_and_ethnicity: "Race 2",
    fips_name: "State 1",
  },
  {
    diabetes_per_100k: 60,
    race_and_ethnicity: "Race 1",
    fips_name: "State 2",
  },
  {
    diabetes_per_100k: 40,
    race_and_ethnicity: "Race 2",
    fips_name: "State 2",
  },
];

export const OneStateVertical = Template.bind({});
OneStateVertical.args = {
  data: [
    {
      diabetes_per_100k: 20,
      race_and_ethnicity: "Race 1",
      fips_name: "State 1",
    },
    {
      diabetes_per_100k: 80,
      race_and_ethnicity: "Race 2",
      fips_name: "State 1",
    },
  ],
  measure: "diabetes_per_100k",
  dimension1: "fips_name",
  dimension2: "race_and_ethnicity",
  bars: "vertical",
};

export const OneStateHorizontal = Template.bind({});
OneStateHorizontal.args = {
  data: [
    {
      diabetes_per_100k: 20,
      race_and_ethnicity: "Race 1",
      fips_name: "State 1",
    },
    {
      diabetes_per_100k: 80,
      race_and_ethnicity: "Race 2",
      fips_name: "State 1",
    },
  ],
  measure: "diabetes_per_100k",
  dimension1: "fips_name",
  dimension2: "race_and_ethnicity",
  bars: "horizontal",
};

export const RaceByStateVertical = Template.bind({});
RaceByStateVertical.args = {
  data: RACE_BY_STATE_DATA,
  measure: "diabetes_per_100k",
  dimension1: "fips_name",
  dimension2: "race_and_ethnicity",
  bars: "vertical",
};

export const RaceByStateHorizontal = Template.bind({});
RaceByStateHorizontal.args = {
  data: RACE_BY_STATE_DATA,
  measure: "diabetes_per_100k",
  dimension1: "fips_name",
  dimension2: "race_and_ethnicity",
  bars: "horizontal",
};
