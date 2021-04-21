import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { METRIC_CONFIG } from "../../data/config/MetricConfig";
import {
  DisparityBarChartCard,
  DisparityBarChartCardProps,
} from "../DisparityBarChartCard";
import { Fips, USA_FIPS } from "../../data/utils/Fips";
import { StoryWrapper } from "../../storybook/StoryWrapper";

export default {
  title: "Cards/DisparityBarChartCard",
  component: DisparityBarChartCard,
  decorators: [StoryWrapper],
} as Meta;

const Template: Story<DisparityBarChartCardProps> = (args) => (
  <DisparityBarChartCard {...args} />
);

export const CovidByAge = Template.bind({});
CovidByAge.args = {
  key: "testkey",
  fips: new Fips(USA_FIPS),
  metricConfig: METRIC_CONFIG["covid"][0].metrics["pct_share"],
  breakdownVar: "age",
};

export const CovidByRace = Template.bind({});
CovidByRace.args = {
  key: "testkey",
  fips: new Fips(USA_FIPS),
  metricConfig: METRIC_CONFIG["covid"][0].metrics["pct_share"],
  breakdownVar: "race_and_ethnicity",
};

export const CopdByRace = Template.bind({});
CopdByRace.args = {
  key: "testkey",
  fips: new Fips(USA_FIPS),
  metricConfig: METRIC_CONFIG["copd"][0].metrics["pct_share"],
  breakdownVar: "race_and_ethnicity",
};

export const HealthInsuranceByRace = Template.bind({});
HealthInsuranceByRace.args = {
  key: "testkey",
  fips: new Fips(USA_FIPS),
  metricConfig: METRIC_CONFIG["health_insurance"][0].metrics["pct_share"],
  breakdownVar: "race_and_ethnicity",
};
