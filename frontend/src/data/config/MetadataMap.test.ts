import { describe, expect, test } from 'vitest'
import { SHOW_PHRMA_MENTAL_HEALTH } from '../../featureFlags'
import { type DatasetId, DatasetMetadataMap } from './DatasetMetadata'
import { dataSourceMetadataMap } from './MetadataMap'

describe('Test Data Source URLs', () => {
  test('Links all use HTTPS', () => {
    Object.values(dataSourceMetadataMap).forEach((metadata) => {
      const testUrl = metadata.data_source_link
      console.info(testUrl, '--')

      expect(testUrl.slice(0, 8)).toEqual('https://')
    })
  })
})

describe('Test Data Source IDs', () => {
  const datasetMetadaIds = Object.keys(DatasetMetadataMap)

  const dataSourceMetadataIds: DatasetId[] = ['geographies']
  for (const item of Object.values(dataSourceMetadataMap)) {
    dataSourceMetadataIds.push(...item.dataset_ids)
  }

  const uniqueDataSourceMetadataIds: DatasetId[] = [
    ...new Set(dataSourceMetadataIds),
  ]

  test('There are no extra datasetMetadaIds', () => {
    const extraIdsFromDatasetMetadaIds = datasetMetadaIds.filter(
      (id) => !uniqueDataSourceMetadataIds.includes(id as DatasetId),
    )
    if (SHOW_PHRMA_MENTAL_HEALTH)
      expect(extraIdsFromDatasetMetadaIds).toEqual([])
  })
  test('There are no extra dataSourceMetadataIds', () => {
    const extraIdsFromDataSourceMetadaIds = uniqueDataSourceMetadataIds.filter(
      (id) => !datasetMetadaIds.includes(id as DatasetId),
    )

    if (SHOW_PHRMA_MENTAL_HEALTH)
      expect(extraIdsFromDataSourceMetadaIds).toEqual([])
  })
})
