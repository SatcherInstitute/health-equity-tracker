import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";
import { action } from "@storybook/addon-actions";

import { FilterLegend, FilterLegendProps } from "../trendsChart/FilterLegend";
import { scaleOrdinal } from "d3";

// Local
import { COLOR_RANGE } from "../trendsChart/constants";
import data from "../../../.storybook/TrendsData/trends.json";

const props: FilterLegendProps = {
  // @ts-ignore
  data: data.race_national.covid_cases_per_100k.filter(
    ([group]) => group !== "Unknown race"
  ),
  selectedGroups: [],
  handleClick: action("clicked"),
  // @ts-ignore
  colors: scaleOrdinal(
    data.race_national.covid_cases_per_100k.map(([cat]) => cat),
    COLOR_RANGE
  ),
};

export default {
  title: "Components/FilterLegend",
  component: FilterLegend,
  argTypes: { onClick: { action: "clicked" } },
} as Meta;

// ref: https://storybook.js.org/docs/react/writing-stories/args#story-args
const Template: Story<FilterLegendProps> = (args) => <FilterLegend {...args} />;

export const Default = Template.bind({});
Default.args = {
  ...props,
};
