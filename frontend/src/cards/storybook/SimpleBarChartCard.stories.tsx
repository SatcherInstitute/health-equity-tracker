import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { METRIC_CONFIG } from "../../data/config/MetricConfig";
import {
  SimpleBarChartCard,
  SimpleBarChartCardProps,
} from "../SimpleBarChartCard";
import { Fips, USA_FIPS } from "../../data/utils/Fips";
import { StoryWrapper } from "../../storybook/StoryWrapper";
import { RACE } from "../../data/utils/Constants";

export default {
  title: "Cards/SimpleBarChartCard",
  component: SimpleBarChartCard,
  decorators: [StoryWrapper],
} as Meta;

const Template: Story<SimpleBarChartCardProps> = (args) => (
  <SimpleBarChartCard {...args} />
);

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
  breakdownVar: RACE,
};

export const CopdByRace = Template.bind({});
CopdByRace.args = {
  key: "testkey",
  fips: new Fips(USA_FIPS),
  variableConfig: METRIC_CONFIG["copd"][0],
  breakdownVar: RACE,
};
