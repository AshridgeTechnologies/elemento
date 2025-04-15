import renderer from 'react-test-renderer'
import React, {ComponentState, createElement, FunctionComponent} from 'react'
import {treeItemTitleSelector, treeNodeSelector} from '../editor/Selectors'
import {AppStateForObject, AppStoreHook, StoreProvider} from '../../src/runtime/appData'
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFnsV3'
import {LocalizationProvider} from '@mui/x-date-pickers'
import {enGB} from 'date-fns/locale/en-GB'
import {isArray} from 'lodash'
import {DirectoryNode, FileNode, FileSystemTree} from '../../src/editor/Types'
import {DndContext} from '@dnd-kit/core'
import {DndWrapper} from '../../src/runtime/components/ComponentHelpers'
import {DefaultUrlContext} from '../../src/runtime/UrlContext'
import {UrlContextContext} from '../../src/runner/AppRunner'
import {setObject} from '../../src/runtime/appStateHooks'
import AppStateStore, {StoredState} from '../../src/runtime/AppStateStore'

export function asJSON(obj: object): any { return JSON.parse(JSON.stringify(obj)) }

export const componentJSON = (component: JSX.Element) => renderer.create(component).toJSON()

export const snapshot = (element: React.ReactElement) => () => expect(componentJSON(element)).toMatchSnapshot()

export const snapshotTest = (element: JSX.Element) => test(`${element.type.name} has expected structure`, snapshot(element))

export const componentProps = (domElement: any) => {
    const propsKey = Object.keys(domElement).find(k => k.startsWith("__reactProps$"))
    return propsKey !== undefined ? domElement[propsKey as string] : null
}

export const inAppContextProvider = (prefix: string | undefined, el: any) => {
    const appContext = new DefaultUrlContext(null, prefix)
    return createElement(UrlContextContext.Provider, {value: appContext}, el)
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

export const treeItemClassNames = (container: any) => {
    const treeNodesShown = container.querySelectorAll(treeNodeSelector)
    return [...treeNodesShown.values()].map( (it: any) => it.className )
}

export const treeItemTitleClassNames = (container: any) => {
    const treeNodesShown = container.querySelectorAll(treeItemTitleSelector + ' span')
    return [...treeNodesShown.values()].map( (it: any) => it.className )
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

export const testAppInterface = (path: string, initialVersion: any, childStateValues: object = {}): AppStateForObject => {
    let _latest: any = initialVersion

    const appInterface: AppStateForObject = {
        latest() {
            return _latest
        },
        updateVersion: jest.fn().mockImplementation((changes: object) => {
            _latest = _latest.withMergedState(changes)
            _latest.init(appInterface, path)
        }),
        getChildState: (subPath: string) => childStateValues[subPath as keyof object],
        getOrCreateChildState(subPath: string, item: StoredState): StoredState {
            const initItem = (item: StoredState) => {
                item.init(appInterface, path + '.' + subPath)
                return item
            }
            // @ts-ignore
            return childStateValues[subPath as keyof object] ?? (childStateValues[subPath as keyof object] = initItem(item))
        },
        getApp(): StoredState {
            throw new Error('getApp not implemented')
        }
    }

    initialVersion.init(appInterface, path)
    return appInterface
}

export function testAppStoreHook() {
    const hook = {
        store: null as (null | AppStateStore),
        setAppStore(sa: AppStateStore) {
            this.store = sa
        },
        setStateAt(path: string, stateObject: any) {
            this.store!.set(path, stateObject)
        },
        stateAt (path: string) {
            return this.store!.get(path)
        }
    }

    return hook as AppStoreHook
}

const TestWrapper = <State extends object>({
                                                      path,
                                                      state,
                                                      children
                                                  }: { path: string, state: any, children?: any }) => {
    setObject(path, state)
    return children
}
type Class<T> = new (...args: any[]) => T

export const wrappedTestElement = <StateType>(componentClass: FunctionComponent<any>, stateClass: Class<StateType>, wrapForDnd = false): [any, any] => {

    const appStoreHook = testAppStoreHook()

    const testElementCreatorFn = (path: string, stateProps: { value?: any } | StateType = {}, componentProps: any = {}, ...children: React.ReactNode[]) => {
        const state = stateProps instanceof stateClass ? stateProps : new stateClass(stateProps as object)
        const component = isArray(children)
            ? createElement(componentClass as any, {path, ...componentProps}, ...children)
            : createElement(componentClass as any, {path, ...componentProps}, children)
        const componentElement = createElement(TestWrapper, {path, state}, component)
        const innerElement = wrapForDnd ? createElement(DndContext, null, componentElement) : componentElement
        return createElement(StoreProvider, {appStoreHook, children:
            createElement(LocalizationProvider, {dateAdapter: AdapterDateFns,  adapterLocale: enGB}, innerElement)}
        )
    }
    return [testElementCreatorFn, appStoreHook]
}

class ValueObj<T> {
    constructor(readonly val: T) {}
    valueOf() {return this.val}
}

export const valueObj = <T>(val: T) => new ValueObj<T>(val)

export function mockReturn(fn: any, value: any) {
    const mock_fn = fn as jest.MockedFunction<any>
    mock_fn.mockReturnValue(value)
}

export function mockClear(fn: any) {
    const mock_fn = fn as jest.MockedFunction<any>
    mock_fn.mockClear()
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
                if (typeof fileContents === 'string') {
                    return Promise.resolve(new TextEncoder().encode(fileContents))
                }
                return Promise.resolve(fileContents as Uint8Array)
            },
        } as File
    }

    createWritable(): any {
        throw new Error('Not implemented')
    }
}

export const inDndContext = (itemSet: any) => createElement(DndWrapper, {elementToWrap: itemSet})
