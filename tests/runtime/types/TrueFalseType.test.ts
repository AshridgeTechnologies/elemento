import TrueFalseType from '../../../src/runtime/types/TrueFalseType'
import Rule from '../../../src/runtime/types/Rule'
import {expect} from 'expect'

test('has expected properties', () => {
    const type = new TrueFalseType('Approved', {description: 'Whether we like it'}, [])
    expect(type.kind).toBe('TrueFalse')
    expect(type.required).toBe(false)
    expect(type.description).toBe('Whether we like it')
    expect(type.ruleDescriptions).toStrictEqual(['Optional'])
})

test('validates null ok', () => {
    const type = new TrueFalseType('Approved', {}, [])
    expect(type.validate(null)).toBe(null)
})

test('validates true and false ok', () => {
    const type = new TrueFalseType('Approved', {}, [])
    expect(type.validate(true)).toBe(null)
    expect(type.validate(false)).toBe(null)
})

test('validates using all rules', () => {
    const type = new TrueFalseType('Approved', {description: 'Whether we like it', required: true}, [
        new Rule('True only', (item: any) => !!item, {description: 'It must be true!'})
    ])

    expect(type.validate(null)).toStrictEqual(['Required'])
    expect(type.validate(false)).toStrictEqual(['It must be true!'])
    expect(type.validate(true)).toBe(null)
})

test('checks correct data type', () => {
    const type = new TrueFalseType('tft1')
    const clazz = class A {}
    expect(type.isCorrectDataType({a: 10})).toBe(false)
    expect(type.isCorrectDataType(10)).toBe(false)
    expect(type.isCorrectDataType('10')).toBe(false)
    expect(type.isCorrectDataType(false)).toBe(true)
    expect(type.isCorrectDataType(new Date())).toBe(false)
    expect(type.isCorrectDataType(clazz)).toBe(false)
})