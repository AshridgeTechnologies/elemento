import DateType from '../../../src/shared/types/DateType'
import Rule from '../../../src/shared/types/Rule'
import {expect} from 'expect'

const date1 = new Date('2020-04-06')
const date2 = new Date('2020-04-21')
const tooEarly = new Date('2020-04-04')
const justRight = new Date('2020-04-14')
const wrongDay = new Date('2020-04-08')
const invalidDate = new Date(NaN)
const type = new DateType('Start date', {required: true, min: date1, max: date2, description: 'Date when the employee starts'}, [
    new Rule('Monday-Tuesday', (item: Date) => item.getDay() === 1 || item.getDay() === 2, {description: 'Must be a Monday or a Tuesday'})
])

test('has expected properties', () => {
    expect(type.kind).toBe('Date')
    expect(type.required).toBe(true)
    expect(type.min).toBe(date1)
    expect(type.max).toBe(date2)
    expect(type.description).toBe('Date when the employee starts')
    expect(type.ruleDescriptions).toStrictEqual(['Required', 'Earliest 06 Apr 2020', 'Latest 21 Apr 2020', 'Must be a Monday or a Tuesday'])
})

test('validates null ok if optional', () => {
    const type = new DateType('Optional date')
    expect(type.validate(null)).toBe(null)
})

test('validates using all rules', () => {
    expect(type.validate(null)).toStrictEqual(['Required'])
    expect(type.validate(invalidDate)).toStrictEqual(['Required'])
    expect(type.validate(date1)).toBe(null)
    expect(type.validate(justRight)).toBe(null)
    expect(type.validate(date2)).toBe(null)

    expect(type.validate(tooEarly)).toStrictEqual(['Earliest 06 Apr 2020', 'Must be a Monday or a Tuesday'])
    expect(type.validate(wrongDay)).toStrictEqual(['Must be a Monday or a Tuesday'])
})
