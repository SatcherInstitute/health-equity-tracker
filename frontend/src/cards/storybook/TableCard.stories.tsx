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
  nonstandardizedRace: true,
  metrics: [
    METRIC_CONFIG["covid"][0].metrics["pct_share"],
    POPULATION_VARIABLE_CONFIG.metrics.pct_share,
  ],
  breakdownVar: "race_and_ethnicity",
};
