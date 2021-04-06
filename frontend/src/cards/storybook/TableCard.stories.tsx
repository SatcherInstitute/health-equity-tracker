import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import {
  METRIC_CONFIG,
  POPULATION_VARIABLE_CONFIG,
} from "../../data/config/MetricConfig";
import { TableCard, TableCardProps } from "../TableCard";
import { Fips, USA_FIPS } from "../../data/utils/Fips";
import { StoryWrapper } from "../../storybook/StoryWrapper";

export default {
  title: "Cards/TableCard",
  component: TableCard,
  decorators: [StoryWrapper],
} as Meta;

const Template: Story<TableCardProps> = (args) => <TableCard {...args} />;

export const CovidAndPopulationShare = Template.bind({});
CovidAndPopulationShare.args = {
  fips: new Fips(USA_FIPS),
  variableConfig: METRIC_CONFIG["covid"][0],
  metrics: [METRIC_CONFIG["covid"][0].metrics.pct_share],
  breakdownVar: "race_and_ethnicity",
};

export const CopdCountAndPer100k = Template.bind({});
CopdCountAndPer100k.args = {
  fips: new Fips(USA_FIPS),
  variableConfig: METRIC_CONFIG["copd"][0],
  metrics: [
    METRIC_CONFIG["copd"][0].metrics.count,
    METRIC_CONFIG["copd"][0].metrics.per100k,
  ],
  breakdownVar: "race_and_ethnicity",
};

export const HealthInsuranceCoverage = Template.bind({});
HealthInsuranceCoverage.args = {
  fips: new Fips(USA_FIPS),
  variableConfig: METRIC_CONFIG["health_insurance"][0],
  metrics: [METRIC_CONFIG["health_insurance"][0].metrics.count],
  breakdownVar: "race_and_ethnicity",
};
