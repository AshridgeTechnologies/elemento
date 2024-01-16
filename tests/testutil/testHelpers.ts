import renderer from 'react-test-renderer'
import React, {ComponentState, createElement, FunctionComponent} from 'react'
import {treeItemTitleSelector} from '../editor/Selectors'
import {AppStateForObject, AppStore, StoreProvider, useObjectState} from '../../src/runtime/appData'
import {StoreApi} from 'zustand'
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns'
import {LocalizationProvider} from '@mui/x-date-pickers'
import enGB from 'date-fns/locale/en-GB'
import {isArray} from 'lodash'
import {DirectoryNode, FileNode, FileSystemTree} from '../../src/editor/Types'

export function asJSON(obj: object): any { return JSON.parse(JSON.stringify(obj)) }

export const componentJSON = (component: JSX.Element) => renderer.create(component).toJSON()

export const snapshot = (element: React.ReactElement) => () => expect(componentJSON(element)).toMatchSnapshot()

export const snapshotTest = (element: JSX.Element) => test(`${element.type.name} has expected structure`, snapshot(element))

export const componentProps = (domElement: any) => {
    const propsKey = Object.keys(domElement).find(k => k.startsWith("__reactProps$"))
    return propsKey !== undefined ? domElement[propsKey as string] : null
}

let suppressionReported = false
const originalConsoleError = console.error

export const suppressRcTreeJSDomError = () => {
    if (console.error === originalConsoleError) {
        jest.spyOn(console, 'error').mockImplementation( (...args: any[]) => {
            const message = args[0].message ?? args[0]
            if (message.match(/Cannot read properties of null \(reading 'removeEventListener'\)|The above error occurred in/)) {
                !suppressionReported && console.log('Suppressed JSDOM removeEventListener error')
                suppressionReported = true
            } else {
                originalConsoleError(...args)
            }
        })
    }
}
export const stopSuppressingRcTreeJSDomError = () => {
    console.error = originalConsoleError
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

export function trimText([s]: TemplateStringsArray) {
    const trimmedText = s.replace(/^\n/, '').replace(/ *$/, '')
    const lines = trimmedText.split('\n')
    const nonBlankLines = lines.filter( l => l.trim())
    const indentLength = (l: string): number => l.match(/^ */)?.[0]?.length ?? 0
    const shortestIndent = Math.min(...nonBlankLines.map(indentLength))
    const linesWithoutIndent = lines.map( l => l.slice(shortestIndent))
    return linesWithoutIndent.join('\n')
}

export const treeItemLabels = (container: any) => {
    const treeNodesShown = container.querySelectorAll(treeItemTitleSelector)
    return [...treeNodesShown.values()].map((it: any) => it.textContent)
}

export const waitUntil = async <T>(fn: () => T, intervalTime = 1000, timeout = 5000): Promise<T> => {
    const startTime = new Date().getTime();
    try {
        const result = await fn()
        if (result) {
            return Promise.resolve(result)
        } else {
            return new Promise((resolve, reject) => {
                const timer = setInterval(async () => {
                    try {
                        const result = await fn()
                        if (result) {
                            clearInterval(timer);
                            resolve(result);
                        } else if (new Date().getTime() - startTime > timeout) {
                            clearInterval(timer);
                            reject(new Error('Max wait reached for ' + fn.toString()));
                        }
                    } catch (e) {
                        clearInterval(timer);
                        reject(e);
                    }
                }, intervalTime);
            });
        }
    } catch (e) {
        return Promise.reject(e);
    }
}

export let saveFileData: any
export let saveFilePickerOptions: any

export function resetSaveFileCallData() {
    saveFileData = undefined
    saveFilePickerOptions = undefined
}

export function mockFileHandle(returnedData?: object | string, name?: string) {
    const file = {
        async text() {
            return typeof returnedData === 'string' ? returnedData : JSON.stringify(returnedData)
        }
    }

    const writable = {
        async write(data: any) {
            saveFileData = data
        },
        async close() {
        }
    }

    return {
        name,
        async getFile() {
            return file
        },
        async createWritable() {
            return writable
        }
    } as unknown as FileSystemFileHandle
}

export const saveFilePicker = (fileHandleName?: string) => async (options: any) => {
    saveFilePickerOptions = options
    return mockFileHandle(undefined, fileHandleName)
}

export function filePickerReturning(returnedData: object | string, fileHandleName?: string) {
    return () => Promise.resolve([mockFileHandle(returnedData, fileHandleName)])
}

export const filePickerCancelling = () => Promise.reject({name: 'AbortError'})
export const filePickerErroring = () => Promise.reject(new Error('Could not access file'))

export const testAppInterface = (initialVersion: any = null, childStateValues: object = {}): AppStateForObject => {
    let _latest: any = initialVersion

    const appInterface = {
        latest() {
            return _latest
        },
        updateVersion: jest.fn().mockImplementation((newVersion: any) => {
            _latest = newVersion
            _latest.init(appInterface)
        }),
        getChildState: (subPath: string) => {
            const childStateValue = childStateValues[subPath as keyof object]
            return childStateValue && {value: childStateValue} as ComponentState
        }

    }
    return appInterface
}

export function testAppStoreHook() {
    return {
        storeApi: null,
        setAppStore(sa: StoreApi<AppStore>) {
            // @ts-ignore
            this.storeApi = sa
        },
        stateAt (path: string) {
            const storeApi = this.storeApi as unknown as StoreApi<AppStore>
            return storeApi.getState().store.select(path)
        }
    }
}

const TestWrapper = <State extends object>({
                                                      path,
                                                      state,
                                                      children
                                                  }: { path: string, state: any, children?: any }) => {
    useObjectState(path, state)
    return children
}
type Class<T> = new (...args: any[]) => T

export const wrappedTestElement = <StateType>(componentClass: FunctionComponent<any>, stateClass: Class<StateType>): [any, any] => {

    const appStoreHook = testAppStoreHook()

    const testElementCreatorFn = (path: string, stateProps: { value?: any } | StateType = {}, componentProps: any = {}, children?: React.ReactNode) => {
        const state = stateProps instanceof stateClass ? stateProps : new stateClass(stateProps as object)
        const component = isArray(children)
            ? createElement(componentClass as any, {path, ...componentProps}, ...children)
            : createElement(componentClass as any, {path, ...componentProps}, children)
        return createElement(StoreProvider, {appStoreHook, children:
            createElement(LocalizationProvider, {dateAdapter: AdapterDateFns,  adapterLocale: enGB},
                createElement(TestWrapper, {path, state}, component)
            )}
        )
    }
    return [testElementCreatorFn, appStoreHook]
}

class ValueObj<T> {
    constructor(readonly val: T) {}
    valueOf() {return this.val}
}

export const valueObj = <T>(val: T) => new ValueObj<T>(val)

function mockReturn(fn: any, value: any) {
    const mock_fn = fn as jest.MockedFunction<any>
    mock_fn.mockReturnValue(value)
}

export function mockImplementation(fn: any, impl: any) {
    const mock_fn = fn as jest.MockedFunction<any>
    mock_fn.mockImplementation(impl)
}

export const doNothing = () => {
}
export const wait = (time: number = 1): Promise<void> => new Promise(resolve => setTimeout(resolve, time))

export class MockFileSystemDirectoryHandle implements FileSystemDirectoryHandle {
    kind: 'directory' = 'directory'

    constructor(public name: string, public files: FileSystemTree) {
    }

    async getDirectoryHandle(name: string, options: FileSystemGetDirectoryOptions = {create: false}): Promise<FileSystemDirectoryHandle> {
        const dir = this.files[name] as DirectoryNode
        if (dir?.directory) {
            // @ts-ignore
            return new MockFileSystemDirectoryHandle(name, dir.directory)
        }
        throw new DOMException('Directory not found', name)
    }

    getFileHandle(name: string, options: FileSystemGetFileOptions = {create: false}): Promise<FileSystemFileHandle> {
        const file = this.files[name] as FileNode
        if (file?.file) {
            return Promise.resolve(new MockFileSystemFileHandle(name, file))
        }
        throw new DOMException('File not found', name)
    }

    removeEntry(name: string, options?: FileSystemRemoveOptions): Promise<void> {
        throw new Error('Not implemented')
    }

    resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null> {
        throw new Error('Not implemented')
    }

    isSameEntry(other: FileSystemHandle): Promise<boolean> {
        throw new Error('Not implemented')
    }
}

export class MockFileSystemFileHandle implements FileSystemFileHandle {
    kind: 'file' = 'file'

    constructor(public name: string, public file: FileNode) {
    }

    removeEntry(name: string, options?: FileSystemRemoveOptions): Promise<void> {
        throw new Error('Not implemented')
    }

    resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null> {
        throw new Error('Not implemented')
    }

    isSameEntry(other: FileSystemHandle): Promise<boolean> {
        throw new Error('Not implemented')
    }

    getFile(): Promise<File> {
        const fileContents = this.file.file.contents
        // @ts-ignore
        return {
            text() {
                return Promise.resolve(fileContents as string)
            },
            arrayBuffer() {
                return Promise.resolve(fileContents as Uint8Array)
            },
        } as File
    }

    createWritable(): any {
        throw new Error('Not implemented')
    }
}
