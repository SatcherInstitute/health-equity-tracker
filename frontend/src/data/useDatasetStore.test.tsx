import React from "react";
import { render, fireEvent } from "@testing-library/react";
import DataFetcher from "./DataFetcher";
import { DatasetMetadata, MetadataMap, Row, Dataset } from "./DatasetTypes";
import useDatasetStore, { startMetadataLoad } from "./useDatasetStore";
import { act } from "react-dom/test-utils";
import AppContext from "../testing/AppContext";
import { MetricQuery } from "../data/MetricQuery";
import { Breakdowns } from "../data/Breakdowns";
import FakeMetadataMap from "./FakeMetadataMap";
import { WithMetrics } from "./WithLoadingOrErrorUI";

const STATE_NAMES_ID = "state_names";
const ANOTHER_FAKE_DATASET_ID = "fake_dataset_2";
const fakeMetadata = {
  ...FakeMetadataMap,
  [STATE_NAMES_ID]: {} as DatasetMetadata,
  [ANOTHER_FAKE_DATASET_ID]: {} as DatasetMetadata,
};

function DatasetDisplayApp() {
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

  return (
    <AppContext>
      <DatasetDisplay />
    </AppContext>
  );
}
function WithMetricsWrapperApp(props: {
  query: MetricQuery;
  displayRow?: (row: Row) => void;
}) {
  function WithMetricsWrapper(props: {
    query: MetricQuery;
    displayRow?: (row: Row) => void;
  }) {
    const datasetStore = useDatasetStore();

    return (
      <WithMetrics queries={[props.query]}>
        {() => {
          const response = datasetStore.getMetrics(props.query);
          return (
            <div data-testid="MetricQueryResponseReturned">
              {response.dataIsMissing() && (
                <>Error: {response.missingDataMessage!}</>
              )}
              {!response.dataIsMissing() && (
                <>
                  Loaded {response.data.length} rows.{" "}
                  {props.displayRow !== undefined &&
                    response.data.map((row) => props.displayRow!(row))}
                </>
              )}
            </div>
          );
        }}
      </WithMetrics>
    );
  }

  return (
    <AppContext>
      <WithMetricsWrapper query={props.query} displayRow={props.displayRow} />
    </AppContext>
  );
}

describe("useDatasetStore", () => {
  const mockGetMetadata = jest.fn();
  const mockLoadDataset = jest.fn();
  let resolveMetadata = (metadata: MetadataMap) => {};
  let resolveDataset = (datasetRows: Row[]) => {};

  beforeEach(() => {
    jest.mock("./DataFetcher");
    DataFetcher.prototype.getMetadata = mockGetMetadata;
    DataFetcher.prototype.loadDataset = mockLoadDataset;
    mockGetMetadata.mockReturnValue(
      new Promise((res) => {
        resolveMetadata = res;
      })
    );
    mockLoadDataset.mockReturnValue(
      new Promise((res) => {
        resolveDataset = res;
      })
    );
  });

  afterEach(() => {
    mockGetMetadata.mockClear();
    mockLoadDataset.mockClear();
    resolveMetadata = (metadata: MetadataMap) => {};
    resolveDataset = (datasetRows: Row[]) => {};
  });

  test("Loads metadata", async () => {
    expect(mockGetMetadata).toHaveBeenCalledTimes(0);
    startMetadataLoad();
    const { findByTestId, rerender } = render(<DatasetDisplayApp />);
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
    rerender(<DatasetDisplayApp />);
    expect(mockGetMetadata).toHaveBeenCalledTimes(1);
  });

  test("Loads datset when requested", async () => {
    startMetadataLoad();
    const { findByTestId } = render(<DatasetDisplayApp />);
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

  test("WithMetrics: Loads metrics", async () => {
    const query = new MetricQuery(
      "copd_count",
      Breakdowns.national().andRace()
    );

    expect(mockGetMetadata).toHaveBeenCalledTimes(0);
    startMetadataLoad();
    const { findByTestId } = render(
      <WithMetricsWrapperApp
        query={query}
        displayRow={(row: Row) =>
          `${row.race_and_ethnicity}: ${row.copd_count}. `
        }
      />
    );
    act(() => {
      resolveMetadata(fakeMetadata);
      resolveDataset([
        {
          state_name: "Alabama",
          race_and_ethnicity: "AmIn",
          copd_count: 20,
        },
        { state_name: "Alabama", race_and_ethnicity: "Asian", copd_count: 1 },
      ]);
    });

    expect(mockLoadDataset).toHaveBeenCalledTimes(1);
    expect(await findByTestId("MetricQueryResponseReturned")).toHaveTextContent(
      "Loaded 2 rows. AmIn: 20. Asian: 1."
    );
  });

  // TODO - one succesful dataset, one bad dataset

  test("WithMetrics: Loaded metrics have no rows", async () => {
    const query = new MetricQuery(
      "diabetes_count",
      Breakdowns.national().andRace()
    );

    expect(mockGetMetadata).toHaveBeenCalledTimes(0);
    startMetadataLoad();
    const { findByTestId } = render(<WithMetricsWrapperApp query={query} />);
    act(() => {
      resolveMetadata(fakeMetadata);
      resolveDataset([]);
    });

    expect(mockLoadDataset).toHaveBeenCalledTimes(1);
    expect(await findByTestId("MetricQueryResponseReturned")).toHaveTextContent(
      "Error: No rows returned"
    );
  });

  test("WithMetrics: Unsupported breakdown", async () => {
    const query = new MetricQuery(
      "diabetes_count",
      Breakdowns.byCounty().andAge()
    );

    expect(mockGetMetadata).toHaveBeenCalledTimes(0);
    startMetadataLoad();
    const { findByTestId } = render(<WithMetricsWrapperApp query={query} />);
    act(() => {
      resolveMetadata(fakeMetadata);
      resolveDataset([]);
    });

    expect(mockLoadDataset).toHaveBeenCalledTimes(1);
    expect(await findByTestId("MetricQueryResponseReturned")).toHaveTextContent(
      'Error: Breakdowns not supported for provider brfss_provider: {"geography":"county","demographic":"age"}'
    );
  });

  test("WithMetrics: Dataset doesn't exist", async () => {
    const query = new MetricQuery(
      //@ts-ignore - metric ID should be invalid for this test
      "fakemetricdoesntexist",
      Breakdowns.national()
    );

    expect(mockGetMetadata).toHaveBeenCalledTimes(0);
    startMetadataLoad();
    const { findByTestId } = render(<WithMetricsWrapperApp query={query} />);
    act(() => {
      resolveMetadata(fakeMetadata);
      resolveDataset([]);
    });

    expect(mockLoadDataset).toHaveBeenCalledTimes(0);
    expect(await findByTestId("WithLoadingOrErrorUI-error")).toHaveTextContent(
      "Oops, something went wrong"
    );
  });
});
