import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { PopulationCard } from "../PopulationCard";
import { Fips, USA_FIPS } from "../../data/utils/Fips";
import { BreakdownVar } from "../../data/query/Breakdowns";
import { MetricConfig } from "../../data/config/MetricConfig";
import { StoryWrapper } from "../../storybook/StoryWrapper";

interface PopulationCardProps {
  fips: Fips;
  breakdownVar: BreakdownVar;
  metrics: MetricConfig[];
  jumpToData: Function;
}
export default {
  title: "Cards/PopulationCard",
  component: PopulationCard,
  decorators: [StoryWrapper],
} as Meta;

const Template: Story<PopulationCardProps> = (args) => (
  <PopulationCard
    {...args}
    jumpToData={() => console.log("Jump to Missing Data")}
  />
);

export const Usa = Template.bind({});
Usa.args = {
  fips: new Fips(USA_FIPS),
};

export const NorthCarolina = Template.bind({});
NorthCarolina.args = {
  fips: new Fips("37"),
};

export const DurhamCounty = Template.bind({});
DurhamCounty.args = {
  fips: new Fips("37063"),
};

export const InvalidFips = Template.bind({});
InvalidFips.args = {
  fips: new Fips("234234"),
};

export const VirginIslands = Template.bind({});
VirginIslands.args = {
  fips: new Fips("78"),
};
