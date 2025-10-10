import {expect, MockedFunction, test, vi} from 'vitest'
import renderer from 'react-test-renderer'
import React, {createElement} from 'react'
import {treeItemTitleSelector} from '../editor/Selectors'
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns'
import {LocalizationProvider} from '@mui/x-date-pickers'
import {enGB} from 'date-fns/locale/en-GB'
import {isArray} from 'lodash'
import {DirectoryNode, FileNode, FileSystemTree} from '../../src/editor/Types'
import {DndContext} from '@dnd-kit/core'
import {DndWrapper} from '../../src/runtime/components/ComponentHelpers'
import {DefaultUrlContext, UrlContextContext} from '../../src/runtime/UrlContext'
import {AppStateForObject as AppStateForObject2} from '../../src/runtime/components/ComponentState2'
import {type AppStoreHook as AppStoreHook2, StoreProvider as StoreProvider2} from '../../src/runtime/state/StoreContext'
import AppStateStore, {MaybeInitable} from '../../src/runtime/state/AppStateStore'
import {render} from '@testing-library/react'

export function asJSON(obj: object): any { return JSON.parse(JSON.stringify(obj)) }

export const componentJSON = (component: JSX.Element) => renderer.create(component).toJSON()
export const componentJSONAsync = async (component: JSX.Element) => {
    const componentRenderer = renderer.create(component)
    await wait(500)
    return componentRenderer.toJSON()
}

export const snapshot = (element: React.ReactElement) => () => expect(componentJSON(element)).toMatchSnapshot()

export const htmlSnapshot = (element: React.ReactElement) => () => {
    const {container} = render(element)
    expect(container.innerHTML).toMatchSnapshot()
}

export const snapshotTest = (element: JSX.Element) => test(`${element.type.name} has expected structure`, snapshot(element))

export const componentProps = (domElement: any) => {
    const propsKey = Object.keys(domElement).find(k => k.startsWith("__reactProps$"))
    return propsKey !== undefined ? domElement[propsKey as string] : null
}

export const inAppContextProvider = (prefix: string | undefined, el: any) => {
    const urlContext = new DefaultUrlContext(null, prefix)
    return createElement(UrlContextContext.Provider, {value: urlContext}, el)
}

let suppressionReported = false
const originalConsoleError = console.error

export const suppressRcTreeJSDomError = () => {
    if (console.error === originalConsoleError) {
        vi.spyOn(console, 'error').mockImplementation( (...args: any[]) => {
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
    vi.restoreAllMocks()
    suppressionReported = false
}

export const timeoutForDebugging = () => {
    vi.setConfig({ testTimeout: 1000000 })
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
export const testAppInterfaceNew = (path: string, initialVersion: any, childStateValues: object = {}): AppStateForObject2 => {
    let _latest: any = initialVersion

    const appInterface: AppStateForObject2 = {
        path: path,
        latest() {
            return _latest
        },
        updateVersion: vi.fn().mockImplementation((changes: object) => {
            _latest = _latest.withMergedState(changes)
            _latest.init(appInterface, path)
        }),
        getChildState: (subPath: string) => childStateValues[subPath as keyof object],

    }

    initialVersion.init(appInterface)
    return appInterface
}

function testAppStoreHook2() {
    const hook = {
        store: null as (null | AppStateStore),
        setAppStore(sa: AppStateStore) {
            this.store = sa
        },
        stateAt (path: string) {
            return this.store!.get(path)
        }
    }

    return hook as AppStoreHook2
}

export const createStateFn = <T extends MaybeInitable>(stateClass: new(...args: any[]) => T) => {
    const theStore = new AppStateStore()
    let idSeq = 1
    return (props: object) => theStore.getOrCreate((idSeq++).toString(), stateClass, props)
}
export const wrappedTestElement = <StateType>(componentClass: React.FunctionComponent<any>, wrapForDnd = false): [any, any] => {

    const appStoreHook = testAppStoreHook2()

    const testElementCreatorFn = (path: string, componentProps: any = {}, ...children: React.ReactNode[]) => {
        const component = isArray(children)
            ? createElement(componentClass as any, {path, ...componentProps}, ...children)
            : createElement(componentClass as any, {path, ...componentProps}, children)
        const innerElement = wrapForDnd ? createElement(DndContext, null, component) : component
        return createElement(StoreProvider2, {appStoreHook, children:
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
    const mock_fn = fn as MockedFunction<any>
    mock_fn.mockReturnValue(value)
}

export function mockClear(fn: any) {
    const mock_fn = fn as MockedFunction<any>
    mock_fn.mockClear()
}

export function mockImplementation(fn: any, impl: any) {
    const mock_fn = fn as MockedFunction<any>
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

    createSyncAccessHandle(): Promise<FileSystemSyncAccessHandle> {
        throw new Error('Not implemented')
    }
}

export const inDndContext = (itemSet: any) => createElement(DndWrapper, {elementToWrap: itemSet})
export const getCallArg = (fn: (...args: any[]) => any, position: number): any => (fn as MockedFunction<any>).mock.calls[0]?.[position]
export const asAny = (val: any) => (val as any)
export const DEBUG_TIMEOUT = 1000000
