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

export const CovidByRace = Template.bind({});
CovidByRace.args = {
  key: "testkey",
  fips: new Fips(USA_FIPS),
  nonstandardizedRace: true,
  variableConfig: METRIC_CONFIG["covid"][0],
  breakdownVar: "race_and_ethnicity",
};
