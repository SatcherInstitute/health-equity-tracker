import React, { useState } from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { METRIC_CONFIG } from "../../data/MetricConfig";
import { MapCard, MapCardProps } from "../MapCard";
import { Fips, USA_FIPS } from "../../utils/madlib/Fips";
import { StoryWrapper } from "../../storybook/StoryWrapper";

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

export const CovidPercentShareMap = Template.bind({});
CovidPercentShareMap.args = {
  metricConfig: METRIC_CONFIG["covid"][0].metrics["pct_share"],
  currentBreakdown: "all",
};

export const CopdPer100kMap = Template.bind({});
CopdPer100kMap.args = {
  metricConfig: METRIC_CONFIG["copd"][0].metrics["per100k"],
  currentBreakdown: "all",
};
