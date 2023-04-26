import NumberType from '../../../src/runtime/types/NumberType'
import Rule from '../../../src/runtime/types/Rule'
import {expect} from 'expect'

const type = new NumberType('Product price', {required: true, min: 10, max: 20000, format: 'integer', description: 'Price of a product'}, [
    new Rule('Multiple of 10', (item: any) => item % 10 === 0, {description: 'Must be a multiple of 10'})
])

test('has expected properties', () => {
    expect(type.kind).toBe('Number')
    expect(type.required).toBe(true)
    expect(type.min).toBe(10)
    expect(type.max).toBe(20000)
    expect(type.format).toBe('integer')
    expect(type.description).toBe('Price of a product')
    expect(type.ruleDescriptions).toStrictEqual(['Required', 'Minimum 10', 'Maximum 20000', 'Must be a whole number', 'Must be a multiple of 10'])
})

test('validates using all rules', () => {
    expect(type.validate(null)).toStrictEqual(['Required'])
    expect(type.validate(30)).toBe(null)

    expect(type.validate(5)).toStrictEqual(['Minimum 10', 'Must be a multiple of 10'])
    expect(type.validate(55)).toStrictEqual(['Must be a multiple of 10'])
    expect(type.validate(20010)).toStrictEqual(['Maximum 20000'])
    expect(type.validate(51)).toStrictEqual(['Must be a multiple of 10'])
})

test('validates currency format', () => {
    const currencyType = new NumberType('Total price', {format: 'currency'})

    expect(currencyType.validate(null)).toBe(null)
    expect(currencyType.validate(20.111)).toStrictEqual(['Must be a currency amount'])
    expect(currencyType.validate(20)).toBe(null)
    expect(currencyType.validate(20.1)).toBe(null)
    expect(currencyType.validate(20.10)).toBe(null)
    expect(currencyType.validate(20.11)).toBe(null)
})