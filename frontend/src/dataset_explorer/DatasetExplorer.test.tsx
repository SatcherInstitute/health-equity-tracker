import React from "react";
import { render, fireEvent } from "@testing-library/react";
import DatasetExplorer from "./DatasetExplorer";
import DataFetcher from "../data/DataFetcher";
import { startMetadataLoad } from "../data/useDatasetStore";
import AppContext from "../testing/AppContext";
import { DatasetMetadata } from "../data/DatasetTypes";

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

describe("DatasetExplorer", () => {
  const mockGetMetadata = jest.fn();
  const mockLoadDataset = jest.fn();

  beforeEach(() => {
    jest.mock("../data/DataFetcher");
    DataFetcher.prototype.getMetadata = mockGetMetadata;
    DataFetcher.prototype.loadDataset = mockLoadDataset;
  });

  afterEach(() => {
    mockGetMetadata.mockClear();
    mockLoadDataset.mockClear();
  });

  test("renders dataset metadata retrieved from DataFetcher", async () => {
    mockGetMetadata.mockReturnValue(
      Promise.resolve({ state_names: STATE_NAMES_DATASET_METADATA })
    );
    startMetadataLoad();

    const { findByText } = render(
      <AppContext>
        <DatasetExplorer preFilterDatasetIds={[]} />
      </AppContext>
    );

    expect(mockGetMetadata).toHaveBeenCalledTimes(1);
    expect(mockLoadDataset).toHaveBeenCalledTimes(0);
    expect(
      await findByText(STATE_NAMES_DATASET_METADATA.description)
    ).toBeInTheDocument();
  });
});
