import Project, {TOOLS_ID} from '../model/Project'
import {generate} from './Generator'
import App from '../model/App'
import ServerFirebaseGenerator from './ServerFirebaseGenerator'
import {ASSET_DIR} from '../shared/constants'
import lodash from 'lodash';
import {AllErrors} from "./Types";
import Tool from '../model/Tool'
import {pickBy} from 'ramda'

const {debounce} = lodash;

export type FileContents = Uint8Array | string
export interface ProjectLoader {
    getProject(): Project
}

export interface FileLoader {
    exists(dirPath: string): Promise<boolean>
    listFiles(dirPath: string): Promise<string[]>
    readFile(filePath: string): Promise<FileContents>
}

export interface FileWriter {
    writeFile(filepath: string, contents: FileContents): Promise<void>
}

export interface ServerFileWriter extends FileWriter {
    clean(): Promise<void>
    flush(): Promise<void>
}

export interface CombinedFileWriter {
    writeFiles(files: {[filepath: string]:FileContents}): Promise<void>
    clean(): Promise<void>
}

export type Properties = {
    projectLoader: ProjectLoader,
    fileLoader: FileLoader,
    projectInfoFileWriter: FileWriter,
    clientFileWriter: FileWriter,
    toolFileWriter: FileWriter,
    serverFileWriter: ServerFileWriter,
}

type FileSet = { [name: string]: string }
class FileHolder {
    private files: FileSet = {}
    private updatedFiles: { [name: string]: boolean } = {}

    storeFile(name: string, content: string) {
        if (this.files[name] !== content) {
            this.files[name] = content
            this.updatedFiles[name] = true
        }
    }

    getFiles(): FileSet {
        return {...this.files}
    }

    getUpdatedFiles(): FileSet {
        return pickBy( (_, key) => this.updatedFiles[key], this.files)
    }

    writeComplete(name: string) {
        this.updatedFiles[name] = false
    }

}

export default class ProjectBuilder {
    private readonly debouncedWriteFiles: () => Promise<void> | undefined
    private generatedProjectInfo = new FileHolder()
    private generatedClientCode = new FileHolder()
    private generatedToolCode = new FileHolder()
    private generatedServerCode = new FileHolder()
    private generatedErrors: AllErrors = {}

    constructor(private readonly props: Properties) {
        this.debouncedWriteFiles = debounce( () => this.writeProjectFiles(), 100 )
    }

    async build() {
        this.buildProjectFiles()
        const {serverFileWriter} = this.props
        if (this.project.hasServerApps) {
            await serverFileWriter.clean()
        }
        await Promise.all([this.writeProjectFiles(), this.copyAssetFiles()])
        if (this.project.hasServerApps) {
            await serverFileWriter.flush()
        }
    }

    updateProject() {
        this.buildProjectFiles()
        this.debouncedWriteFiles()
    }

    async updateAssetFile(path: string) {
        await this.copyAssetFile(path)
    }

    get code() { return {...this.generatedClientCode.getFiles(), ...this.generatedServerCode.getFiles()}}
    get errors() { return {...this.generatedErrors}}

    private get project() { return this.props.projectLoader.getProject() }

    private async writeProjectFiles() {
        const writeFiles = (fileHolder: FileHolder, fileWriter: FileWriter) => {
            const files = fileHolder.getUpdatedFiles()
            return Object.entries(files).map(([name, contents]) => {
                return fileWriter.writeFile(name, contents).then( ()=> fileHolder.writeComplete(name))
            })
        }

        const projectInfoFileWritePromises = writeFiles(this.generatedProjectInfo, this.props.projectInfoFileWriter)
        const clientFileWritePromises = writeFiles(this.generatedClientCode, this.props.clientFileWriter)
        const toolFileWritePromises = writeFiles(this.generatedToolCode, this.props.toolFileWriter)
        const serverFileWritePromises = writeFiles(this.generatedServerCode, this.props.serverFileWriter)
        await Promise.all([...projectInfoFileWritePromises, ...clientFileWritePromises, ...toolFileWritePromises, ...serverFileWritePromises])
    }

    private buildProjectFiles() {
        this.generatedErrors = {}
        const project = this.project
        const apps = project.findChildElements(App)
        this.buildProjectInfoFiles()
        apps.forEach(async (app) => this.buildClientAppFiles(app))
        const tools: Tool[] = project.findElement(TOOLS_ID)?.elements?.filter( el => el.kind === 'Tool' ) as Tool[] ?? []
        tools.forEach(async tool => this.buildToolAppFiles(tool))
        if (this.project.hasServerApps) {
            this.buildServerAppFiles()
        }
    }

    private buildProjectInfoFiles() {
        const appNames = this.project.findChildElements(App).map( el => el.codeName)
        this.generatedProjectInfo.storeFile('projectInfo.json', JSON.stringify({apps: appNames}))
    }

    private buildClientAppFiles(app: App) {
        const {code, html, errors} = generate(app, this.project)
        const appName = app.codeName + '/' + app.codeName + '.js'
        const htmlRunnerFileName = app.codeName + '/' + 'index.html'
        this.generatedClientCode.storeFile(appName, code)
        this.generatedClientCode.storeFile(htmlRunnerFileName, html)
        Object.assign(this.generatedErrors, errors)
    }

    private buildToolAppFiles(tool: Tool) {
        const {code, html, errors} = generate(tool, this.project)
        const toolName = tool.codeName + '/' + tool.codeName + '.js'
        const htmlRunnerFileName = tool.codeName + '/' + 'index.html'
        this.generatedToolCode.storeFile(toolName, code)
        this.generatedToolCode.storeFile(htmlRunnerFileName, html)
        Object.assign(this.generatedErrors, errors)
    }

    private buildServerAppFiles() {
        const {files, errors} = new ServerFirebaseGenerator(this.project).output()
        files.forEach( ({name, contents}) => this.generatedServerCode.storeFile(name, contents) )
        Object.assign(this.generatedErrors, errors)
    }

    private async copyAssetFile(filename: string) {
        const {fileLoader, clientFileWriter} = this.props
        const filepath = `${ASSET_DIR}/${filename}`
        const fileContents = await fileLoader.readFile(filepath)
        await clientFileWriter.writeFile(filepath, fileContents)
    }

    private async copyAssetFiles() {
        const filesDirExists = await this.props.fileLoader.exists(ASSET_DIR)
        if (filesDirExists) {
            const files = await this.props.fileLoader.listFiles(ASSET_DIR)
            await Promise.all(files.map( f => this.copyAssetFile(f) ))
        }
    }
}
