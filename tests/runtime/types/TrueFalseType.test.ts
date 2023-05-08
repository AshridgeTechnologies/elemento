import TrueFalseType from '../../../src/shared/types/TrueFalseType'
import Rule from '../../../src/shared/types/Rule'
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
