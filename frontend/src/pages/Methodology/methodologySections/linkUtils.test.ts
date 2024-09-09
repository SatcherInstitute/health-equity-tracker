import type { DropdownVarId } from '../../../data/config/DropDownIds'
import { buildTopicsString } from './linkUtils'

test('Test buildTopicsString(): Topics without sub DataTypes', () => {
  const chronicTopics: ReadonlyArray<DropdownVarId> = ['diabetes', 'copd']
  expect(buildTopicsString(chronicTopics)).toBe('Diabetes, COPD')
})
test('Test buildTopicsString(): Topic with sub DataTypes', () => {
  const covidTopic: ReadonlyArray<DropdownVarId> = ['covid']
  expect(buildTopicsString(covidTopic)).toBe(
    'COVID-19 (Cases, Deaths, Hospitalizations)',
  )
})
