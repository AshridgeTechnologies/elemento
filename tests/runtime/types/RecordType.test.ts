import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
import TextType from '../../../src/runtime/types/TextType'
import Rule from '../../../src/runtime/types/Rule'
import {expect} from 'expect'
import RecordType from '../../../src/runtime/types/RecordType'
import {isNil} from 'ramda'
import {NumberType} from '../../../src/runtime/types'

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

test('has expected default properties', () => {
    const emptyType = new RecordType('Not Much')
    expect(emptyType.required).toBe(false)
    expect(emptyType.description).toBe(undefined)
    expect(emptyType.fields).toStrictEqual([])
    expect(emptyType.ruleDescriptions).toStrictEqual(['Optional'])
})

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

test('can extend another type', () => {
    const creditLimitType = new NumberType('CreditLimit', {max: 2000})
    const extendedType = new RecordType('VipCustomer', {description: 'A special customer', basedOn: type, required: true}, [
        new Rule('VIP postcodes', (item: any) => item.Postcode.startsWith('SW1'), {description: 'Posh people only'})
    ], [
        creditLimitType,
    ])

    expect(extendedType.kind).toBe('Record')
    expect(extendedType.required).toBe(true)
    expect(extendedType.description).toBe('A special customer')
    expect(extendedType.basedOn).toBe(type)
    expect(extendedType.fields).toStrictEqual([nameType, countryType, postcodeType, creditLimitType])
    expect(extendedType.ruleDescriptions).toStrictEqual([
        'Required',
        'If country is UK postcode is required',
        'Posh people only'])

})
