import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import {
  METRIC_CONFIG,
  POPULATION_VARIABLE_CONFIG,
} from "../../data/MetricConfig";
import { TableCard, TableCardProps } from "../TableCard";
import { Fips, USA_FIPS } from "../../utils/madlib/Fips";
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
  metrics: [
    METRIC_CONFIG["covid"][0].metrics.pct_share,
    POPULATION_VARIABLE_CONFIG.metrics.pct_share,
  ],
  breakdownVar: "race_and_ethnicity",
};

export const CopdCountAndPer100k = Template.bind({});
CopdCountAndPer100k.args = {
  fips: new Fips(USA_FIPS),
  metrics: [
    METRIC_CONFIG["copd"][0].metrics.count,
    METRIC_CONFIG["copd"][0].metrics.per100k,
  ],
  breakdownVar: "race_and_ethnicity",
};
