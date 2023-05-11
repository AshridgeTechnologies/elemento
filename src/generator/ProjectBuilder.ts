import Project from '../model/Project'
import {generate} from './Generator'
import App from '../model/App'
import ServerFirebaseGenerator from './ServerFirebaseGenerator'
import {ASSET_DIR} from '../shared/constants'
import ServerApp from '../model/ServerApp'
import lodash from 'lodash';
import {AllErrors} from "./Types"; const {debounce} = lodash;

export type FileContents = Uint8Array | string
export interface ProjectLoader {
    getProject(): Promise<Project>
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

type Properties = {
    projectLoader: ProjectLoader,
    fileLoader: FileLoader,
    runtimeLoader: RuntimeLoader,
    clientFileWriter: FileWriter,
    serverFileWriter: FileWriter
}

export default class ProjectBuilder {
    private readonly debouncedUpdateProject: () => Promise<void> | undefined
    private readonly generatedCode: {[name: string]: string} = {}
    private generatedErrors: AllErrors = {}
    constructor(private props: Properties) {
        this.debouncedUpdateProject = debounce( () => this.internalUpdateProject(), 100 )
    }

    async build() {
        const project = await this.props.projectLoader.getProject()
        return Promise.all([this.buildProjectFiles(project), this.copyAssetFiles(), this.copyRuntimeFiles(project)])
    }

    updateProject() {
        this.debouncedUpdateProject()
    }

    private async internalUpdateProject() {
        const project = await this.props.projectLoader.getProject()
        await this.buildProjectFiles(project)
    }

    async updateAssetFile(path: string) {
        await this.copyAssetFile(path)
    }

    get code() { return {...this.generatedCode}}
    get errors() { return {...this.generatedErrors}}

    private async buildProjectFiles(project: Project) {
        const errors: AllErrors = {}
        const hasServerApps = project.findChildElements(ServerApp).length > 0
        const apps = project.findChildElements(App)
        const clientFileWrites = apps.map(async (app, index) => this.buildAppFiles(app, project, index, errors))
        const serverFileWrites = hasServerApps ? [this.buildServerFiles(project, errors)] : []
        await Promise.all([...clientFileWrites, ...serverFileWrites])
        this.generatedErrors = errors
    }

    private async buildAppFiles(app: App, project: Project, appIndex: number, errorCollector: AllErrors) {
        const {clientFileWriter} = this.props
        const {code, html, errors} = generate(app, project)
        const appName = app.codeName + '.js'
        const htmlRunnerFileName = appIndex === 0 ? 'index.html' : app.codeName + '.html'
        this.generatedCode[appName] = code
        this.generatedCode[htmlRunnerFileName] = html
        await Promise.all([
            clientFileWriter.writeFile(appName, code),
            clientFileWriter.writeFile(htmlRunnerFileName, html),
        ])
        Object.assign(errorCollector, errors)
    }

    private async buildServerFiles(project: Project, errorCollector: AllErrors) {
        const {serverFileWriter} = this.props
        const {files, errors} = new ServerFirebaseGenerator(project).output()
        files.forEach( ({name, contents}) => this.generatedCode[name] = contents )
        await Promise.all(files.map( ({name, contents}) => serverFileWriter.writeFile(name, contents)))
        Object.assign(errorCollector, errors)
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

    private async copyRuntimeFiles(project: Project) {
        const hasServerApps = project.findChildElements(ServerApp).length > 0
        const {runtimeLoader, clientFileWriter, serverFileWriter} = this.props
        const copyFile = (writer: FileWriter) => async (filename: string) => {
            const fileContents = await runtimeLoader.getFile(filename)
            await writer.writeFile(filename, fileContents)
        }
        const clientFileWrites = ['runtime.js', 'runtime.js.map'].map( copyFile(clientFileWriter) )
        const serverFileWrites = hasServerApps ? ['serverRuntime.js', 'serverRuntime.js.map'].map( copyFile(serverFileWriter) ) : []
        await Promise.all([...clientFileWrites, ...serverFileWrites])
    }
}