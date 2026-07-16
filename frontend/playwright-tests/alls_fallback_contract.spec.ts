import { DatasetMetadataMap } from '../src/data/config/DatasetMetadata'
import { expect, test } from './utils/fixtures'

// Contract guard for the ALLs fallback (issue #4962).
//
// Every registered `alls_` DatasetId is a promise that the exporter actually
// writes that file to GCS. When a demographic dataset is missing, the frontend
// silently resolves to its `alls_` sibling (see resolveDatasetId in
// MetricQuery.ts), so a registered-but-never-exported id is invisible until a
// user hits it and the server 500s. That is exactly how the NCI (#4960) and AHR
// non-behavioral (#4961) files slipped through.
//
// This nightly probe fetches each registered `alls_` id from the API and fails
// if any does not serve 200, turning a silent prod 500 into a red nightly run.

const API_BASE =
  process.env.HET_ALLS_API_URL ?? 'https://dev.healthequitytracker.org'

const allsDatasetIds = Object.keys(DatasetMetadataMap).filter((id) =>
  /[-_]alls_/.test(id),
)

test('every registered alls_ DatasetId is exported', async ({ request }) => {
  expect(
    allsDatasetIds.length,
    'expected at least one registered alls_ DatasetId',
  ).toBeGreaterThan(0)

  const missing: string[] = []

  await Promise.all(
    allsDatasetIds.map(async (id) => {
      const resp = await request.get(`${API_BASE}/api/dataset?name=${id}.json`)
      if (resp.status() !== 200) {
        missing.push(`${id} → ${resp.status()}`)
      }
    }),
  )

  expect(
    missing,
    `Registered alls_ ids that do not serve 200 (registered but not exported):\n${missing.join('\n')}`,
  ).toEqual([])
})
