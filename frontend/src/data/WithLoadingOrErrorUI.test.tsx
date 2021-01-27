import React from "react";
import { render } from "@testing-library/react";
import { DatasetMetadata, Row } from "./DatasetTypes";
import { act } from "react-dom/test-utils";
import { MetricQuery } from "../data/MetricQuery";
import { Breakdowns } from "../data/Breakdowns";
import FakeMetadataMap from "./FakeMetadataMap";
import { WithMetrics } from "./WithLoadingOrErrorUI";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../utils/globals";
import FakeDataFetcher from "../testing/FakeDataFetcher";

const STATE_NAMES_ID = "state_names";
const ANOTHER_FAKE_DATASET_ID = "fake_dataset_2";
const fakeMetadata = {
  ...FakeMetadataMap,
  [STATE_NAMES_ID]: {} as DatasetMetadata,
  [ANOTHER_FAKE_DATASET_ID]: {} as DatasetMetadata,
};

autoInitGlobals();

function WithMetricsWrapperApp(props: {
  query: MetricQuery;
  displayRow?: (row: Row) => void;
}) {
  return (
    <WithMetrics queries={[props.query]}>
      {([response]) => {
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

const dataFetcher = getDataFetcher() as FakeDataFetcher;

describe("useDatasetStore", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
  });

  test("WithMetrics: Loads metrics", async () => {
    const query = new MetricQuery(
      "copd_count",
      Breakdowns.national().andRace()
    );

    expect(dataFetcher.getNumGetMetdataCalls()).toBe(0);
    const { findByTestId } = render(
      <WithMetricsWrapperApp
        query={query}
        displayRow={(row: Row) =>
          `${row.race_and_ethnicity}: ${row.copd_count}. `
        }
      />
    );
    act(() => {
      dataFetcher.setFakeMetadataLoaded(fakeMetadata);
      dataFetcher.setFakeDatasetLoaded("brfss", [
        {
          state_name: "Alabama",
          race_and_ethnicity: "AmIn",
          copd_count: 20,
        },
        { state_name: "Alabama", race_and_ethnicity: "Asian", copd_count: 1 },
      ]);
    });

    expect(await findByTestId("MetricQueryResponseReturned")).toHaveTextContent(
      "Loaded 2 rows. AmIn: 20. Asian: 1."
    );
    expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1);
  });

  // TODO - one succesful dataset, one bad dataset

  test("WithMetrics: Loaded metrics have no rows", async () => {
    const query = new MetricQuery(
      "diabetes_count",
      Breakdowns.national().andRace()
    );

    expect(dataFetcher.getNumGetMetdataCalls()).toBe(0);
    const { findByTestId } = render(<WithMetricsWrapperApp query={query} />);
    act(() => {
      dataFetcher.setFakeMetadataLoaded(fakeMetadata);
      dataFetcher.setFakeDatasetLoaded("brfss", []);
    });

    expect(await findByTestId("MetricQueryResponseReturned")).toHaveTextContent(
      "Error: No rows returned"
    );
    expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1);
  });

  test("WithMetrics: Unsupported breakdown", async () => {
    const query = new MetricQuery(
      "diabetes_count",
      Breakdowns.byCounty().andAge()
    );

    expect(dataFetcher.getNumGetMetdataCalls()).toBe(0);
    const { findByTestId } = render(<WithMetricsWrapperApp query={query} />);
    act(() => {
      dataFetcher.setFakeMetadataLoaded(fakeMetadata);
      dataFetcher.setFakeDatasetLoaded("brfss", []);
    });

    expect(await findByTestId("MetricQueryResponseReturned")).toHaveTextContent(
      "Error: Breakdowns not supported for provider brfss_provider: age:without total,geography:county"
    );
    expect(dataFetcher.getNumLoadDatasetCalls()).toBe(0);
  });

  test("WithMetrics: Dataset doesn't exist", async () => {
    const query = new MetricQuery(
      //@ts-ignore - metric ID should be invalid for this test
      "fakemetricdoesntexist",
      Breakdowns.national()
    );

    expect(dataFetcher.getNumGetMetdataCalls()).toBe(0);
    const { findByTestId } = render(<WithMetricsWrapperApp query={query} />);

    expect(await findByTestId("WithLoadingOrErrorUI-error")).toHaveTextContent(
      "Oops, something went wrong"
    );
    expect(dataFetcher.getNumLoadDatasetCalls()).toBe(0);
  });
});
