import { render } from '@testing-library/react'
import { act } from 'react'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'
import type { DatasetMetadata } from '../../data/utils/DatasetTypes'
import type FakeDataFetcher from '../../testing/FakeDataFetcher'
import { autoInitGlobals, getDataFetcher } from '../../utils/globals'
import DataCatalogPage from './DataCatalogPage'

const ACS_DATASET_METADATA: DatasetMetadata = {
  name: 'ACS Population by Age and County',
  original_data_sourced: 'original_data_sourced',
  source_id: 'acs',
}

autoInitGlobals()

test('Data catalog page renders all data sources', async () => {
  const dataFetcher = getDataFetcher() as FakeDataFetcher

  const { queryByText, findByTestId } = render(
    <MemoryRouter initialEntries={['/']}>
      <DataCatalogPage />,
    </MemoryRouter>,
  )

  act(() => {
    dataFetcher.setFakeMetadataLoaded({
      state_names: ACS_DATASET_METADATA,
    })
  })

  expect(dataFetcher.getNumGetMetadataCalls()).toBe(1)
  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(0)

  const viewAllDatasets = await queryByText('View All Datasets')
  const acs = await findByTestId('acs')
  const covidTrackingProject = await findByTestId('covid_tracking_project')
  const ahr = await findByTestId('ahr')

  expect(viewAllDatasets).toBeNull() // Equivalent to not.toBeInTheDocument()
  expect(acs).not.toBeNull() // Equivalent to toBeInTheDocument()
  expect(covidTrackingProject).not.toBeNull() // Equivalent to toBeInTheDocument()
  expect(ahr).not.toBeNull() // Equivalent to toBeInTheDocument()
})

test('Data catalog page renders subset of data sources', async () => {
  const dataFetcher = getDataFetcher() as FakeDataFetcher

  const { findByText, findByTestId, queryByTestId } = render(
    <MemoryRouter initialEntries={['/exploredata?dpf=acs']}>
      <DataCatalogPage />
    </MemoryRouter>,
  )

  act(() => {
    dataFetcher.setFakeMetadataLoaded({
      state_names: ACS_DATASET_METADATA,
    })
  })

  expect(dataFetcher.getNumGetMetadataCalls()).toBe(1)
  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(0)

  const viewAllDatasets = await findByText('View All Datasets')
  const acs = await findByTestId('acs')
  const covidTrackingProject = await queryByTestId('covid_tracking_project')
  const ahr = await queryByTestId('ahr')

  expect(viewAllDatasets).not.toBeNull() // Equivalent to toBeInTheDocument()
  expect(acs).not.toBeNull() // Equivalent to toBeInTheDocument()
  expect(covidTrackingProject).toBeNull() // Equivalent to not.toBeInTheDocument()
  expect(ahr).toBeNull() // Equivalent to not.toBeInTheDocument()
})
