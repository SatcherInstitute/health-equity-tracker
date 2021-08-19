import React from "react";
import { render } from "@testing-library/react";
import { DatasetMetadata, Row } from "../utils/DatasetTypes";
import { act } from "react-dom/test-utils";
import { MetricQuery } from "../query/MetricQuery";
import { Breakdowns } from "../query/Breakdowns";
import { FakeDatasetMetadataMap } from "../config/FakeDatasetMetadata";
import { WithMetrics } from "./WithLoadingOrErrorUI";
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from "../../utils/globals";
import FakeDataFetcher from "../../testing/FakeDataFetcher";
import { excludeAll } from "../query/BreakdownFilter";

const STATE_NAMES_ID = "state_names";
const ANOTHER_FAKE_DATASET_ID = "fake_dataset_2";
const fakeMetadata = {
  ...FakeDatasetMetadataMap,
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

describe("WithLoadingOrErrorUI", () => {
  beforeEach(() => {
    resetCacheDebug();
    dataFetcher.resetState();
  });

  test("WithMetrics: Loads metrics", async () => {
    const query = new MetricQuery(
      "copd_pct",
      Breakdowns.byState().andRace(excludeAll())
    );

    expect(dataFetcher.getNumGetMetdataCalls()).toBe(0);
    const { findByTestId } = render(
      <WithMetricsWrapperApp
        query={query}
        displayRow={(row: Row) =>
          `${row.race_and_ethnicity}: ${row.copd_pct}. `
        }
      />
    );
    act(() => {
      dataFetcher.setFakeMetadataLoaded(fakeMetadata);
      dataFetcher.setFakeDatasetLoaded("acs_population-by_race_state_std", []);
      dataFetcher.setFakeDatasetLoaded("uhc_data-race_and_ethnicity", [
        {
          state_name: "Alabama",
          race_and_ethnicity: "AmIn",
          copd_pct: 20,
        },
        { state_name: "Alabama", race_and_ethnicity: "Asian", copd_pct: 1 },
        { state_name: "Alabama", race_and_ethnicity: "All", copd_pct: 1 },
      ]);
    });

    expect(await findByTestId("MetricQueryResponseReturned")).toHaveTextContent(
      "Loaded 2 rows. AmIn: 20. Asian: 1."
    );
    expect(dataFetcher.getNumLoadDatasetCalls()).toBe(2);
  });

  // TODO - one succesful dataset, one bad dataset

  test("WithMetrics: Loaded metrics have no rows", async () => {
    const query = new MetricQuery(
      "diabetes_pct",
      Breakdowns.national().andRace()
    );

    expect(dataFetcher.getNumGetMetdataCalls()).toBe(0);
    const { findByTestId } = render(<WithMetricsWrapperApp query={query} />);
    act(() => {
      dataFetcher.setFakeMetadataLoaded(fakeMetadata);
      dataFetcher.setFakeDatasetLoaded("acs_population-by_race_state_std", []);
      dataFetcher.setFakeDatasetLoaded("uhc_data-race_and_ethnicity", []);
    });

    expect(await findByTestId("MetricQueryResponseReturned")).toHaveTextContent(
      "Error: No rows returned"
    );
    expect(dataFetcher.getNumLoadDatasetCalls()).toBe(2);
  });

  test("WithMetrics: Unsupported breakdown", async () => {
    const query = new MetricQuery(
      "diabetes_pct",
      Breakdowns.byCounty().andAge()
    );

    expect(dataFetcher.getNumGetMetdataCalls()).toBe(0);
    const { findByTestId } = render(<WithMetricsWrapperApp query={query} />);
    act(() => {
      dataFetcher.setFakeMetadataLoaded(fakeMetadata);
      dataFetcher.setFakeDatasetLoaded("acs_population-by_age_county", []);
      dataFetcher.setFakeDatasetLoaded("uhc_data-race_and_ethnicity", []);
    });

    expect(await findByTestId("MetricQueryResponseReturned")).toHaveTextContent(
      "Error: Breakdowns not supported for provider brfss_provider: age:no filters,geography:county"
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
