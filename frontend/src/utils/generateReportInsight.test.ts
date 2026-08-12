import { parseSections } from './generateReportInsight'

const LEGACY = {
  keyFindings: 'Black residents carry nearly twice the burden.',
  locationComparison: 'Fulton sits above the typical Georgia county.',
  demographicInsights: 'The gap widens among adults under 45.',
  whatThisMeans: 'More people go untreated where testing is furthest away.',
}

const WRAPPED = {
  keyFindings: { text: LEGACY.keyFindings },
  locationComparison: { text: LEGACY.locationComparison },
  demographicInsights: { text: LEGACY.demographicInsights },
  whatThisMeans: { text: LEGACY.whatThisMeans },
}

describe('parseSections', () => {
  // The server sent bare strings before the highlight envelope shipped, and
  // every already-cached report insight is still in that shape.
  test('wraps a legacy object of bare strings', () => {
    expect(parseSections(JSON.stringify(LEGACY))).toEqual(WRAPPED)
  })

  test('reads the highlight envelope', () => {
    const raw = JSON.stringify({
      ...LEGACY,
      keyFindings: {
        text: LEGACY.keyFindings,
        highlight: 'nearly twice the burden',
      },
    })
    expect(parseSections(raw)).toEqual({
      ...WRAPPED,
      keyFindings: {
        text: LEGACY.keyFindings,
        highlight: 'nearly twice the burden',
      },
    })
  })

  test('reads a fenced block, which is how the model usually replies', () => {
    const raw = '```json\n' + JSON.stringify(LEGACY, null, 2) + '\n```'
    expect(parseSections(raw)).toEqual(WRAPPED)
  })

  test('drops keys the report card does not render', () => {
    const raw = JSON.stringify({ ...LEGACY, extraSection: 'ignored' })
    expect(parseSections(raw)).toEqual(WRAPPED)
  })

  // A renamed section in the server template lands here. Returning null rather
  // than a partial object is what keeps the card from rendering blank sections.
  test('returns null when a section is missing', () => {
    const { whatThisMeans, ...missing } = LEGACY
    expect(parseSections(JSON.stringify(missing))).toBeNull()
  })

  test('returns null when a section is not a string', () => {
    const raw = JSON.stringify({ ...LEGACY, keyFindings: 42 })
    expect(parseSections(raw)).toBeNull()
  })

  test('returns null on malformed JSON', () => {
    expect(parseSections('not json at all')).toBeNull()
    expect(parseSections('')).toBeNull()
  })
})
