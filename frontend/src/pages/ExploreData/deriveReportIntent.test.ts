import { deriveReportIntent } from './deriveReportIntent'

describe('deriveReportIntent()', () => {
  test('recovers topic and state from a full report URL', () => {
    const intent = deriveReportIntent(
      '?mls=1.diabetes-3.13&demo=race_and_ethnicity&group1=All',
    )
    expect(intent?.topicLabel).toBeTruthy()
    expect(intent?.placeLabel).toEqual('Georgia')
  })

  test('drops demo, group, and dt from the suggested link', () => {
    const intent = deriveReportIntent(
      '?mls=1.diabetes-3.13&demo=race_and_ethnicity&group1=All&dt1=diabetes',
    )
    expect(intent?.href).toEqual('/exploredata?mls=1.diabetes-3.13')
  })

  test('recovers a county place', () => {
    const intent = deriveReportIntent('?mls=1.diabetes-3.13121')
    expect(intent?.placeLabel).toEqual('Fulton')
  })

  test('reads the FIPS from index 5 in comparevars mode', () => {
    const intent = deriveReportIntent(
      '?mls=1.diabetes-3.poverty-5.13&mlp=comparevars',
    )
    expect(intent?.placeLabel).toEqual('Georgia')
    expect(intent?.href).toEqual('/exploredata?mls=1.diabetes-3.13')
  })

  test('falls back to national when the place is unrecoverable', () => {
    const intent = deriveReportIntent('?mls=1.diabetes-3.99999')
    expect(intent?.placeLabel).toBeUndefined()
    expect(intent?.href).toEqual('/exploredata?mls=1.diabetes-3.00')
  })

  test('returns null when the topic is not a real topic', () => {
    expect(deriveReportIntent('?mls=1.not_a_topic-3.13')).toBeNull()
  })

  test('returns null when mls is absent or empty', () => {
    expect(deriveReportIntent('?demo=race_and_ethnicity')).toBeNull()
    expect(deriveReportIntent('')).toBeNull()
  })

  test('does not throw on malformed mls', () => {
    expect(deriveReportIntent('?mls=%%%')).toBeNull()
    expect(deriveReportIntent('?mls=....---')).toBeNull()
    expect(deriveReportIntent('?mls=1.')).toBeNull()
  })
})
