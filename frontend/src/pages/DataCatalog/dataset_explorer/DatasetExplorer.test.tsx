import React from "react";
import { act } from "react-dom/test-utils";
import { render } from "@testing-library/react";
import DatasetExplorer from "./DatasetExplorer";
import { DatasetMetadata } from "../../../data/DatasetTypes";
import { autoInitGlobals, getDataFetcher } from "../../../utils/globals";
import FakeDataFetcher from "../../../testing/FakeDataFetcher";

const STATE_NAMES_DATASET_METADATA: DatasetMetadata = {
  id: "state_names",
  name: "State Names",
  description: "List of states and their FIPS codes.",
  geographic_level: "geographic_level",
  demographic_granularity: "demographic_granularity",
  data_source_name: "data_source_name",
  data_source_link: "data_source_link",
  update_time: "update_time",
  update_frequency: "update_frequency",
  fields: [],
};

autoInitGlobals();

const dataFetcher = getDataFetcher() as FakeDataFetcher;

describe("DatasetExplorer", () => {
  beforeEach(() => {
    dataFetcher.resetState();
  });

  afterEach(() => {
    dataFetcher.resetState();
  });

  test("renders dataset metadata retrieved from DataFetcher", async () => {
    const { findByText } = render(<DatasetExplorer preFilterDatasetIds={[]} />);
    act(() => {
      dataFetcher.setFakeMetadataLoaded({
        state_names: STATE_NAMES_DATASET_METADATA,
      });
    });

    expect(dataFetcher.getNumGetMetdataCalls()).toBe(1);
    expect(dataFetcher.getNumLoadDatasetCalls()).toBe(0);
    expect(
      await findByText(STATE_NAMES_DATASET_METADATA.description)
    ).toBeInTheDocument();
  });
});
