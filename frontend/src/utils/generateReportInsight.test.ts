import { parseSections } from './generateReportInsight'

const SECTIONS = {
  keyFindings: 'Black residents carry nearly twice the burden.',
  locationComparison: 'Fulton sits above the typical Georgia county.',
  demographicInsights: 'The gap widens among adults under 45.',
  whatThisMeans: 'More people go untreated where testing is furthest away.',
}

describe('parseSections', () => {
  test('reads a bare JSON object', () => {
    expect(parseSections(JSON.stringify(SECTIONS))).toEqual(SECTIONS)
  })

  test('reads a fenced block, which is how the model usually replies', () => {
    const raw = '```json\n' + JSON.stringify(SECTIONS, null, 2) + '\n```'
    expect(parseSections(raw)).toEqual(SECTIONS)
  })

  test('drops keys the report card does not render', () => {
    const raw = JSON.stringify({ ...SECTIONS, extraSection: 'ignored' })
    expect(parseSections(raw)).toEqual(SECTIONS)
  })

  // A renamed section in the server template lands here. Returning null rather
  // than a partial object is what keeps the card from rendering blank sections.
  test('returns null when a section is missing', () => {
    const { whatThisMeans, ...missing } = SECTIONS
    expect(parseSections(JSON.stringify(missing))).toBeNull()
  })

  test('returns null when a section is not a string', () => {
    const raw = JSON.stringify({ ...SECTIONS, keyFindings: 42 })
    expect(parseSections(raw)).toBeNull()
  })

  test('returns null on malformed JSON', () => {
    expect(parseSections('not json at all')).toBeNull()
    expect(parseSections('')).toBeNull()
  })
})
