import { AgeSorterStrategy } from './AgeSorterStrategy'

describe('dataset utils test', () => {
  const ALL = { age: 'All' }
  const A0_4 = { age: '0-4' }
  const A5_9 = { age: '5-9' }
  const A11_20 = { age: '11-20' }
  const A20P = { age: '20+' }

  beforeEach(() => {})

  test('empty arr', async () => {
    const data: any = []
    new AgeSorterStrategy(['All'])
    expect(data).toStrictEqual([])
  })

  test('single ell all', async () => {
    const data: any = [ALL]
    data.sort(new AgeSorterStrategy(['All']).compareFn)
    expect(data).toStrictEqual([ALL])
  })

  test('single single sort sorted', async () => {
    const data: any = [ALL, A0_4]
    data.sort(new AgeSorterStrategy(['All']).compareFn)
    expect(data).toStrictEqual([ALL, A0_4])
  })

  test('single single sort reversed', async () => {
    const data: any = [A0_4, ALL]
    data.sort(new AgeSorterStrategy(['All']).compareFn)
    expect(data).toStrictEqual([ALL, A0_4])
  })

  test('testing single sort unbounded sorted', async () => {
    const data: any = [A0_4, A20P]
    data.sort(new AgeSorterStrategy(['All']).compareFn)
    expect(data).toStrictEqual([A0_4, A20P])
  })

  test('testing single sort unbounded reversed', async () => {
    const data: any = [A20P, A0_4]
    data.sort(new AgeSorterStrategy(['All']).compareFn)
    expect(data).toStrictEqual([A0_4, A20P])
  })

  test('testing real life usecase', async () => {
    const data: any = [A11_20, A20P, A0_4, A5_9, ALL]
    data.sort(new AgeSorterStrategy(['All']).compareFn)
    expect(data).toStrictEqual([ALL, A0_4, A5_9, A11_20, A20P])
  })
})
