import {Project} from '../model/index'
import {ElementId, ElementType} from '../model/Types'
import {editorInitialProject} from '../util/welcomeProject'
import {AppElementAction} from './Types'
import UnsupportedValueError from '../util/UnsupportedValueError'
import {loadJSONFromString} from '../model/loadJSON'
import {currentUser} from '../shared/authentication'
import {uploadTextToStorage} from '../shared/storage'

declare global {
    var showOpenFilePicker: () => any
    var showSaveFilePicker: (options: object) => any
    var location: Location
}
const globalExternals = {
    showOpenFilePicker: () => global.showOpenFilePicker(),
    showSaveFilePicker: (options: object) => global.showSaveFilePicker(options),
    baseUrl: global.location?.origin
}

type Externals = { showOpenFilePicker: () => any; showSaveFilePicker: (options: object) => any, baseUrl: string }

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

    insertElement(idAfter: ElementId, elementType: ElementType): ElementId {
        const [newProject, newElement] = this.project.insert(idAfter, elementType)
        this.project = newProject
        return newElement.id
    }


    elementAction(elementId: ElementId, action: AppElementAction) {
        const doAction = (): Project => {
            switch (action) {
                case 'delete':
                    return this.project.delete(elementId)
                default:
                    throw new UnsupportedValueError(action)
            }
        }

        this.project = doAction()
    }

    private userCancelledFilePick = (e:any) => /*e instanceof DOMException &&*/ e.name === 'AbortError'

    async openFile() {
        try {
            const [fileHandle] = await this.externals.showOpenFilePicker()
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
        await writable.write(JSON.stringify(this.project))
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
        };
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