import TextType from '../../../src/runtime/types/TextType'
import Rule from '../../../src/runtime/types/Rule'
import {expect} from 'expect'
import RecordType from '../../../src/runtime/types/RecordType'
import ListType from '../../../src/runtime/types/ListType'
import {isNil} from 'ramda'

const nameType = new TextType('Name', {required: true, description: 'Customers full name', minLength: 2})
const countryType = new TextType('Country', {maxLength: 2})
const postcodeType = new TextType('Postcode')
const customerType = new RecordType('Customer', {description: 'A customer who has ordered'}, [
    new Rule('UK postcodes', (item: any) => item.Country !== 'UK' || !isNil(item.Postcode),
        {description: 'If country is UK postcode is required'})
], [
    nameType,
    countryType,
    postcodeType,
])

let ukOnlyRule = new Rule('UK only', (list: any[]) => list.every( cust => cust.Country === 'UK'), {description: 'All customers must be in UK'})
const type = new ListType('CustomerList', {description: 'A collection of Customers'}, [ukOnlyRule], customerType)

test('has expected properties', () => {

    expect(type.kind).toBe('List')
    expect(type.required).toBe(false)
    expect(type.description).toBe('A collection of Customers')
    expect(type.itemType).toBe(customerType)
    expect(type.ruleDescriptions).toStrictEqual(['Optional', 'All customers must be in UK'])
})

test('validates null ok', () => {
    expect(type.validate(null)).toBe(null)
})

test('validates all items and own rules', () => {
    expect(type.validate([
        {Country: 'Yorkshire'},
        {Name: 'Aileen Bligh', Country: 'IE'},
        {Name: 'Lee Ward', Country: 'UK'},
    ])).toStrictEqual({
        _self: ['All customers must be in UK'],
        0: {
            Name: ['Required'],
            Country: ['Maximum length 2']
        },
        2: {
            _self: ['If country is UK postcode is required'],
        },
    })
})

test('checks correct data type', () => {
    const clazz = class A {}
    expect(type.isCorrectDataType(['x'])).toBe(true)
    expect(type.isCorrectDataType({a: 10})).toBe(false)
    expect(type.isCorrectDataType('10')).toBe(false)
    expect(type.isCorrectDataType(10)).toBe(false)
    expect(type.isCorrectDataType(true)).toBe(false)
    expect(type.isCorrectDataType(new Date())).toBe(false)
    expect(type.isCorrectDataType(clazz)).toBe(false)
})
