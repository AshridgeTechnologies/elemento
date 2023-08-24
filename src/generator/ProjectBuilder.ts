import Project, {TOOLS_ID} from '../model/Project'
import {generate} from './Generator'
import App from '../model/App'
import ServerFirebaseGenerator from './ServerFirebaseGenerator'
import {ASSET_DIR} from '../shared/constants'
import ServerApp from '../model/ServerApp'
import lodash from 'lodash';
import {AllErrors} from "./Types";
import Tool from '../model/Tool'

const {debounce} = lodash;

export type FileContents = Uint8Array | string
export interface ProjectLoader {
    getProject(): Project
}

export interface FileLoader {
    listFiles(dirPath: string): Promise<string[]>
    readFile(filePath: string): Promise<FileContents>
}

export interface RuntimeLoader {
    getFile(filename: string): Promise<string>
}

export interface FileWriter {
    writeFile(filepath: string, contents: FileContents): Promise<void>
}

export type Properties = {
    projectLoader: ProjectLoader,
    fileLoader: FileLoader,
    runtimeLoader: RuntimeLoader,
    clientFileWriter: FileWriter,
    toolFileWriter: FileWriter,
    serverFileWriter: FileWriter
}

export default class ProjectBuilder {
    private readonly debouncedWriteFiles: () => Promise<void> | undefined
    private generatedClientCode: {[name: string]: string} = {}
    private generatedToolCode: {[name: string]: string} = {}
    private generatedServerCode: {[name: string]: string} = {}
    private generatedErrors: AllErrors = {}

    constructor(private props: Properties) {
        this.debouncedWriteFiles = debounce( () => this.writeProjectFiles(), 100 )
    }

    async build() {
        return Promise.all([this.buildAndWriteProjectFiles(), this.copyAssetFiles()])
    }

    updateProject() {
        this.buildProjectFiles()
        this.debouncedWriteFiles()
    }

    async updateAssetFile(path: string) {
        await this.copyAssetFile(path)
    }

    get code() { return {...this.generatedClientCode, ...this.generatedServerCode}}
    get errors() { return {...this.generatedErrors}}

    private get project() { return this.props.projectLoader.getProject() }
    private get hasServerApps() { return this.project.findChildElements(ServerApp).length > 0 }

    private async buildAndWriteProjectFiles() {
        this.buildProjectFiles()
        await this.writeProjectFiles()
    }

    private async writeProjectFiles() {
        const clientFileWritePromises = Object.entries(this.generatedClientCode).map(([name, contents]) => this.props.clientFileWriter.writeFile(name, contents))
        const toolFileWritePromises = Object.entries(this.generatedToolCode).map(([name, contents]) => this.props.toolFileWriter.writeFile(name, contents))
        const serverFileWritePromises = Object.entries(this.generatedServerCode).map(([name, contents]) => this.props.serverFileWriter.writeFile(name, contents))
        await Promise.all([...clientFileWritePromises, ...toolFileWritePromises, ...serverFileWritePromises])
    }

    private buildProjectFiles() {
        this.generatedErrors = {}
        this.generatedClientCode = {}
        this.generatedToolCode = {}
        this.generatedServerCode = {}
        const project = this.project
        const apps = project.findChildElements(App)
        apps.forEach(async (app, index) => this.buildClientAppFiles(app))
        const tools: Tool[] = project.findElement(TOOLS_ID)?.elements?.filter( el => el.kind === 'Tool' ) as Tool[] ?? []
        tools.forEach(async tool => this.buildToolAppFiles(tool))
        if (this.hasServerApps) {
            this.buildServerAppFiles()
        }
    }

    private buildClientAppFiles(app: App) {
        const {code, html, errors} = generate(app, this.project)
        const appName = app.codeName + '/' + app.codeName + '.js'
        const htmlRunnerFileName = app.codeName + '/' + 'index.html'
        this.generatedClientCode[appName] = code
        this.generatedClientCode[htmlRunnerFileName] = html
        Object.assign(this.generatedErrors, errors)
    }

    private buildToolAppFiles(tool: Tool) {
        const {code, html, errors} = generate(tool, this.project)
        const toolName = tool.codeName + '/' + tool.codeName + '.js'
        const htmlRunnerFileName = tool.codeName + '/' + 'index.html'
        this.generatedToolCode[toolName] = code
        this.generatedToolCode[htmlRunnerFileName] = html
        Object.assign(this.generatedErrors, errors)
    }

    private buildServerAppFiles() {
        const {files, errors} = new ServerFirebaseGenerator(this.project).output()
        files.forEach( ({name, contents}) => this.generatedServerCode[name] = contents )
        Object.assign(this.generatedErrors, errors)
    }

    private async copyAssetFile(filename: string) {
        const {fileLoader, clientFileWriter} = this.props
        const filepath = `${ASSET_DIR}/${filename}`
        const fileContents = await fileLoader.readFile(filepath)
        await clientFileWriter.writeFile(filepath, fileContents)
    }

    private async copyAssetFiles() {
        const files = await this.props.fileLoader.listFiles(ASSET_DIR)
        await Promise.all(files.map( f => this.copyAssetFile(f) ))
    }

    private async copyRuntimeFiles() {
        const {runtimeLoader, clientFileWriter, serverFileWriter} = this.props
        const copyFile = (writer: FileWriter) => async (filename: string) => {
            const fileContents = await runtimeLoader.getFile(filename)
            await writer.writeFile(filename, fileContents)
        }
        const clientFileWrites = ['runtime.js', 'runtime.js.map'].map( copyFile(clientFileWriter) )
        const serverFileWrites = this.hasServerApps ? ['serverRuntime.js', 'serverRuntime.js.map'].map( copyFile(serverFileWriter) ) : []
        await Promise.all([...clientFileWrites, ...serverFileWrites])
    }
}