import { IncomeSorterStrategy } from './IncomeSorterStrategy'

describe('dataset utils test - IncomeSorterStrategy', () => {
  const ALL_INCOME = { income: 'All' }
  const I15_25K = { income: '$15k-$25k' }
  const I25_50K = { income: '$25k-$50k' }
  const I50_75K = { income: '$50k-$75k' }
  const I100_200K = { income: '$100k-$200k' }
  const I200K_PLUS = { income: '$200k+' }

  beforeEach(() => {})

  test('empty array', async () => {
    const data: any = []
    new IncomeSorterStrategy(['All'])
    expect(data).toStrictEqual([])
  })

  test('single income - all', async () => {
    const data: any = [ALL_INCOME]
    data.sort(new IncomeSorterStrategy(['All']).compareFn)
    expect(data).toStrictEqual([ALL_INCOME])
  })

  test('already sorted income range', async () => {
    const data: any = [ALL_INCOME, I15_25K]
    data.sort(new IncomeSorterStrategy(['All']).compareFn)
    expect(data).toStrictEqual([ALL_INCOME, I15_25K])
  })

  test('reversed income range', async () => {
    const data: any = [I15_25K, ALL_INCOME]
    data.sort(new IncomeSorterStrategy(['All']).compareFn)
    expect(data).toStrictEqual([ALL_INCOME, I15_25K])
  })

  test('unbounded sorted income range', async () => {
    const data: any = [I15_25K, I200K_PLUS]
    data.sort(new IncomeSorterStrategy(['All']).compareFn)
    expect(data).toStrictEqual([I15_25K, I200K_PLUS])
  })

  test('unbounded reversed income range', async () => {
    const data: any = [I200K_PLUS, I15_25K]
    data.sort(new IncomeSorterStrategy(['All']).compareFn)
    expect(data).toStrictEqual([I15_25K, I200K_PLUS])
  })

  test('real life income sorting use case', async () => {
    const data: any = [
      I50_75K,
      I200K_PLUS,
      I15_25K,
      I25_50K,
      ALL_INCOME,
      I100_200K,
    ]
    data.sort(new IncomeSorterStrategy(['All']).compareFn)
    expect(data).toStrictEqual([
      ALL_INCOME,
      I15_25K,
      I25_50K,
      I50_75K,
      I100_200K,
      I200K_PLUS,
    ])
  })
})
