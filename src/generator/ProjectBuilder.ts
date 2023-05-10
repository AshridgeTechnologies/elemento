import Project from '../model/Project'
import {generate} from './Generator'
import App from '../model/App'
import ServerFirebaseGenerator from './ServerFirebaseGenerator'
import {ASSET_DIR} from '../shared/constants'
import ServerApp from '../model/ServerApp'

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
    constructor(private props: Properties) {}

    async build() {
        const project = await this.props.projectLoader.getProject()
        const hasServerApps = project.findChildElements(ServerApp).length > 0
        const apps = project.findChildElements(App)
        const clientFileWrites = apps.map( async (app, index) => this.buildAppFiles(app, project, index) )
        const serverFileWrites = hasServerApps ? [this.buildServerFiles(project)] : []
        await Promise.all([...clientFileWrites, this.copyAssetFiles(), ...serverFileWrites, this.copyRuntimeFiles(hasServerApps)])
    }

    private async buildAppFiles(app: App, project: Project, appIndex: number) {
        const {clientFileWriter} = this.props
        const {code, html} = generate(app, project)
        const appName = app.codeName + '.js'
        const htmlRunnerFileName = appIndex === 0 ? 'index.html' : app.codeName + '.html'
        await Promise.all([
            clientFileWriter.writeFile(appName, code),
            clientFileWriter.writeFile(htmlRunnerFileName, html),
        ])
    }

    private async buildServerFiles(project: Project) {
        const {serverFileWriter} = this.props
        const files = new ServerFirebaseGenerator(project).output().files
        await Promise.all(files.map( ({name, contents}) => serverFileWriter.writeFile(name, contents)))
    }

    private async copyAssetFiles() {
        const {fileLoader, clientFileWriter} = this.props
        const files = await fileLoader.listFiles(ASSET_DIR)
        const copyFile = async (filename: string) => {
            const filepath = `${ASSET_DIR}/${filename}`
            const fileContents = await fileLoader.readFile(filepath)
            await clientFileWriter.writeFile(filepath, fileContents)
        }
        await Promise.all(files.map( copyFile ))
    }

    private async copyRuntimeFiles(hasServerApps: boolean) {
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