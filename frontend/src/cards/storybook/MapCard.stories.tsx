import React, { useState } from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { METRIC_CONFIG } from "../../data/config/MetricConfig";
import { MapCard, MapCardProps } from "../MapCard";
import { Fips, USA_FIPS } from "../../data/utils/Fips";
import { StoryWrapper } from "../../storybook/StoryWrapper";
import { RACE } from "../../data/utils/Constants";

export default {
  title: "Cards/MapCard",
  component: MapCard,
  decorators: [StoryWrapper],
} as Meta;

const MapCardStateful = (args: any) => {
  const [fips, setFips] = useState<Fips>(new Fips(USA_FIPS));
  return (
    <MapCard
      {...args}
      fips={fips}
      updateFipsCallback={(fips: Fips) => {
        setFips(fips);
      }}
    />
  );
};

const Template: Story<MapCardProps> = (args) => <MapCardStateful {...args} />;

export const CovidPer100kMap = Template.bind({});
CovidPer100kMap.args = {
  variableConfig: METRIC_CONFIG["covid"][0],
  currentBreakdown: RACE,
};

export const VaccinesPer100kMap = Template.bind({});
VaccinesPer100kMap.args = {
  variableConfig: METRIC_CONFIG["covid_vaccinations"][0],
  currentBreakdown: RACE,
};

export const CopdPer100kMap = Template.bind({});
CopdPer100kMap.args = {
  variableConfig: METRIC_CONFIG["copd"][0],
  currentBreakdown: RACE,
};

export const HealthInsurancePer100kMap = Template.bind({});
HealthInsurancePer100kMap.args = {
  variableConfig: METRIC_CONFIG["health_insurance"][0],
  currentBreakdown: RACE,
};

export const PovertyPer100kMap = Template.bind({});
PovertyPer100kMap.args = {
  variableConfig: METRIC_CONFIG["poverty"][0],
  currentBreakdown: RACE,
};
