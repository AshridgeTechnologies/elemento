import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
import TextType from '../../../src/runtime/types/TextType'
import Rule from '../../../src/runtime/types/Rule'
import {expect} from 'expect'

test('has expected properties', () => {
    const type = new TextType('Internal Email', {minLength: 10, maxLength: 20, format: 'email', description: 'Email address of Acme staff member'}, [
        new Rule('Dot Com only', (item: any) => item.endsWith("acme.com"), {description: 'Must end with acme.com'})
    ])
    expect(type.kind).toBe('Text')
    expect(type.codeName).toBe('InternalEmail')
    expect(type.required).toBe(false)
    expect(type.minLength).toBe(10)
    expect(type.maxLength).toBe(20)
    expect(type.format).toBe('email')
    expect(type.description).toBe('Email address of Acme staff member')
    expect(type.ruleDescriptions).toStrictEqual(['Optional', 'Minimum length 10', 'Maximum length 20', 'Must be a valid email', 'Must end with acme.com'])
})

test('validates using all rules', () => {
    const type = new TextType('Internal email', {minLength: 10, maxLength: 20, format: 'email', description: 'Email address of Acme staff member'}, [
        new Rule('Dot Com only', (item: any) => item.endsWith("acme.com"), {description: 'Must end with acme.com'})
    ])

    expect(type.validate(null)).toBe(null)
    expect(type.validate("bob@acme.com")).toBe(null)

    expect(type.validate("acme.com")).toStrictEqual(["Minimum length 10", "Must be a valid email"])
    expect(type.validate("b@a.com")).toStrictEqual(["Minimum length 10", "Must end with acme.com"])
    expect(type.validate("mustafa.papadopoulos@acme.com")).toStrictEqual(["Maximum length 20"])
    expect(type.validate("jane@example.com")).toStrictEqual(["Must end with acme.com"])
})

test('validates url format', () => {
    const urlType = new TextType('Url', {format: 'url'})

    expect(urlType.validate('b@xyz.com')).toStrictEqual(['Must be a valid url'])
    expect(urlType.validate('ws://xyz.com')).toStrictEqual(['Must be a valid url'])
    expect(urlType.validate('http://xyz.com')).toBe(null)
})

test('does not validate condition if empty and required', () => {
    const type = new TextType('Internal email', {required: true, minLength: 10})
    expect(type.validate(null)).toStrictEqual(['Required'])
    expect(type.validate('')).toStrictEqual(['Minimum length 10'])
})

test('does not validate condition if empty and not required', () => {
    const type = new TextType('Internal email', {required: false, minLength: 10})
    expect(type.validate(null)).toBe(null)
    expect(type.validate('')).toStrictEqual(['Minimum length 10'])
})

test('checks correct data type', () => {
    const type = new TextType('tt1')
    const clazz = class A {}
    expect(type.isCorrectDataType({a: 10})).toBe(false)
    expect(type.isCorrectDataType('10')).toBe(true)
    expect(type.isCorrectDataType(10)).toBe(false)
    expect(type.isCorrectDataType(true)).toBe(false)
    expect(type.isCorrectDataType(new Date())).toBe(false)
    expect(type.isCorrectDataType(clazz)).toBe(false)
})
