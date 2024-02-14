import React from 'react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import DataCatalogPage from './DataCatalogPage'
import { autoInitGlobals, getDataFetcher } from '../../utils/globals'
import FakeDataFetcher from '../../testing/FakeDataFetcher'
import { type DatasetMetadata } from '../../data/utils/DatasetTypes'
import { render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { test, expect } from 'vitest'
import '@testing-library/jest-dom/extend-expect'

const ACS_DATASET_METADATA: DatasetMetadata = {
  name: 'ACS Population by Age and County',
  original_data_sourced: 'original_data_sourced',
  source_id: 'acs',
}

autoInitGlobals()

test('Data catalog page renders all data sources', async () => {
  const dataFetcher = getDataFetcher() as FakeDataFetcher
  const history = createMemoryHistory()

  const { queryByText, findByTestId } = render(
    <Router history={history}>
      <DataCatalogPage />
    </Router>
  )

  act(() => {
    dataFetcher.setFakeMetadataLoaded({
      state_names: ACS_DATASET_METADATA,
    })
  })

  expect(dataFetcher.getNumGetMetadataCalls()).toBe(1)
  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(0)
  expect(await queryByText('View All Datasets')).not.toBeInTheDocument()
  expect(await findByTestId('acs')).toBeInTheDocument()
  expect(await findByTestId('covid_tracking_project')).toBeInTheDocument()
  expect(await findByTestId('ahr')).toBeInTheDocument()
})

test('Data catalog page renders subset of data sources', async () => {
  const dataFetcher = getDataFetcher() as FakeDataFetcher
  const history = createMemoryHistory({
    initialEntries: ['/exploredata?dpf=acs'],
  })

  const { findByText, findByTestId, queryByTestId } = render(
    <Router history={history}>
      <DataCatalogPage />
    </Router>
  )

  act(() => {
    dataFetcher.setFakeMetadataLoaded({
      state_names: ACS_DATASET_METADATA,
    })
  })

  expect(dataFetcher.getNumGetMetadataCalls()).toBe(1)
  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(0)
  expect(await findByText('View All Datasets')).toBeInTheDocument()
  expect(await findByTestId('acs')).toBeInTheDocument()
  expect(await queryByTestId('covid_tracking_project')).not.toBeInTheDocument()
  expect(await queryByTestId('ahr')).not.toBeInTheDocument()
})
