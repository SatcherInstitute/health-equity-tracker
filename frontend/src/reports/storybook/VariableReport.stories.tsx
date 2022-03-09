import React, { useState } from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import {
  OneVariableReport,
  OneVariableReportProps,
} from "../OneVariableReport";
import { StoryWrapper } from "../../storybook/StoryWrapper";
import { Fips, USA_FIPS } from "../../data/utils/Fips";

export default {
  title: "Report/OneVariableReport",
  decorators: [StoryWrapper],
  component: OneVariableReport,
} as Meta;

const OneVariableReportStateful = (args: any) => {
  const [fips, setFips] = useState<Fips>(new Fips(USA_FIPS));
  return (
    <OneVariableReport
      {...args}
      fips={fips}
      updateFipsCallback={(fips: Fips) => {
        setFips(fips);
      }}
    />
  );
};

const Template: Story<OneVariableReportProps> = (args) => (
  <OneVariableReportStateful {...args} />
);

export const UnitedStatesCovidCases = Template.bind({});
UnitedStatesCovidCases.args = {
  key: "key",
  dropdownVarId: "covid",
};
