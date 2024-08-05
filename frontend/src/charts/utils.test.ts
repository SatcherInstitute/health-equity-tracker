import { HIV_DISEASE_METRICS } from '../data/config/MetricConfigHivCategory'
import { PHRMA_CARDIOVASCULAR_METRICS } from '../data/config/MetricConfigPhrma'
import {
  PREVENTABLE_HOSP_METRICS,
  UNINSURANCE_METRICS,
} from '../data/config/MetricConfigSDOH'
import { Fips } from '../data/utils/Fips'
import { generateChartTitle, generateSubtitle } from './utils'
import { describe, test, expect } from 'vitest'

describe('Tests generateChartTitle()', () => {
  test('Chart title (standard state)', () => {
    const title = generateChartTitle('Some title XYZ', new Fips('01'))
    expect(title).toEqual('Some title XYZ in Alabama')
  })

  test('Chart title (standard county)', () => {
    const title = generateChartTitle('Some title XYZ', new Fips('01001'))
    expect(title).toEqual('Some title XYZ in Autauga County, Alabama')
  })

  test('Chart title (with unknown demo)', () => {
    const titleForUnknown = generateChartTitle(
      'Some title XYZ',
      new Fips('00'),
      'sex',
    )
    expect(titleForUnknown).toEqual(
      'Some title XYZ with unknown sex in the United States',
    )
  })

  test('preventable hosp. subtitle', () => {
    const subTitle = generateSubtitle(
      'Male',
      'sex',
      PREVENTABLE_HOSP_METRICS[0],
    )
    expect(subTitle).toEqual('Medicare beneficiaries, Ages 18+, Male')
  })

  test('PHRMA subtitle', () => {
    const subTitle = generateSubtitle(
      'Male',
      'sex',
      PHRMA_CARDIOVASCULAR_METRICS[0],
    )
    expect(subTitle).toEqual(
      'Medicare Beta-Blocker Beneficiaries, Male, Ages 18+',
    )
  })

  test('Standard subtitle', () => {
    const subTitle = generateSubtitle('Male', 'sex', UNINSURANCE_METRICS[0])
    expect(subTitle).toEqual('Male')
  })
})

describe('Tests generateSubtitle()', () => {
  test('HIV subtitle', () => {
    const subTitle = generateSubtitle('Male', 'sex', HIV_DISEASE_METRICS[2])
    expect(subTitle).toEqual('Male, Ages 13+')
  })
})
