import Project from '../model/Project'
import Element from '../model/Element'
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {editorEmptyProject, editorInitialProject} from '../util/initialProjects'
import {AppElementAction} from './Types'
import UnsupportedValueError from '../util/UnsupportedValueError'
import {loadJSONFromString} from '../model/loadJSON'
import {elementToJSON} from '../util/helpers'
import {last} from 'ramda'

export interface ProjectHolder {
    get current(): Project
    get name(): string
    set name(n: string)
    setProject(project: Project): void
    newProject(): void
}

export default class ProjectHandler implements ProjectHolder {
    private project: Project
    public name: string = 'Unnamed project'

    constructor(initialProject = editorInitialProject()) {
        this.project = initialProject
    }

    get current() {
        return this.project
    }

    setProject(project: Project) {
        this.project = project
    }

    setProperty(elementId: ElementId, propertyName: string, value: any) {
        this.project = this.project.set(elementId, propertyName, value)
    }

    insertNewElement(insertPosition: InsertPosition, targetElementId: ElementId, elementType: ElementType): ElementId {
        const [newProject, newElement] = this.project.insertNew(insertPosition, targetElementId, elementType)
        this.project = newProject
        return newElement.id
    }

    insertElement(insertPosition: InsertPosition, targetElementId: ElementId, element: Element | Element[]): ElementId {
        const [newProject, newElements] = this.project.insert(insertPosition, targetElementId, element)
        this.project = newProject
        return newElements[0]?.id
    }

    move(insertPosition: InsertPosition, targetElementId: ElementId, movedElementIds: ElementId[]) {
        this.project = this.project.move(insertPosition, targetElementId, movedElementIds)
    }

    async elementAction(elementIds: ElementId[], action: AppElementAction) {
        const deleteElements = () => elementIds.reduce((proj, id) => proj.delete(id), this.project)

        const copyElementsToClipboard = async () => {
            const elements = elementIds.map(id => this.project.findElement(id)) as Element[]
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
                    const [project] = this.project.insert(insertPosition, elementIds[0], elementsToInsert)
                    return project
                }
                case 'duplicate': {
                    const elements = elementIds.map(id => this.project.findElement(id)) as Element[]
                    const duplicateElements = elements.map(el => el.set(el.id, 'name', el.name + ' Copy'))
                    const [project] = this.project.insert('after', last(elementIds) as string, duplicateElements)
                    return project
                }
                case 'delete':
                    return deleteElements()
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