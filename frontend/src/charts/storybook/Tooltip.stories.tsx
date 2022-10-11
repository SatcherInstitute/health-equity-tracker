import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";

import {
  TrendsTooltip,
  TrendsTooltipProps,
} from "../trendsChart/TrendsTooltip";
import { scaleOrdinal } from "d3";

// Local
import { COLOR_RANGE, TYPES } from "../trendsChart/constants";
import data from "../../.././.storybook/TrendsData/trends.json";

const props: TrendsTooltipProps = {
  // @ts-ignore
  data: data.race_national.covid_cases_per_100k.filter(
    ([group]) => group !== "Unknown race"
  ),
  selectedGroups: [],
  selectedDate: "2020-07-01T00:00:00.000Z",
  // @ts-ignore
  colors: scaleOrdinal(
    data.race_national.covid_cases_per_100k.map(([cat]) => cat),
    COLOR_RANGE
  ),
  type: TYPES.HUNDRED_K,
};

export default {
  title: "Components/TrendsTooltip",
  component: TrendsTooltip,
  argTypes: { onClick: { action: "clicked" } },
} as Meta;

// ref: https://storybook.js.org/docs/react/writing-stories/args#story-args
const Template: Story<TrendsTooltipProps> = (args) => (
  <TrendsTooltip {...args} />
);

export const Default = Template.bind({});
Default.args = {
  ...props,
};

export const PercentShare = Template.bind({});
PercentShare.args = {
  ...props,
  // @ts-ignore
  data: data.race_national.covid_cases_share.filter(
    ([group]) => group !== "Unknown race"
  ),
  type: TYPES.PERCENT_SHARE,
};
