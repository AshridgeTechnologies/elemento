import Project, {editorEmptyProject} from '../model/Project'
import Element from '../model/Element'
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {AppElementAction, AppElementActionName} from './Types'
import UnsupportedValueError from '../util/UnsupportedValueError'
import {loadJSONFromString} from '../model/loadJSON'
import {elementToJSON} from '../util/helpers'
import {last} from 'ramda'

export interface ProjectHolder {
    get current(): Project | null
    get name(): string | null
    setName(n: string): void
    setProject(project: Project): void
    newProject(): void
}

export default class ProjectHandler implements ProjectHolder {
    private project: Project | null
    private _name: string | null = null

    private getProject(): Project {
        if (!this.project) {
            throw new Error('Cannot do this action - no current project')
        }

        return this.project
    }

    constructor(initialProject: Project | null = null) {
        this.project = initialProject
    }

    get current() {
        return this.project
    }
    get name() { return this._name }

    setProject(project: Project) {
        this.project = project
    }

    setName(name: string) { this._name = name }

    setProperty(elementId: ElementId, propertyName: string, value: any) {
        this.project = this.getProject().set(elementId, propertyName, value)
    }

    insertNewElement(insertPosition: InsertPosition, targetElementId: ElementId, elementType: ElementType, properties: object = {}): ElementId {
        const [newProject, newElement] = this.getProject().insertNew(insertPosition, targetElementId, elementType, properties)
        this.project = newProject
        return newElement.id
    }

    insertElement(insertPosition: InsertPosition, targetElementId: ElementId, element: Element | Element[]): ElementId {
        const [newProject, newElements] = this.getProject().insert(insertPosition, targetElementId, element)
        this.project = newProject
        return newElements[0]?.id
    }

    move(insertPosition: InsertPosition, targetElementId: ElementId, movedElementIds: ElementId[]) {
        this.project = this.getProject().move(insertPosition, targetElementId, movedElementIds)
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
                    return this.project
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
                    const [project] = this.getProject().insert(insertPosition, elementIds[0], elementsToInsert)
                    return project
                }
                case 'duplicate': {
                    const elements = elementIds.map(id => this.getProject().findElement(id)) as Element[]
                    const duplicateElements = elements.map(el => el.set(el.id, 'name', el.name + ' Copy'))
                    const [project] = this.getProject().insert('after', last(elementIds) as string, duplicateElements)
                    return project
                }
                case 'delete':
                    return deleteElements()
                case 'upload':
                    return this.getProject()
                default:
                    throw new UnsupportedValueError(action)
            }
        }

        try {
            this.project = await doAction()
        } catch (e) {
            console.error(`Could not do ${action} on element(s) ${elementIds.join(', ')}`, e)
            throw e
        }
    }

    newProject() {
        this.project = editorEmptyProject()
    }
}