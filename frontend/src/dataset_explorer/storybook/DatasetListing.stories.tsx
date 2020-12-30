import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { DatasetListing, DatasetListingProps } from "../DatasetListing";
import { StoryWrapper } from "../../storybook/StoryWrapper";

export default {
  title: "DatasetExplorer/DatasetListing",
  decorators: [StoryWrapper],
  component: DatasetListing,
} as Meta;

const Template: Story<DatasetListingProps> = (args) => (
  <DatasetListing {...args} />
);

const LIPSUM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et hendrerit lorem. Curabitur nec metus nec quam fermentum interdum. Maecenas ut neque blandit, elementum enim vel, gravida dolor. Proin mollis rutrum elit non rhoncus. Pellentesque placerat, lectus sit amet accumsan feugiat, purus sapien sagittis velit, non consectetur quam erat at dui. Etiam volutpat tempus mi non feugiat. Aenean suscipit id orci in fringilla. Praesent tincidunt aliquet diam quis dignissim. Nullam vitae pellentesque lectus. Aenean dictum, justo sed dignissim facilisis, risus enim vulputate massa, eget lacinia nibh sapien a magna. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Integer sed magna placerat, laoreet metus a, tristique elit. Nullam fringilla eget massa quis condimentum. Suspendisse eu nisl a lectus fermentum ultricies sed quis diam. Vestibulum tincidunt urna sed dolor faucibus venenatis pellentesque sit amet massa. Phasellus suscipit viverra velit non elementum. Aenean auctor, dolor non pharetra cursus, tellus lectus euismod ex, eget tristique tellus tellus a tortor. Vivamus nisi nulla, rhoncus semper hendrerit tincidunt, placerat sed massa.";

const DATASET_METADATA = {
  id: "datset_id",
  name: "COVID-19 Deaths",
  description: LIPSUM,
  fields: [
    {
      data_type: "string",
      name: "field name",
      description: "field description",
      origin_dataset: "ACS Census",
    },
  ],
  data_source_name: "CDC Provisional Death Counts for COVID-19",
  data_source_link: "data_source_link",
  geographic_level: "County",
  demographic_granularity: "Race/ethnicity",
  update_frequency: "Daily",
  update_time: "	March 2, 2020",
};

export const Example1 = Template.bind({});
Example1.args = {
  dataset: DATASET_METADATA,
};
