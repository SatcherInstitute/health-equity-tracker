import React, { useState } from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import {
  VariableDisparityReport,
  VariableDisparityReportProps,
} from "../VariableDisparityReport";
import { StoryWrapper } from "../../storybook/StoryWrapper";
import { Fips, USA_FIPS } from "../../utils/madlib/Fips";

export default {
  title: "Report/VariableDisparityReport",
  decorators: [StoryWrapper],
  component: VariableDisparityReport,
} as Meta;

const VariableDisparityReportStateful = (args: any) => {
  const [fips, setFips] = useState<Fips>(new Fips(USA_FIPS));
  return (
    <VariableDisparityReport
      {...args}
      fips={fips}
      updateFipsCallback={(fips: Fips) => {
        setFips(fips);
      }}
    />
  );
};

const Template: Story<VariableDisparityReportProps> = (args) => (
  <VariableDisparityReportStateful {...args} />
);

export const UnitedStatesCovidCases = Template.bind({});
UnitedStatesCovidCases.args = {
  key: "key",
  dropdownVarId: "covid",
};
