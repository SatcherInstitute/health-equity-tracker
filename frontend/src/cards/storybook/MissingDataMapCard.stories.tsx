import React, { useState } from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { METRIC_CONFIG } from "../../data/config/MetricConfig";
import {
  MissingDataMapCard,
  MissingDataMapCardProps,
} from "../MissingDataMapCard";
import { Fips, USA_FIPS } from "../../data/utils/Fips";
import { StoryWrapper } from "../../storybook/StoryWrapper";

export default {
  title: "Cards/MissingDataMapCard",
  component: MissingDataMapCard,
  decorators: [StoryWrapper],
} as Meta;

const MissingDataMapCardStateful = (args: any) => {
  const [fips, setFips] = useState<Fips>(new Fips(USA_FIPS));
  return (
    <MissingDataMapCard
      {...args}
      fips={fips}
      updateFipsCallback={(fips: Fips) => {
        setFips(fips);
      }}
    />
  );
};

const Template: Story<MissingDataMapCardProps> = (args) => (
  <MissingDataMapCardStateful {...args} />
);

export const CopdPercentShareMap = Template.bind({});
CopdPercentShareMap.args = {
  variableConfig: METRIC_CONFIG["copd"][0],
  currentBreakdown: "race_and_ethnicity",
};

export const DiabetesPercentShareMap = Template.bind({});
DiabetesPercentShareMap.args = {
  variableConfig: METRIC_CONFIG["diabetes"][0],
  currentBreakdown: "race_and_ethnicity",
};
