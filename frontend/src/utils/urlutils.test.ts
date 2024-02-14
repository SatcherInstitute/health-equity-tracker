import { slugify } from './urlutils'

describe('slugify', () => {
  it('should convert a string to a slug', () => {
    expect(slugify('This is a test')).toBe('this-is-a-test')
  })
  it('should remove special characters', () => {
    expect(slugify('This is a test!')).toBe('this-is-a-test')
  })
})
