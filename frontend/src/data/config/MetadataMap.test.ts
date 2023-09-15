import { dataSourceMetadataList } from './MetadataMap'
import { DatasetId, DatasetMetadataMap } from './DatasetMetadata'
import { SHOW_PHRMA } from '../providers/PhrmaProvider'

describe('Test Data Source URLs', () => {
  test('Links all use HTTPS', () => {
    for (const source in dataSourceMetadataList) {
      const testUrl = dataSourceMetadataList[source].data_source_link
      expect(testUrl.slice(0, 8)).toEqual('https://')
    }
  })
})

describe('Test Data Source IDs', () => {
  const datasetMetadaIds = Object.keys(DatasetMetadataMap)

  const dataSourceMetadataIds: DatasetId[] = ['geographies']
  for (const item of dataSourceMetadataList) {
    dataSourceMetadataIds.push(...item.dataset_ids)
  }

  const uniqueDataSourceMetadataIds: DatasetId[] = [
    ...new Set(dataSourceMetadataIds),
  ]

  test('There are no extra datasetMetadaIds', () => {
    const extraIdsFromDatasetMetadaIds = datasetMetadaIds.filter(
      (id) => !uniqueDataSourceMetadataIds.includes(id as DatasetId)
    )
    if (SHOW_PHRMA) expect(extraIdsFromDatasetMetadaIds).toEqual([])
  })
  test('There are no extra dataSourceMetadataIds', () => {
    const extraIdsFromDataSourceMetadaIds = uniqueDataSourceMetadataIds.filter(
      (id) => !datasetMetadaIds.includes(id as DatasetId)
    )

    if (SHOW_PHRMA) expect(extraIdsFromDataSourceMetadaIds).toEqual([])
  })
})
