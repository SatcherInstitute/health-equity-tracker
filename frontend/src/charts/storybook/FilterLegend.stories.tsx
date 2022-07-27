import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";
import { action } from "@storybook/addon-actions";

import { FilterLegend, FilterLegendProps } from "../trendsChart/FilterLegend";
import { scaleTime } from "d3";
import data from "../../../public/tmp/trends.json";

const props: FilterLegendProps = {
  data: data.race_national.covid_cases_per_100k,
  onClick: action("clicked"),
};

export default {
  title: "Components/FilterLegend",
  component: FilterLegend,
} as Meta;

// ref: https://storybook.js.org/docs/react/writing-stories/args#story-args
const Template: Story<FilterLegendProps> = (args) => <FilterLegend {...args} />;

export const Default = Template.bind({});
Default.args = {
  ...props,
};
