import Project from '../model/Project'
import {generate} from './Generator'
import App from '../model/App'
import ServerFirebaseGenerator from './ServerFirebaseGenerator'

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
        const serverFileWrites = this.buildServerFiles(project)
        await Promise.all([...clientFileWrites, serverFileWrites])
    }

    private async buildClientFiles(app: App, project: Project, appIndex: number) {
        const {clientFileWriter} = this.props
        const {code, html} = generate(app, project)
        const appName = app.codeName + '.js'
        const htmlRunnerFileName = appIndex === 0 ? 'index.html' : app.codeName + '.html'
        await Promise.all([clientFileWriter.writeFile(appName, code), clientFileWriter.writeFile(htmlRunnerFileName, html)])
    }

    private async buildServerFiles(project: Project) {
        const {serverFileWriter} = this.props
        const files = new ServerFirebaseGenerator(project).output().files
        await Promise.all(files.map( ({name, contents}) => serverFileWriter.writeFile(name, contents)))
    }
}