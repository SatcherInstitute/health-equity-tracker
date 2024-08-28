import { render } from '@testing-library/react'
import type { DatasetMetadata, Row } from '../utils/DatasetTypes'
import { act } from 'react'
import { MetricQuery } from '../query/MetricQuery'
import { Breakdowns } from '../query/Breakdowns'
import { DatasetMetadataMap } from '../config/DatasetMetadata'
import { WithMetrics } from './WithLoadingOrErrorUI'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import type FakeDataFetcher from '../../testing/FakeDataFetcher'
import { excludeAll } from '../query/BreakdownFilter'
import { describe, test, expect, beforeEach } from 'vitest'

const STATE_NAMES_ID = 'state_names'
const ANOTHER_FAKE_DATASET_ID = 'fake_dataset_2'
const fakeMetadata = {
  ...DatasetMetadataMap,
  [STATE_NAMES_ID]: {} as DatasetMetadata,
  [ANOTHER_FAKE_DATASET_ID]: {} as DatasetMetadata,
}

autoInitGlobals()

function WithMetricsWrapperApp(props: {
  query: MetricQuery
  displayRow?: (row: Row) => void
}) {
  return (
    <WithMetrics queries={[props.query]}>
      {([response]) => {
        return (
          <div data-testid='MetricQueryResponseReturned'>
            {response.dataIsMissing() && (
              <>Error: {response.missingDataMessage!}</>
            )}
            {!response.dataIsMissing() && (
              <>
                Loaded {response.data.length} rows.{' '}
                {props.displayRow !== undefined &&
                  response.data.map((row) => props.displayRow!(row))}
              </>
            )}
          </div>
        )
      }}
    </WithMetrics>
  )
}

const dataFetcher = getDataFetcher() as FakeDataFetcher

describe('WithLoadingOrErrorUI', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
  })

  test('WithMetrics: Loads metrics', async () => {
    const query = new MetricQuery(
      'copd_per_100k',
      Breakdowns.byState().andRace(excludeAll()),
    )

    expect(dataFetcher.getNumGetMetadataCalls()).toBe(0)
    const { findByTestId } = render(
      <WithMetricsWrapperApp
        query={query}
        displayRow={(row: Row) =>
          `${row.race_and_ethnicity}: ${row.copd_per_100k}. `
        }
      />,
    )

    act(() => {
      dataFetcher.setFakeMetadataLoaded(fakeMetadata)
      dataFetcher.setFakeDatasetLoaded('acs_population-by_race_state', [])
      dataFetcher.setFakeDatasetLoaded(
        'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_state_current',
        [
          {
            state_name: 'Alabama',
            race_and_ethnicity: 'AmIn',
            copd_per_100k: 20000,
          },
          {
            state_name: 'Alabama',
            race_and_ethnicity: 'Asian',
            copd_per_100k: 1000,
          },
          {
            state_name: 'Alabama',
            race_and_ethnicity: 'All',
            copd_per_100k: 1000,
          },
        ],
      )
    })

    const element = await findByTestId('MetricQueryResponseReturned')
    expect(element).not.toBeNull() // Equivalent to toBeInTheDocument
    expect(element.textContent).toContain(
      'Loaded 2 rows. AmIn: 20000. Asian: 1000.',
    )
    expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)
  })

  // TODO: one successful dataset, one bad dataset

  test('WithMetrics: Loaded metrics have no rows', async () => {
    const query = new MetricQuery(
      'depression_per_100k',
      Breakdowns.national().andRace(),
    )

    expect(dataFetcher.getNumGetMetadataCalls()).toBe(0)
    const { findByTestId } = render(<WithMetricsWrapperApp query={query} />)
    act(() => {
      dataFetcher.setFakeMetadataLoaded(fakeMetadata)
      dataFetcher.setFakeDatasetLoaded('acs_population-by_race_national', [])
      dataFetcher.setFakeDatasetLoaded(
        'graphql_ahr_data-non-behavioral_health_race_and_ethnicity_national_current',
        [],
      )
    })

    const element = await findByTestId('MetricQueryResponseReturned')
    expect(element).not.toBeNull() // Equivalent to toBeInTheDocument
    expect(element.textContent).toContain('Error: No rows returned')
    expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)
  })

  test('WithMetrics: Unsupported breakdown', async () => {
    const query = new MetricQuery(
      'depression_per_100k',
      Breakdowns.byCounty().andAge(),
    )

    expect(dataFetcher.getNumGetMetadataCalls()).toBe(0)
    const { findByTestId } = render(<WithMetricsWrapperApp query={query} />)
    act(() => {
      dataFetcher.setFakeMetadataLoaded(fakeMetadata)
      dataFetcher.setFakeDatasetLoaded('acs_population-by_age_county', [])
      dataFetcher.setFakeDatasetLoaded('ahr_data-race_and_ethnicity' as any, [])
    })

    const element = await findByTestId('MetricQueryResponseReturned')
    expect(element).not.toBeNull() // Equivalent to toBeInTheDocument
    expect(element.textContent).toContain(
      'Error: Breakdowns not supported for provider ahr_provider: age:no filters,geography:county',
    )
    expect(dataFetcher.getNumLoadDatasetCalls()).toBe(0)
  })

  test("WithMetrics: Dataset doesn't exist", async () => {
    const query = new MetricQuery(
      //@ts-ignore - metric ID should be invalid for this test
      'fake_metric_doesnt_exist',
      Breakdowns.national(),
    )

    expect(dataFetcher.getNumGetMetadataCalls()).toBe(0)
    const { findByTestId } = render(<WithMetricsWrapperApp query={query} />)

    const element = await findByTestId('WithLoadingOrErrorUI-error')
    expect(element).not.toBeNull() // Equivalent to toBeInTheDocument
    expect(element.textContent).toContain('Oops, something went wrong')
    expect(dataFetcher.getNumLoadDatasetCalls()).toBe(0)
  })
})
