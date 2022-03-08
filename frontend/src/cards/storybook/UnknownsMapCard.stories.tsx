import React, { useState } from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { METRIC_CONFIG } from "../../data/config/MetricConfig";
import { UnknownsMapCard, UnknownsMapCardProps } from "../UnknownsMapCard";
import { Fips, USA_FIPS } from "../../data/utils/Fips";
import { StoryWrapper } from "../../storybook/StoryWrapper";
import { RACE } from "../../data/utils/Constants";

export default {
  title: "Cards/UnknownsMapCard",
  component: UnknownsMapCard,
  decorators: [StoryWrapper],
} as Meta;

const UnknownsMapCardStateful = (args: any) => {
  const [fips, setFips] = useState<Fips>(new Fips(USA_FIPS));
  return (
    <UnknownsMapCard
      {...args}
      fips={fips}
      updateFipsCallback={(fips: Fips) => {
        setFips(fips);
      }}
    />
  );
};

const Template: Story<UnknownsMapCardProps> = (args) => (
  <UnknownsMapCardStateful {...args} />
);

export const CovidPercentShareMap = Template.bind({});
CovidPercentShareMap.args = {
  variableConfig: METRIC_CONFIG["covid"][0],
  currentBreakdown: RACE,
};

export const VaccinePercentShareMap = Template.bind({});
VaccinePercentShareMap.args = {
  variableConfig: METRIC_CONFIG["vaccinations"][0],
  currentBreakdown: RACE,
};
