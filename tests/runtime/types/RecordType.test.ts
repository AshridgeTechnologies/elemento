import TextType from '../../../src/shared/types/TextType'
import Rule from '../../../src/shared/types/Rule'
import {expect} from 'expect'
import RecordType from '../../../src/shared/types/RecordType'
import {isNil} from 'ramda'

const nameType = new TextType('Name', {required: true, description: 'Customers full name', minLength: 2})
const countryType = new TextType('Home Country', {maxLength: 2})
const postcodeType = new TextType('Postcode')
const type = new RecordType('Customer', {description: 'A customer who has ordered'}, [
    new Rule('UK postcodes', (item: any) => item.HomeCountry !== 'UK' || !isNil(item.Postcode),
    {description: 'If country is UK postcode is required'})
], [
    nameType,
    countryType,
    postcodeType,
])

test('has expected properties', () => {

    expect(type.kind).toBe('Record')
    expect(type.required).toBe(false)
    expect(type.description).toBe('A customer who has ordered')
    expect(type.fields).toStrictEqual([nameType, countryType, postcodeType])
    expect(type.ruleDescriptions).toStrictEqual(['Optional', 'If country is UK postcode is required'])
})

test('validates all fields', () => {
    expect(type.validate(null)).toBe(null)
    expect(type.validate({
        HomeCountry: 'Yorkshire'
    })).toStrictEqual({
        Name: ['Required'],
        HomeCountry: ['Maximum length 2']
        }
    )
})

test('validates across fields', () => {
    expect(type.validate({
        Name: 'Jodie Foster',
        HomeCountry: 'UK'
    })).toStrictEqual({
        _self: ['If country is UK postcode is required']
        }
    )
})

test('checks correct data type', () => {
    const clazz = class A {}
    expect(type.isCorrectDataType({a: 10})).toBe(true)
    expect(type.isCorrectDataType(10)).toBe(false)
    expect(type.isCorrectDataType(new Date())).toBe(false)
    expect(type.isCorrectDataType(clazz)).toBe(false)
})