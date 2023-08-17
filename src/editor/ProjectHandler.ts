import Project, {editorEmptyProject} from '../model/Project'
import Element from '../model/Element'
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {AppElementActionName} from './Types'
import UnsupportedValueError from '../util/UnsupportedValueError'
import {loadJSONFromString} from '../model/loadJSON'
import {elementToJSON} from '../util/helpers'
import {last} from 'ramda'
import UndoRedoStack from './UndoRedoStack'

export default class ProjectHandler {
    private projectStack: UndoRedoStack<Project> | null
    private _name: string | null = null

    private getProject(): Project {
        if (!this.projectStack) {
            throw new Error('Cannot do this action - no current project')
        }

        return this.projectStack.current()
    }

    constructor(initialProject: Project | null = null) {
        this.projectStack = initialProject && new UndoRedoStack<Project>(initialProject)
    }

    get current() {
        return this.projectStack?.current() ?? null
    }
    get name() { return this._name }

    setProject(project: Project) {
        this.projectStack = new UndoRedoStack<Project>(project)
    }

    setName(name: string) { this._name = name }

    setProperty(elementId: ElementId, propertyName: string, value: any) {
        const newProject = this.getProject().set(elementId, propertyName, value)
        this.projectStack!.update(newProject)
    }

    insertNewElement(insertPosition: InsertPosition, targetElementId: ElementId, elementType: ElementType, properties: object = {}): ElementId {
        const [newProject, newElement] = this.getProject().insertNew(insertPosition, targetElementId, elementType, properties)
        this.projectStack!.update(newProject)
        return newElement.id
    }

    insertElement(insertPosition: InsertPosition, targetElementId: ElementId, element: Element | Element[]): ElementId {
        const [newProject, newElements] = this.getProject().insert(insertPosition, targetElementId, element)
        this.projectStack!.update(newProject)
        return newElements[0]?.id
    }

    move(insertPosition: InsertPosition, targetElementId: ElementId, movedElementIds: ElementId[]) {
        const newProject = this.getProject().move(insertPosition, targetElementId, movedElementIds)
        this.projectStack!.update(newProject)
    }

    async elementAction(elementIds: ElementId[], action: AppElementActionName) {
        const deleteElements = () => elementIds.reduce((proj, id) => proj.delete(id), this.getProject())

        const copyElementsToClipboard = async () => {
            const elements = elementIds.map(id => this.getProject().findElement(id)) as Element[]
            const elementText = elements.length === 0 ? '' : elements.length === 1 ? elementToJSON(elements[0]) : elementToJSON(elements)
            await navigator.clipboard.writeText(elementText)
        }

        const doAction = async () => {
            switch (action) {
                case 'copy': {
                    await copyElementsToClipboard()
                    return null
                }
                case 'cut': {
                    await copyElementsToClipboard()
                    return deleteElements()
                }
                case 'pasteAfter':
                case 'pasteBefore':
                case 'pasteInside': {
                    const insertPosition = action.replace(/paste/, '').toLowerCase() as InsertPosition
                    const clipboardText = await navigator.clipboard.readText()
                    const elementsToInsert = loadJSONFromString(clipboardText)
                    const [newProject] = this.getProject().insert(insertPosition, elementIds[0], elementsToInsert)
                    return newProject
                }
                case 'duplicate': {
                    const elements = elementIds.map(id => this.getProject().findElement(id)) as Element[]
                    const duplicateElements = elements.map(el => el.set(el.id, 'name', el.name + ' Copy'))
                    const [newProject] = this.getProject().insert('after', last(elementIds) as string, duplicateElements)
                    return newProject
                }
                case 'delete':
                    return deleteElements()
                case 'upload':
                    return null
                default:
                    throw new UnsupportedValueError(action)
            }
        }

        try {
            const newProject = await doAction()
            if (newProject) {
                this.projectStack!.update(newProject)
            }

        } catch (e) {
            console.error(`Could not do ${action} on element(s) ${elementIds.join(', ')}`, e)
            throw e
        }
    }

    newProject() {
        this.projectStack = new UndoRedoStack(editorEmptyProject())
    }

    undo() {
        this.projectStack?.undo()
    }

    redo() {
        this.projectStack?.redo()
    }
}