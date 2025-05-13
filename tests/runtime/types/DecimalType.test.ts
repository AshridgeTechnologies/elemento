import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
import DecimalType from '../../../src/runtime/types/DecimalType'
import Rule from '../../../src/runtime/types/Rule'
import {expect} from 'expect'
import BigNumber from 'bignumber.js'

const type = new DecimalType('Product size', {required: true, min: 10.5, max: new BigNumber('20.005'), decimalPlaces: 4, description: 'Size of a product'}, [
    new Rule('Not 15', (item: any) => item !== 15, {description: 'Must not be 15'})
])

test('has expected properties', () => {
    expect(type.kind).toBe('Decimal')
    expect(type.required).toBe(true)
    expect(type.min).toStrictEqual(new BigNumber(10.5))
    expect(type.max).toStrictEqual(new BigNumber('20.005'))
    expect(type.decimalPlaces).toBe(4)
    expect(type.description).toBe('Size of a product')
    expect(type.ruleDescriptions).toStrictEqual(['Required', 'Minimum 10.5', 'Maximum 20.005', '4 decimal places', 'Must not be 15'])
})

test('has expected default properties', () => {
    const defaultType = new DecimalType('dt1')
    expect(defaultType.kind).toBe('Decimal')
    expect(defaultType.required).toBe(false)
    expect(defaultType.min).toBe(undefined)
    expect(defaultType.max).toBe(undefined)
    expect(defaultType.decimalPlaces).toBe(undefined)
    expect(defaultType.description).toBe(undefined)
    expect(defaultType.ruleDescriptions).toStrictEqual(['Optional'])
})

test('validates using all rules', () => {
    expect(type.validate(null)).toStrictEqual(['Required'])
    expect(type.validate(18.44)).toBe(null)

    expect(type.validate(5)).toStrictEqual(['Minimum 10.5'])
    expect(type.validate(new BigNumber('10.4999999999999'))).toStrictEqual(['Minimum 10.5', '4 decimal places'])
    expect(type.validate(15)).toStrictEqual(['Must not be 15'])
    expect(type.validate(20.006)).toStrictEqual(['Maximum 20.005'])
    expect(type.validate(19.12345)).toStrictEqual(['4 decimal places'])
})

test('checks correct data type', () => {
    const clazz = class A {}
    expect(type.isCorrectDataType({a: 10})).toBe(false)
    expect(type.isCorrectDataType(10)).toBe(true)
    expect(type.isCorrectDataType(new BigNumber(10))).toBe(true)
    expect(type.isCorrectDataType('10')).toBe(false)
    expect(type.isCorrectDataType(true)).toBe(false)
    expect(type.isCorrectDataType(new Date())).toBe(false)
    expect(type.isCorrectDataType(clazz)).toBe(false)
})
