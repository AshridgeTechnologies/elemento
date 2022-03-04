import {isNumeric} from '../../src/util/helpers'

test('isNumeric gives correct result for all strings', () => {
     expect(isNumeric('a')).toBe(false)
     expect(isNumeric('abc')).toBe(false)
     expect(isNumeric('abc12')).toBe(false)
     expect(isNumeric('12abc')).toBe(false)
     expect(isNumeric('')).toBe(false)
     expect(isNumeric('0')).toBe(true)
     expect(isNumeric('1')).toBe(true)
     expect(isNumeric('12')).toBe(true)
     expect(isNumeric('12.')).toBe(true)
     expect(isNumeric('12.89')).toBe(true)
     expect(isNumeric('.89')).toBe(true)
})