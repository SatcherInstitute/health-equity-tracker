import { Fips } from '../data/utils/Fips'
import { generateChartTitle, generateSubtitle, getAltGroupLabel } from './utils'

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
      'sex'
    )
    expect(titleForUnknown).toEqual(
      'Some title XYZ with unknown sex in the United States'
    )
  })

  test('PHRMA subtitle', () => {
    const subTitle = generateSubtitle(
      'Male',
      'sex',
      'statins_adherence_pct_rate'
    )
    expect(subTitle).toEqual('Male, Medicare beneficiaries')
  })

  test('Standard subtitle', () => {
    const subTitle = generateSubtitle('Male', 'sex', 'uninsured_per_100k')
    expect(subTitle).toEqual('Male')
  })
})

describe('Tests generateSubtitle()', () => {
  test('HIV subtitle', () => {
    const subTitle = generateSubtitle('Male', 'sex', 'hiv_deaths_per_100k')
    expect(subTitle).toEqual('Male, Ages 13+')
  })

  test('PHRMA subtitle', () => {
    const subTitle = generateSubtitle(
      'Male',
      'sex',
      'statins_adherence_pct_rate'
    )
    expect(subTitle).toEqual('Male, Medicare beneficiaries')
  })

  test('Standard subtitle', () => {
    const subTitle = generateSubtitle('Male', 'sex', 'uninsured_per_100k')
    expect(subTitle).toEqual('Male')
  })
})

describe('Tests getAltGroupLabel()', () => {
  test('All by age prep', () => {
    const groupLabel = getAltGroupLabel(
      'All',
      'pct_share_of_women_us_congress',
      'race_and_ethnicity'
    )
    expect(groupLabel).toEqual('All women')
  })
  test('All by age prep', () => {
    const groupLabel = getAltGroupLabel('All', 'hiv_prep_coverage', 'age')
    expect(groupLabel).toEqual('All (16+)')
  })

  test('Standard group pass through', () => {
    const groupLabel = getAltGroupLabel('Some group', 'prison_pct_share', 'sex')
    expect(groupLabel).toEqual('Some group')
  })
})
