import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import {
  METRIC_CONFIG,
  POPULATION_VARIABLE_CONFIG,
} from "../../data/config/MetricConfig";
import { TableChart, TableChartProps } from "../TableChart";
import { StoryWrapper } from "../../storybook/StoryWrapper";
import { RACE } from "../../data/utils/Constants";

export default {
  title: "Charts/TableChart",
  decorators: [StoryWrapper],
  component: TableChart,
} as Meta;

const Template: Story<TableChartProps> = (args) => <TableChart {...args} />;

export const ShareOfCovidAndPopulation = Template.bind({});
ShareOfCovidAndPopulation.args = {
  data: [
    {
      covid_cases_share: 0.4,
      population_pct: 0.8,
      race_and_ethnicity: "Race 1",
    },
    {
      covid_cases_share: 0.8,
      population_pct: 0.3,
      race_and_ethnicity: "Race 2",
    },
  ],
  metrics: [
    METRIC_CONFIG["covid"][0].metrics["pct_share"],
    POPULATION_VARIABLE_CONFIG.metrics.pct_share,
  ],
  breakdownVar: RACE,
};
