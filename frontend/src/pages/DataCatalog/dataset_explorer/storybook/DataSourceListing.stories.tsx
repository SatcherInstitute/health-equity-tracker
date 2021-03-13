import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import {
  DataSourceListing,
  DataSourceListingProps,
} from "../DataSourceListing";
import { StoryWrapper } from "../../../../storybook/StoryWrapper";
import { MapOfDatasetMetadata } from "../../../../data/utils/DatasetTypes";

export default {
  title: "DatasetExplorer/DataSourceListing",
  decorators: [StoryWrapper],
  component: DataSourceListing,
} as Meta;

const Template: Story<DataSourceListingProps> = (args) => (
  <DataSourceListing {...args} />
);

const LIPSUM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et hendrerit lorem. Curabitur nec metus nec quam fermentum interdum. Maecenas ut neque blandit, elementum enim vel, gravida dolor. Proin mollis rutrum elit non rhoncus. Pellentesque placerat, lectus sit amet accumsan feugiat, purus sapien sagittis velit, non consectetur quam erat at dui. Etiam volutpat tempus mi non feugiat. Aenean suscipit id orci in fringilla. Praesent tincidunt aliquet diam quis dignissim. Nullam vitae pellentesque lectus. Aenean dictum, justo sed dignissim facilisis, risus enim vulputate massa, eget lacinia nibh sapien a magna. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Integer sed magna placerat, laoreet metus a, tristique elit. Nullam fringilla eget massa quis condimentum. Suspendisse eu nisl a lectus fermentum ultricies sed quis diam. Vestibulum tincidunt urna sed dolor faucibus venenatis pellentesque sit amet massa. Phasellus suscipit viverra velit non elementum. Aenean auctor, dolor non pharetra cursus, tellus lectus euismod ex, eget tristique tellus tellus a tortor. Vivamus nisi nulla, rhoncus semper hendrerit tincidunt, placerat sed massa.";

const DATA_SOURCE_METADATA = {
  id: "datasource_id",
  name: "COVID-19 Deaths",
  description: LIPSUM,
  dataset_ids: ["acs1", "acs2", "unavailable dataset"],
  data_source_name: "CDC Provisional Death Counts for COVID-19",
  data_source_link: "data_source_link",
  geographic_level: "County",
  demographic_granularity: "Race/ethnicity",
  update_frequency: "Daily",
  update_time: "	March 2, 2020",
};

const DATASET_METADATA: MapOfDatasetMetadata = {
  acs1: {
    id: "id",
    name: "Some Dataset",
    update_time: "March",
    fields: [],
  },
  acs2: {
    id: "id",
    name: "Another Dataset",
    update_time: "Feburary",
    fields: [],
  },
};

export const Example1 = Template.bind({});
Example1.args = {
  source_metadata: DATA_SOURCE_METADATA,
  dataset_metadata: DATASET_METADATA,
};
