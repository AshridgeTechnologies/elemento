import Project from '../model/Project'
import Element from '../model/Element'
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {editorInitialProject} from '../util/welcomeProject'
import {AppElementAction} from './Types'
import UnsupportedValueError from '../util/UnsupportedValueError'
import {loadJSONFromString} from '../model/loadJSON'
import {currentUser} from '../shared/authentication'
import {uploadTextToStorage} from '../shared/storage'
import {elementToJSON} from '../util/helpers'
import {last, project} from 'ramda'

declare global {
    var showOpenFilePicker: (options: object) => any
    var showSaveFilePicker: (options: object) => any
    var location: Location
}
const globalExternals = {
    showOpenFilePicker: (options: object) => global.showOpenFilePicker(options),
    showSaveFilePicker: (options: object) => global.showSaveFilePicker(options),
    baseUrl: global.location?.origin
}

type Externals = { showOpenFilePicker: (options: object) => any; showSaveFilePicker: (options: object) => any, baseUrl: string }

export default class ProjectHandler {
    private externals: Externals
    private project: Project
    private loadedFileHandle: any

    constructor(initialProject = editorInitialProject(), externals: Externals = globalExternals) {
        this.project = initialProject
        this.externals = externals
    }

    get current() { return this.project }

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
        const deleteElements = () => elementIds.reduce( (proj, id) => proj.delete(id), this.project)

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
                case 'pasteInside':
                {
                    const insertPosition = action.replace(/paste/, '').toLowerCase() as InsertPosition
                    const clipboardText = await navigator.clipboard.readText()
                    const elementsToInsert = loadJSONFromString(clipboardText)
                    const [project] = this.project.insert(insertPosition, elementIds[0], elementsToInsert)
                    return project
                }
                case 'duplicate': {
                    const elements = elementIds.map(id => this.project.findElement(id)) as Element[]
                    const duplicateElements = elements.map( el => el.set(el.id, 'name', el.name + ' Copy'))
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

    private userCancelledFilePick = (e:any) => /*e instanceof DOMException &&*/ e.name === 'AbortError'

    async openFile() {
        try {
            const [fileHandle] = await this.externals.showOpenFilePicker({id: 'elemento_editor'})
            const file = await fileHandle.getFile()
            const jsonText = await file.text()
            this.project = loadJSONFromString(jsonText) as Project
            this.loadedFileHandle = fileHandle
        } catch (e: any) {
            if (!this.userCancelledFilePick(e)) {
                throw e
            }
        }
    }


    private async writeProjectToFile (fileHandle: any) {
        const writable = await fileHandle.createWritable()
        await writable.write(elementToJSON(this.project))
        await writable.close()
    }

    async saveFileAs() {
        const options = {
            types: [
                {
                    description: 'Project JSON Files',
                    accept: {
                        'application/json': ['.json'],
                    },
                },
            ],
        }
        try {
            const fileHandle = await this.externals.showSaveFilePicker(options)
            if (fileHandle) {
                await this.writeProjectToFile(fileHandle)
                this.loadedFileHandle = fileHandle
            }
        } catch (e: any) {
            if (!this.userCancelledFilePick(e)) {
                throw e
            }
        }

    }

    async save() {
        if (this.loadedFileHandle) {
            await this.writeProjectToFile(this.loadedFileHandle)
        } else {
            await this.saveFileAs()
        }
    }

    async publish(name: string, code: string) {
        const user = currentUser()
        if(user === null) {
            throw new Error('Must be logged in to publish')
        }

        const publishPath = `apps/${user.uid}/${name}`
        const metadata = {
            contentType: 'text/javascript',
        }
        await uploadTextToStorage(publishPath, code, metadata)

        return this.externals.baseUrl + '/run/' + publishPath
    }
}