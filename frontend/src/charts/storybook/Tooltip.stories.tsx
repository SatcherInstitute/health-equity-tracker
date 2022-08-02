import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";
import { action } from "@storybook/addon-actions";

import { Tooltip, TooltipProps } from "../trendsChart/Tooltip";
import { scaleOrdinal } from "d3";

// Local
import { COLOR_RANGE, TYPES } from "../trendsChart/constants";
import data from "../../../public/tmp/trends.json";

const props: TooltipProps = {
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
  component: Tooltip,
  argTypes: { onClick: { action: "clicked" } },
} as Meta;

// ref: https://storybook.js.org/docs/react/writing-stories/args#story-args
const Template: Story<TooltipProps> = (args) => <Tooltip {...args} />;

export const Default = Template.bind({});
Default.args = {
  ...props,
};

export const PercentShare = Template.bind({});
PercentShare.args = {
  ...props,
  data: data.race_national.covid_cases_share.filter(
    ([group]) => group !== "Unknown race"
  ),
  type: TYPES.PERCENT_SHARE,
};
