import Project from '../model/Project'
import {loadJSONFromString} from '../model/loadJSON'
import {elementToJSON} from '../util/helpers'
import {ProjectHolder} from './ProjectHandler'

declare global {
    var showOpenFilePicker: (options: object) => any
    var showSaveFilePicker: (options: object) => any
    var location: Location
}
const globalExternals = {
    showOpenFilePicker: (options: object) => global.showOpenFilePicker(options),
    showSaveFilePicker: (options: object) => global.showSaveFilePicker(options),
}

type Externals = { showOpenFilePicker: (options: object) => any; showSaveFilePicker: (options: object) => any }

export default class ProjectFileStore {
    private externals: Externals
    private loadedFileHandle: any

    constructor(private projectHolder: ProjectHolder, externals: Externals = globalExternals) {
        this.externals = externals
    }

    newProject() {
        this.projectHolder.newProject()
        this.loadedFileHandle = null
    }

    private userCancelledFilePick = (e:any) => /*e instanceof DOMException &&*/ e.name === 'AbortError'

    async openFile() {
        try {
            const [fileHandle] = await this.externals.showOpenFilePicker({id: 'elemento_editor'})
            const file = await fileHandle.getFile()
            const jsonText = await file.text()
            this.projectHolder.setProject(loadJSONFromString(jsonText) as Project)
            this.loadedFileHandle = fileHandle
        } catch (e: any) {
            if (!this.userCancelledFilePick(e)) {
                throw e
            }
        }
    }


    private async writeProjectToFile (fileHandle: any) {
        const writable = await fileHandle.createWritable()
        await writable.write(elementToJSON(this.projectHolder.current))
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

}