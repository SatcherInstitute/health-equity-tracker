import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { PopulationCard } from "../PopulationCard";
import { Fips, USA_FIPS } from "../../data/utils/Fips";
import { BreakdownVar } from "../../data/query/Breakdowns";
import { MetricConfig } from "../../data/config/MetricConfig";
import { StoryWrapper } from "../../storybook/StoryWrapper";

interface PopulationCardProps {
  fips: Fips;
  currentBreakdown: BreakdownVar;
  metrics: MetricConfig[];
}
export default {
  title: "Cards/PopulationCard",
  component: PopulationCard,
  decorators: [StoryWrapper],
} as Meta;

const Template: Story<PopulationCardProps> = (args) => (
  <PopulationCard {...args} />
);

export const Usa = Template.bind({});
Usa.args = {
  fips: new Fips(USA_FIPS),
  currentBreakdown: "age",
};

export const NorthCarolina = Template.bind({});
NorthCarolina.args = {
  fips: new Fips("37"),
  currentBreakdown: "age",
};

export const DurhamCounty = Template.bind({});
DurhamCounty.args = {
  fips: new Fips("37063"),
  currentBreakdown: "age",
};

export const InvalidFips = Template.bind({});
InvalidFips.args = {
  fips: new Fips("234234"),
  currentBreakdown: "age",
};

export const VirginIslands = Template.bind({});
VirginIslands.args = {
  fips: new Fips("78"),
  currentBreakdown: "age",
};
