import renderer from 'react-test-renderer'
import React from 'react'
import {stateProxy} from '../../src/runtime/stateProxy'
import {treeItemSelector} from '../editor/Selectors'

export function asJSON(obj: object): any { return JSON.parse(JSON.stringify(obj)) }

export const componentJSON = (component: JSX.Element) => renderer.create(component).toJSON()

export const snapshot = (element: React.ReactElement) => () => expect(componentJSON(element)).toMatchSnapshot()

export const snapshotTest = (element: JSX.Element) => test(`${element.type.name} has expected structure`, snapshot(element))

export const componentProps = (domElement: any) => {
    const propsKey = Object.keys(domElement).find(k => k.startsWith("__reactProps$"))
    return propsKey !== undefined ? domElement[propsKey as string] : null
}

export const stateVal = (value: any, path = 'path.x') => testProxy(path, {value})

const dummyUpdateFn = () => {
    throw new Error('Dummy update fn called')
}
export const testProxy = (path: string, storedState: object | undefined, initialValuesAndDefaults: object = {}) => stateProxy(path, storedState, initialValuesAndDefaults, dummyUpdateFn)
export const testUpdatableProxy = (path: string, storedState: object | undefined, initialValuesAndDefaults: object = {}) => {
    const updateFn = jest.fn()
    const proxy = stateProxy(path, storedState, initialValuesAndDefaults, updateFn)
    proxy.updateFn = updateFn
    return proxy
}

let suppressionReported = false
const originalConsoleError = console.error

export const suppressRcTreeJSDomError = () => {
    if (console.error === originalConsoleError) {
        jest.spyOn(console, 'error').mockImplementation( (...args: any[]) => {
            if (args[0].match(/Cannot read properties of null \(reading 'removeEventListener'\)|The above error occurred in/)) {
                !suppressionReported && console.log('Suppressed JSDOM removeEventListener error')
                suppressionReported = true
            } else {
                originalConsoleError(...args)
            }
        })
    }
}
export const stopSuppressingRcTreeJSDomError = () => {
    jest.restoreAllMocks()
    suppressionReported = false
}

export const timeoutForDebugging = () => {
    jest.setTimeout(1000000)
    console.log('timeoutForDebugging')
}

export function ex([s]: TemplateStringsArray) {
    return {expr: s}
}

export const treeItemLabels = (container: any) => {
    const treeNodesShown = container.querySelectorAll(treeItemSelector)
    return [...treeNodesShown.values()].map((it: any) => it.textContent)
}

export const waitUntil = <T>(fn: () => T, time = 1000, wait = 10000): Promise<T> => {
    const startTime = new Date().getTime();
    try {
        const result = fn()
        if (result) {
            return Promise.resolve(result)
        } else {
            return new Promise((resolve, reject) => {
                const timer = setInterval(() => {
                    try {
                        const result = fn()
                        if (result) {
                            clearInterval(timer);
                            resolve(result);
                        } else if (new Date().getTime() - startTime > wait) {
                            clearInterval(timer);
                            reject(new Error('Max wait reached'));
                        }
                    } catch (e) {
                        clearInterval(timer);
                        reject(e);
                    }
                }, time);
            });
        }
    } catch (e) {
        return Promise.reject(e);
    }
};