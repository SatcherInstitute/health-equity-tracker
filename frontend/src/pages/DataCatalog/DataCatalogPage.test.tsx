import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import DataCatalogPage from './DataCatalogPage';
import { autoInitGlobals, getDataFetcher } from '../../utils/globals';
import FakeDataFetcher from '../../testing/FakeDataFetcher';
import { type DatasetMetadata } from '../../data/utils/DatasetTypes';
import { render } from '@testing-library/react';
import { act } from 'react';
import { test, expect } from 'vitest';

const ACS_DATASET_METADATA: DatasetMetadata = {
  name: 'ACS Population by Age and County',
  original_data_sourced: 'original_data_sourced',
  source_id: 'acs',
};

autoInitGlobals();

test('Data catalog page renders all data sources', async () => {
  const dataFetcher = getDataFetcher() as FakeDataFetcher;
  const history = createMemoryHistory();

  const { queryByText, findByTestId } = render(
    <Router history={history}>
      <DataCatalogPage />
    </Router>
  );

  act(() => {
    dataFetcher.setFakeMetadataLoaded({
      state_names: ACS_DATASET_METADATA,
    });
  });

  expect(dataFetcher.getNumGetMetadataCalls()).toBe(1);
  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(0);

  const viewAllDatasets = await queryByText('View All Datasets');
  const acs = await findByTestId('acs');
  const covidTrackingProject = await findByTestId('covid_tracking_project');
  const ahr = await findByTestId('ahr');

  expect(viewAllDatasets).toBeNull(); // Equivalent to not.toBeInTheDocument()
  expect(acs).not.toBeNull(); // Equivalent to toBeInTheDocument()
  expect(covidTrackingProject).not.toBeNull(); // Equivalent to toBeInTheDocument()
  expect(ahr).not.toBeNull(); // Equivalent to toBeInTheDocument()
});

test('Data catalog page renders subset of data sources', async () => {
  const dataFetcher = getDataFetcher() as FakeDataFetcher;
  const history = createMemoryHistory({
    initialEntries: ['/exploredata?dpf=acs'],
  });

  const { findByText, findByTestId, queryByTestId } = render(
    <Router history={history}>
      <DataCatalogPage />
    </Router>
  );

  act(() => {
    dataFetcher.setFakeMetadataLoaded({
      state_names: ACS_DATASET_METADATA,
    });
  });

  expect(dataFetcher.getNumGetMetadataCalls()).toBe(1);
  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(0);

  const viewAllDatasets = await findByText('View All Datasets');
  const acs = await findByTestId('acs');
  const covidTrackingProject = await queryByTestId('covid_tracking_project');
  const ahr = await queryByTestId('ahr');

  expect(viewAllDatasets).not.toBeNull(); // Equivalent to toBeInTheDocument()
  expect(acs).not.toBeNull(); // Equivalent to toBeInTheDocument()
  expect(covidTrackingProject).toBeNull(); // Equivalent to not.toBeInTheDocument()
  expect(ahr).toBeNull(); // Equivalent to not.toBeInTheDocument()
});
