import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { METRIC_CONFIG } from "../../data/config/MetricConfig";
import { ChoroplethMap, ChoroplethMapProps } from "../ChoroplethMap";
import { Fips, USA_FIPS } from "../../data/utils/Fips";
import { StoryWrapper } from "../../storybook/StoryWrapper";

export default {
  title: "Charts/ChoroplethMap",
  decorators: [StoryWrapper],
  component: ChoroplethMap,
} as Meta;

const Template: Story<ChoroplethMapProps> = (args) => (
  <ChoroplethMap {...args} />
);

export const AutomaticLegend = Template.bind({});
AutomaticLegend.args = {
  data: [
    { covid_cases_per_100k: 4909, fips: "04", fips_name: "Arizona" },
    { covid_cases_per_100k: 3183, fips: "06", fips_name: "California" },
    { covid_cases_per_100k: 4360, fips: "08", fips_name: "Colorado" },
  ],
  metric: METRIC_CONFIG["covid"][0].metrics["per100k"],
  legendTitle: "Legend Title",
  signalListeners: [],
  fips: new Fips(USA_FIPS),
  showCounties: false,
};

export const ManualLegend = Template.bind({});
ManualLegend.args = {
  data: [
    { covid_cases_per_100k: 4909, fips: "04", fips_name: "Arizona" },
    { covid_cases_per_100k: 3183, fips: "06", fips_name: "California" },
    { covid_cases_per_100k: 4360, fips: "08", fips_name: "Colorado" },
  ],
  metric: METRIC_CONFIG["covid"][0].metrics["per100k"],
  legendTitle: "Legend Title",
  signalListeners: [],
  fips: new Fips(USA_FIPS),
  showCounties: false,
  fieldRange: { min: 1000, max: 10000 },
};
