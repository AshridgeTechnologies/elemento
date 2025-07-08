import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
import ChoiceType from '../../../src/runtime/types/ChoiceType'
import Rule from '../../../src/runtime/types/Rule'

test('has expected properties', () => {
    const type = new ChoiceType('Colour', {description: 'Outer paint shade', required: true, values: ['r', 'g', 'b'], valueNames: ['Red', 'Green', 'Blue']}, [])
    expect(type.kind).toBe('Choice')
    expect(type.required).toBe(true)
    expect(type.description).toBe('Outer paint shade')
    expect(type.values).toStrictEqual(['r', 'g', 'b'])
    expect(type.valueNames).toStrictEqual(['Red', 'Green', 'Blue'])
    expect(type.ruleDescriptions).toStrictEqual(['Required', 'One of: Red, Green, Blue'])
})

test('has expected default values', () => {
    const type = new ChoiceType('Colour', {}, [])
    expect(type.kind).toBe('Choice')
    expect(type.required).toBe(false)
    expect(type.description).toBe(undefined)
    expect(type.values).toStrictEqual([])
    expect(type.valueNames).toStrictEqual([])
    expect(type.ruleDescriptions).toStrictEqual(['Optional', 'One of: '])
})

test('uses value as default value name', () => {
    const type = new ChoiceType('Colour', {values: ['a1', 'a2', 'a3', 'a4'], valueNames: ['Alpha 1', , 'Alpha 3']}, [])
    expect(type.values).toStrictEqual(['a1', 'a2', 'a3', 'a4'])
    expect(type.valueNames).toStrictEqual(['Alpha 1', 'a2', 'Alpha 3', 'a4'])
    expect(type.ruleDescriptions).toStrictEqual(['Optional', 'One of: Alpha 1, a2, Alpha 3, a4'])
})

test('validates null ok', () => {
    const type = new ChoiceType('Colour', {}, [])
    expect(type.validate(null)).toBe(null)
})

test('validates valid value ok', () => {
    const type = new ChoiceType('Colour', {values: ['r', 'g']}, [])
    expect(type.validate('r')).toBe(null)
    expect(type.validate('g')).toBe(null)
})

test('validates invalid value', () => {
    const type = new ChoiceType('Colour', {description: 'Whether we like it', values: ['r', 'g'], valueNames: ['Red', 'Green']}, [])
    expect(type.validate('b')).toStrictEqual(['One of: Red, Green'])
})

test('validates using all rules', () => {
    const type = new ChoiceType('Approved', {description: 'Whether we like it', required: true, values: ['r', 'g', 'b'], valueNames: ['Red', 'Green', 'Blue']}, [
        new Rule('Red only', (item: any) => item === 'r', {description: 'It must be red!'})
    ])

    expect(type.validate(null)).toStrictEqual(['Required'])
    expect(type.validate('b')).toStrictEqual(['It must be red!'])
    expect(type.validate('r')).toBe(null)
})

test('rule description message only includes first 10 choices', () => {
    const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    const type = new ChoiceType('Numbers', {values}, [])
    expect(type.values).toStrictEqual(values)
    expect(type.ruleDescriptions).toStrictEqual(['Optional', 'One of: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ...'])
})

test('checks correct data type', () => {
    const type = new ChoiceType('Something', {values: []}, [])
    const clazz = class A {}
    expect(type.isCorrectDataType(10)).toBe(true)
    expect(type.isCorrectDataType('a string')).toBe(true)
    expect(type.isCorrectDataType(true)).toBe(true)
    expect(type.isCorrectDataType(new Date())).toBe(true)
    expect(type.isCorrectDataType(new String('x'))).toBe(false)
    expect(type.isCorrectDataType({a: 10})).toBe(false)
    expect(type.isCorrectDataType(clazz)).toBe(false)
})
