import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { METRIC_CONFIG } from "../../data/config/MetricConfig";
import { TableCard, TableCardProps } from "../TableCard";
import { Fips, USA_FIPS } from "../../data/utils/Fips";
import { StoryWrapper } from "../../storybook/StoryWrapper";
import { RACE } from "../../data/utils/Constants";

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
  breakdownVar: RACE,
};

export const CopdCountAndPer100k = Template.bind({});
CopdCountAndPer100k.args = {
  fips: new Fips(USA_FIPS),
  variableConfig: METRIC_CONFIG["copd"][0],
  breakdownVar: RACE,
};

export const HealthInsuranceCoverage = Template.bind({});
HealthInsuranceCoverage.args = {
  fips: new Fips(USA_FIPS),
  variableConfig: METRIC_CONFIG["health_insurance"][0],
  breakdownVar: RACE,
};
