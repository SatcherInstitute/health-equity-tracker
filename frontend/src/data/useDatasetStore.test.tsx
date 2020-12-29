import React from "react";
import { render, fireEvent } from "@testing-library/react";
import DataFetcher from "./DataFetcher";
import { DatasetMetadata, MetadataMap, Row } from "./DatasetTypes";
import useDatasetStore, { startMetadataLoad } from "./useDatasetStore";
import { act } from "react-dom/test-utils";
import AppContext from "../testing/AppContext";

const STATE_NAMES_ID = "state_names";
const ANOTHER_FAKE_DATASET_ID = "fake dataset 2";
const fakeMetadata = {
  [STATE_NAMES_ID]: {} as DatasetMetadata,
  [ANOTHER_FAKE_DATASET_ID]: {} as DatasetMetadata,
};

function DatasetDisplay() {
  const datasetStore = useDatasetStore();
  return (
    <>
      <div data-testid="MetadataLoadStatus">
        {datasetStore.metadataLoadStatus}
      </div>
      <div data-testid="MetadataKeys">
        {Object.keys(datasetStore.metadata).join(",")}
      </div>
      <div data-testid="StateNamesLoadStatus">
        {datasetStore.getDatasetLoadStatus(STATE_NAMES_ID)}
      </div>
      <div data-testid="FakeDatasetLoadStatus">
        {datasetStore.getDatasetLoadStatus(ANOTHER_FAKE_DATASET_ID)}
      </div>
      <button
        data-testid="load_state_names"
        onClick={() => datasetStore.loadDataset(STATE_NAMES_ID)}
      />
      <button
        data-testid="load_other_dataset"
        onClick={() => datasetStore.loadDataset(ANOTHER_FAKE_DATASET_ID)}
      />
    </>
  );
}

function FakeApp() {
  return (
    <AppContext>
      <DatasetDisplay />
    </AppContext>
  );
}

describe("useDatasetStore", () => {
  const mockGetMetadata = jest.fn();
  const mockLoadDataset = jest.fn();
  let resolveMetadata = (metadata: MetadataMap) => {};

  beforeEach(() => {
    jest.mock("./DataFetcher");
    DataFetcher.prototype.getMetadata = mockGetMetadata;
    DataFetcher.prototype.loadDataset = mockLoadDataset;
    mockGetMetadata.mockReturnValue(
      new Promise((res) => {
        resolveMetadata = res;
      })
    );
  });

  afterEach(() => {
    mockGetMetadata.mockClear();
    mockLoadDataset.mockClear();
    resolveMetadata = (metadata: MetadataMap) => {};
  });

  test("Metadata load", async () => {
    expect(mockGetMetadata).toHaveBeenCalledTimes(0);
    startMetadataLoad();
    const { findByTestId, rerender } = render(<FakeApp />);
    expect(mockGetMetadata).toHaveBeenCalledTimes(1);
    expect(await findByTestId("MetadataLoadStatus")).toHaveTextContent(
      "loading"
    );

    act(() => {
      resolveMetadata(fakeMetadata);
    });
    expect(await findByTestId("MetadataLoadStatus")).toHaveTextContent(
      "loaded"
    );
    expect(await findByTestId("MetadataKeys")).toHaveTextContent("state_names");

    // Rerendering should not load the metadata again
    rerender(<FakeApp />);
    expect(mockGetMetadata).toHaveBeenCalledTimes(1);
  });

  test("Dataset load", async () => {
    let resolveDataset = (rows: Row[]) => {};
    mockLoadDataset.mockReturnValue(
      new Promise((res) => {
        resolveDataset = res;
      })
    );

    startMetadataLoad();
    const { findByTestId } = render(<FakeApp />);
    act(() => {
      resolveMetadata(fakeMetadata);
    });

    // Loading a dataset triggers an API call and the state becomes "loading"
    expect(await findByTestId("StateNamesLoadStatus")).toHaveTextContent(
      "unloaded"
    );
    expect(mockLoadDataset).toHaveBeenCalledTimes(0);
    await act(async () => {
      fireEvent.click(await findByTestId("load_state_names"));
    });
    expect(mockLoadDataset).toHaveBeenCalledTimes(1);
    expect(await findByTestId("StateNamesLoadStatus")).toHaveTextContent(
      "loading"
    );

    // When the API call finishes, the state becomes "loaded"
    act(() => {
      resolveDataset([]);
    });
    expect(await findByTestId("StateNamesLoadStatus")).toHaveTextContent(
      "loaded"
    );

    // Loading the dataset again should not trigger another API call.
    await act(async () => {
      fireEvent.click(await findByTestId("load_state_names"));
    });
    expect(mockLoadDataset).toHaveBeenCalledTimes(1);

    // Loading an unloaded dataset should triggers another API call.
    expect(await findByTestId("FakeDatasetLoadStatus")).toHaveTextContent(
      "unloaded"
    );
    mockLoadDataset.mockReturnValue(Promise.resolve([]));
    await act(async () => {
      fireEvent.click(await findByTestId("load_other_dataset"));
    });
    expect(mockLoadDataset).toHaveBeenCalledTimes(2);
    expect(await findByTestId("FakeDatasetLoadStatus")).toHaveTextContent(
      "loaded"
    );
  });
});
