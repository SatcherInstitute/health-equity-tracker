import React from "react";
import { act } from "react-dom/test-utils";
import { render } from "@testing-library/react";
import DatasetExplorer from "./DatasetExplorer";
import { DatasetMetadata } from "../../../data/utils/DatasetTypes";
import { autoInitGlobals, getDataFetcher } from "../../../utils/globals";
import FakeDataFetcher from "../../../testing/FakeDataFetcher";

const ACS_DATASET_METADATA: DatasetMetadata = {
  id: "acs_population-by_age_county",
  name: "ACS Population by Age and County",
  update_time: "update_time",
};

autoInitGlobals();

test("DatasetExplorer renders all data sources", async () => {
  const dataFetcher = getDataFetcher() as FakeDataFetcher;

  const { queryByText, findByTestId } = render(
    <DatasetExplorer preFilterDataSourceIds={[]} />
  );
  act(() => {
    dataFetcher.setFakeMetadataLoaded({
      state_names: ACS_DATASET_METADATA,
    });
  });

  expect(dataFetcher.getNumGetMetadataCalls()).toBe(1);
  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(0);
  expect(await queryByText("View All Datasets")).not.toBeInTheDocument();
  expect(await findByTestId("acs")).toBeInTheDocument();
  expect(await findByTestId("covid_tracking_project")).toBeInTheDocument();
  expect(await findByTestId("uhc")).toBeInTheDocument();
});

test("DatasetExplorer renders subset of data sources", async () => {
  const dataFetcher = getDataFetcher() as FakeDataFetcher;

  const { findByText, findByTestId, queryByTestId } = render(
    <DatasetExplorer preFilterDataSourceIds={["acs"]} />
  );
  act(() => {
    dataFetcher.setFakeMetadataLoaded({
      state_names: ACS_DATASET_METADATA,
    });
  });

  expect(dataFetcher.getNumGetMetadataCalls()).toBe(1);
  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(0);
  expect(await findByText("View All Datasets")).toBeInTheDocument();
  expect(await findByTestId("acs")).toBeInTheDocument();
  expect(await queryByTestId("covid_tracking_project")).not.toBeInTheDocument();
  expect(await queryByTestId("uhc")).not.toBeInTheDocument();
});
