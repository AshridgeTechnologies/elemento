import Project from '../model/Project'
import {generate, generateServerApp} from './Generator'
import App from '../model/App'
import ServerApp from '../model/ServerApp'

export interface ProjectLoader {
    getProject(): Promise<Project>
}

export interface FileWriter {
    writeFile(filepath: string, contents: Uint8Array | string): Promise<void>
}

export default class ProjectBuilder {
    constructor(private props: {projectLoader: ProjectLoader, clientFileWriter: FileWriter, serverFileWriter: FileWriter}) {}

    async build() {
        const project = await this.props.projectLoader.getProject()
        const apps = project.findChildElements(App)
        const clientFileWrites = apps.map( async (app, index) => this.buildClientFiles(app, project, index) )
        const serverApps = project.findChildElements(ServerApp)
        const serverFileWrites = serverApps.map( async (app, index) => this.buildServerFiles(app))
        await Promise.all([...clientFileWrites, ...serverFileWrites])
    }

    private async buildClientFiles(app: App, project: Project, appIndex: number) {
        const {clientFileWriter} = this.props
        const {code, html} = generate(app, project)
        const appName = app.codeName + '.js'
        const htmlRunnerFileName = appIndex === 0 ? 'index.html' : app.codeName + '.html'
        await Promise.all([clientFileWriter.writeFile(appName, code), clientFileWriter.writeFile(htmlRunnerFileName, html)])
    }

    private async buildServerFiles(app: ServerApp) {
        const {serverFileWriter} = this.props
        const {files} = generateServerApp(app)
        await Promise.all(files.map( ({name, contents}) => serverFileWriter.writeFile(name, contents)))
    }
}