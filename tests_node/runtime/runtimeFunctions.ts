import test from 'node:test'
import {expect} from 'expect'

import os from 'os'
import path from 'path'
import fs from 'fs'
import {importHandlers, importModule} from "../../src/runtime/runtimeFunctions"

test('imports default function from local module', async () => {
    const tempDir = os.tmpdir()
    const filePath = path.join(tempDir, 'Func1.mjs')
    fs.writeFileSync(filePath, 'export default function f1() { return "This is f1" }', 'utf-8')
    const func = await import(filePath).then(...importHandlers('default', filePath))
    expect(typeof func).toBe('function')
    expect(func()).toBe('This is f1')
})

test('imports named function from local module', async () => {
    const tempDir = os.tmpdir()
    const filePath = path.join(tempDir, 'Func2.mjs')
    fs.writeFileSync(filePath, 'export function fn1() { return "This is fn1" }\n export function fn2() {}', 'utf-8')
    const func = await import(filePath).then(...importHandlers('fn1', filePath))
    expect(typeof func).toBe('function')
    expect(func()).toBe('This is fn1')
})

test('imports named function from local module with import module', async () => {
    const tempDir = os.tmpdir()
    const filePath = path.join(tempDir, 'Func2.mjs')
    fs.writeFileSync(filePath, 'export function fn1() { return "This is fn1" }\n export function fn2() {}', 'utf-8')
    const func = await importModule(filePath, 'fn1')
    expect(typeof func).toBe('function')
    expect(func()).toBe('This is fn1')
})

test('imports whole module from local file', async () => {
    const tempDir = os.tmpdir()
    const filePath = path.join(tempDir, 'Func2.mjs')
    fs.writeFileSync(filePath, 'export function fn1() { return "This is fn1" }\n export function fn2() {}', 'utf-8')
    const module: any = await import(filePath).then(...importHandlers('*', filePath))
    expect(typeof module.fn1).toBe('function')
    expect(typeof module.fn2).toBe('function')
    expect(module.fn1()).toBe('This is fn1')
})

test('logs error and returns noop function if the import fails', async () => {
    const originalErrorFn = console.error
    try {
        let errorArgs: any[]
        console.error = (...args: any[]) => errorArgs = args
        // @ts-ignore
        const func= await import('./xxx.mjs').then(...importHandlers('default', './xxx.mjs'))
        expect(typeof func).toBe('function')
        expect(func()).toBe(undefined)
        expect(errorArgs![0]).toBe('Error in import ./xxx.mjs')
        expect(errorArgs![1].message).toContain('Cannot find module')
    } finally {
        console.error = originalErrorFn
    }
})

test('logs error and returns noop function if the named import is not found', async () => {
    const tempDir = os.tmpdir()
    const filePath = path.join(tempDir, 'Func2.mjs')
    fs.writeFileSync(filePath, 'export function fn1() { return "This is fn1" }\n export function fn2() {}', 'utf-8')

    const originalErrorFn = console.error
    try {
        let errorArgs: any[]
        console.error = (...args: any[]) => errorArgs = args
        const func = await import(filePath).then(...importHandlers('x1', filePath))
        expect(typeof func).toBe('function')
        expect(func()).toBe(undefined)
        expect(errorArgs![0]).toBe(`Error in import ${filePath} - name 'x1' not found`)
    } finally {
        console.error = originalErrorFn
    }
})
