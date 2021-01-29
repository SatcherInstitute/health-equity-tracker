import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { METRIC_CONFIG } from "../../data/MetricConfig";
import { BarChartCard, BarChartCardProps } from "../BarChartCard";
import { Fips, USA_FIPS } from "../../utils/madlib/Fips";
import { StoryWrapper } from "../../storybook/StoryWrapper";

export default {
  title: "Cards/BarChartCard",
  component: BarChartCard,
  decorators: [StoryWrapper],
} as Meta;

const Template: Story<BarChartCardProps> = (args) => <BarChartCard {...args} />;

export const CovidByAge = Template.bind({});
CovidByAge.args = {
  key: "testkey",
  fips: new Fips(USA_FIPS),
  variableConfig: METRIC_CONFIG["covid"][0],
  breakdownVar: "age",
};

export const CovidByRace = Template.bind({});
CovidByRace.args = {
  key: "testkey",
  fips: new Fips(USA_FIPS),
  variableConfig: METRIC_CONFIG["covid"][0],
  breakdownVar: "race_and_ethnicity",
};

export const CopdByRace = Template.bind({});
CopdByRace.args = {
  key: "testkey",
  fips: new Fips(USA_FIPS),
  variableConfig: METRIC_CONFIG["copd"][0],
  breakdownVar: "race_and_ethnicity",
};
