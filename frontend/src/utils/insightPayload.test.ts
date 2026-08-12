import { parseSingleInsight } from './insightPayload'

const TEXT = 'Black residents are nearly twice as likely to go without care.'

describe('parseSingleInsight', () => {
  test('reads the envelope', () => {
    const raw = JSON.stringify({
      insight: { text: TEXT, highlight: 'nearly twice as likely' },
    })
    expect(parseSingleInsight(raw)).toEqual({
      text: TEXT,
      highlight: 'nearly twice as likely',
    })
  })

  test('reads a fenced envelope', () => {
    const raw =
      '```json\n' + JSON.stringify({ insight: { text: TEXT } }) + '\n```'
    expect(parseSingleInsight(raw)).toEqual({ text: TEXT })
  })

  // Every card insight cached before the envelope shipped is a bare sentence.
  test('falls back to the raw sentence when the reply is not JSON', () => {
    expect(parseSingleInsight(`  ${TEXT}  `)).toEqual({ text: TEXT })
  })

  test('drops a highlight the model paraphrased instead of quoting', () => {
    const raw = JSON.stringify({
      insight: { text: TEXT, highlight: 'twice as likely to go untreated' },
    })
    expect(parseSingleInsight(raw)).toEqual({ text: TEXT })
  })

  test('drops a highlight that covers the whole sentence', () => {
    const raw = JSON.stringify({ insight: { text: TEXT, highlight: TEXT } })
    expect(parseSingleInsight(raw)).toEqual({ text: TEXT })
  })

  test('drops an empty highlight', () => {
    const raw = JSON.stringify({ insight: { text: TEXT, highlight: '' } })
    expect(parseSingleInsight(raw)).toEqual({ text: TEXT })
  })
})
