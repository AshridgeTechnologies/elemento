import ProjectHandler from '../../src/editor/ProjectHandler'
import {projectFixture1, welcomeProject} from '../testutil/projectFixtures'
import Button from '../../src/model/Button'
import {AppElementActionName} from '../../src/editor/Types'
import {resetSaveFileCallData} from '../testutil/testHelpers'
import {elementToJSON} from '../../src/util/helpers'
import UnsupportedOperationError from '../../src/util/UnsupportedOperationError'
import UnsupportedValueError from '../../src/util/UnsupportedValueError'
import TextInput from '../../src/model/TextInput'
import Text from '../../src/model/Text'
import {editorEmptyProject} from '../../src/model/Project'

const project = projectFixture1()

let handler: ProjectHandler
beforeEach(() => {
    jest.resetAllMocks()
    handler = new ProjectHandler()
    handler.setProject(project)
})

beforeEach(() => {
    resetSaveFileCallData()
})

let clipboardData: string
beforeEach(() => {
    // mock clipboard
    clipboardData = ''
    global['navigator'] = {
        clipboard: {
            writeText(data: string) {
                clipboardData = data
                return Promise.resolve()
            },
            write(data: any) {return Promise.resolve()},
            readText() {return Promise.resolve(clipboardData)},
            read() {return Promise.resolve({} as ClipboardItems)},
        } as Clipboard,
        permissions: {
            query() { return Promise.resolve({state: 'granted'} as PermissionStatus)}
        } as Permissions
    } as Navigator
})

afterEach(() => {
    // @ts-ignore
    global['navigator'] = undefined
})
test('has no default project', () => {
    expect(new ProjectHandler().current).toBe(null)
})

test('throws if try to act on a null project', () => {
    expect( () => new ProjectHandler().setProperty('text_3', 'content', 'New content') ).toThrow('Cannot do this action - no current project')
})
test('can set and get a project', () => {
    // handler.setProject(project) // done in beforeEach
    expect(handler.current).toBe(project)
})

test('can set a property on the project', () => {
    handler.setProperty('text_3', 'content', 'New content')
    expect(handler.current).not.toBe(project)
    expect((handler.current?.findElement('text_3') as Text).content).toBe('New content')
})

test('can undo and redo actions on the project', () => {
    const originalContent = (project.findElement('text_3') as Text).content
    handler.setProperty('text_3', 'content', 'New content')
    const projectUpdated = handler.current
    expect(projectUpdated).not.toBe(project)
    expect((projectUpdated?.findElement('text_3') as Text).content).toBe('New content')

    handler.undo()
    expect(handler.current).toBe(project)
    expect((handler.current?.findElement('text_3') as Text).content).toBe(originalContent)

    handler.redo()
    expect(handler.current).toBe(projectUpdated)
    expect((handler.current?.findElement('text_3') as Text).content).toBe('New content')
})

test('can undo and redo actions on the project with an action', async () => {
    const originalContent = (project.findElement('text_3') as Text).content
    handler.setProperty('text_3', 'content', 'New content')
    const projectUpdated = handler.current
    expect(projectUpdated).not.toBe(project)
    expect((projectUpdated?.findElement('text_3') as Text).content).toBe('New content')

    await handler.elementAction(['text_1'], 'undo')
    expect(handler.current).toBe(project)
    expect((handler.current?.findElement('text_3') as Text).content).toBe(originalContent)

    await handler.elementAction([], 'redo')
    expect(handler.current).toBe(projectUpdated)
    expect((handler.current?.findElement('text_3') as Text).content).toBe('New content')
})

test('can create a new element in the project', () => {
    const newId = handler.insertNewElement('inside', 'page_2', 'Text')
    expect(handler.current).not.toBe(project)
    expect((handler.current?.findElement(newId) as TextInput).id).toBe(newId)
    expect((handler.current?.findElement('page_2')?.elements as any)[2].id).toBe(newId)
})

test('can create a new element in the project and set name and properties', () => {
    const newId = handler.insertNewElement('inside', 'page_2', 'Text', {name: 'The Stuff', width: '100%'})
    expect(handler.current).not.toBe(project)
    const newElement = handler.current?.findElement(newId) as TextInput
    expect(newElement.id).toBe(newId)
    expect(newElement.name).toBe('The Stuff')
    expect(newElement.width).toBe('100%')
})

test('can insert an element into the project', () => {
    const newElement = new Text('originalId', 'Text 1', {content: 'Hi!'})
    const newId = handler.insertElement('inside', 'page_2', newElement)
    expect(handler.current).not.toBe(project)
    expect((handler.current?.findElement(newId) as TextInput).id).toBe(newId)
    expect((handler.current?.findElement('page_2')?.elements as any)[2].id).toBe('text_5')
})

test('can do delete action on the project with all ids', async () => {
    await handler.elementAction(['text_3', 'text_1'], 'delete')
    expect(handler.current?.findElement('text_3')).toBeNull()
    expect(handler.current?.findElement('text_1')).toBeNull()
})

test('can do copy action on the project with single id', async () => {
    await handler.elementAction(['text_3'], 'copy')
    const expectedText = elementToJSON(handler.current?.findElement('text_3')!)
    expect(clipboardData).toBe(expectedText)
})

test('can do copy action on the project with multiple ids', async () => {
    await handler.elementAction(['text_3', 'text_1'], 'copy')
    const expectedText = elementToJSON([handler.current?.findElement('text_3')!,
        handler.current?.findElement('text_1')!])
    expect(clipboardData).toBe(expectedText)
    expect(handler.current?.findElement('text_3')).not.toBeNull()
    expect(handler.current?.findElement('text_1')).not.toBeNull()
})

test('can do cut action on the project with multiple ids', async () => {
    const expectedText = elementToJSON([handler.current?.findElement('text_3')!,
        handler.current?.findElement('text_1')!])
    await handler.elementAction(['text_3', 'text_1'], 'cut')
    expect(clipboardData).toBe(expectedText)
    expect(handler.current?.findElement('text_3')).toBeNull()
    expect(handler.current?.findElement('text_1')).toBeNull()
})

test.each(['pasteAfter', 'pasteBefore', 'pasteInside'])('can do %s action on the project after the first id with single item', async (action) => {
    const elementToPaste = new Button('xyz', 'Big button', {})
    clipboardData = elementToJSON(elementToPaste)
    await handler.elementAction(['layout_1', 'text_1'], action as AppElementActionName)
    const pastedElement = handler.current?.findElement('button_1')
    expect(pastedElement!.name).toBe('Big button')
})

test('can do pasteAfter action on the project after the first id with multiple items in correct order', async () => {
    const elementToPaste1 = new Button('xyz', 'Big button', {})
    const elementToPaste2 = new TextInput('pqr', 'Big Text Input', {})
    clipboardData = elementToJSON([elementToPaste1, elementToPaste2])
    await handler.elementAction(['text_3', 'text_1'], 'pasteAfter')
    const page2 = handler.current?.findElement('page_2')
    const childNames = page2?.elements!.map( el => el.name )
    expect(childNames).toStrictEqual(['Some Text', 'Big button', 'Big Text Input', 'More Text'])
})

test('can do duplicate action on the project with single id', async () => {
    await handler.elementAction(['text_3'], 'duplicate')
    const newElement = handler.current?.findElement('text_5')
    expect(newElement?.name).toBe('Some Text Copy')
})

test('can do duplicate action on the project with multiple ids', async () => {
    await handler.elementAction(['text_1', 'text_3'], 'duplicate')
    const page2 = handler.current?.findElement('page_2')
    const childNames = page2?.elements!.map( el => el.name )
    expect(childNames).toStrictEqual(['Some Text', 'First Text Copy', 'Some Text Copy', 'More Text'])
})

test('illegal action leaves the project unchanged and throws error', async () => {
    const originalErrorFn = console.error
    try {
        console.error = jest.fn()
        const elementToPaste = new TextInput('pqr', 'Big Text Input', {})
        clipboardData = elementToJSON(elementToPaste)
        let error: any
        try {
            await handler.elementAction(['text_3'], 'pasteInside' as AppElementActionName)
        } catch(e) {
            error = e
        }
        expect(handler.current).toBe(project)
        expect(error.message).toBe('Cannot insert elements of types TextInput inside Text')
        expect(console.error).toHaveBeenCalledWith("Could not do pasteInside on element(s) text_3", new Error('Cannot insert elements of types TextInput inside Text'))
    } finally {
        console.error = originalErrorFn
    }
})

test('unknown action leaves the project unchanged', async () => {
    const originalErrorFn = console.error
    try {
        console.error = jest.fn()
        let error: any
        try {
            await handler.elementAction(['text_3'], 'doSomething' as AppElementActionName)
        } catch(e) {
            error = e
        }

        expect(handler.current).toBe(project)
        expect(error).toBeInstanceOf(UnsupportedValueError)
        expect(console.error).toHaveBeenCalledWith("Could not do doSomething on element(s) text_3", new UnsupportedOperationError('doSomething'))
    } finally {
        console.error = originalErrorFn
    }
})

test('can start a new project', () => {
    const handler = new ProjectHandler(welcomeProject())
    handler.newProject()
    expect(handler.current).toStrictEqual(editorEmptyProject())
})

